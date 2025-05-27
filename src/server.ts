/**
 * The main server implementation for the GoldRush MCP Server.
 *
 * This file sets up an MCP server providing tools for Covalent GoldRush services.
 */
import packageJson from "../package.json" with { type: "json" };
import { addRealTimeChainStatusResources } from "./resources/dynamicResources.js";
import { addStaticResources } from "./resources/staticResources.js";
import { addAllChainsServiceTools } from "./services/AllChainsService.js";
import { addBalanceServiceTools } from "./services/BalanceService.js";
import { addBaseServiceTools } from "./services/BaseService.js";
import { addBitcoinServiceTools } from "./services/BitcoinService.js";
import { addNftServiceTools } from "./services/NftService.js";
import { addPricingServiceTools } from "./services/PricingService.js";
import { addSecurityServiceTools } from "./services/SecurityService.js";
import { addTransactionServiceTools } from "./services/TransactionService.js";
import { GoldRushClient } from "@covalenthq/client-sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type Request, type Response } from "express";

// Get the version from the package.json file
const { version } = packageJson;

/**
 * Create and configure an MCP server instance
 */
export function createServer(apiKey: string) {
    const goldRushClient = new GoldRushClient(apiKey);
    const server = new McpServer(
        {
            name: "GoldRush MCP Server",
            version: version,
        },
        { capabilities: { logging: {} } }
    );

    // Add resources
    addStaticResources(server);
    addRealTimeChainStatusResources(server, goldRushClient);

    // Add service tools
    addAllChainsServiceTools(server, goldRushClient);
    addBaseServiceTools(server, goldRushClient);
    addBalanceServiceTools(server, goldRushClient);
    addTransactionServiceTools(server, goldRushClient);
    addBitcoinServiceTools(server, goldRushClient);
    addNftServiceTools(server, goldRushClient);
    addPricingServiceTools(server, goldRushClient);
    addSecurityServiceTools(server, goldRushClient);
    return server;
}

export function startServer() {
    const app = express();
    app.use(express.json());

    app.post("/mcp", async (req: Request, res: Response) => {
        // In stateless mode, create a new instance of transport and server for each request
        // to ensure complete isolation. A single instance would cause request ID collisions
        // when multiple clients connect concurrently.

        try {
            // Get the API key from the Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.log("Received invalid Authorization header");
                res.writeHead(401).end(
                    JSON.stringify({
                        jsonrpc: "2.0",
                        error: {
                            code: -32001,
                            message:
                                "Missing or invalid Authorization header. Expected format: Bearer <GOLDRUSH_API_KEY>",
                        },
                        id: req.body?.id || null,
                    })
                );
                return;
            }

            const apiKey = authHeader?.split(" ")[1];
            if (!apiKey || apiKey.trim() === "") {
                console.log("Received invalid API key");
                res.writeHead(401).end(
                    JSON.stringify({
                        jsonrpc: "2.0",
                        error: {
                            code: -32001,
                            message: "API key is empty or invalid",
                        },
                        id: req.body?.id || null,
                    })
                );
                return;
            }

            const server = createServer(apiKey);
            const transport: StreamableHTTPServerTransport =
                new StreamableHTTPServerTransport({
                    sessionIdGenerator: undefined,
                });
            res.on("close", () => {
                console.log("Request closed");
                transport.close();
                server.close();
            });
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error("Error handling MCP request:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32603,
                        message: "Internal server error",
                    },
                    id: null,
                });
            }
        }
    });

    app.get("/mcp", async (req: Request, res: Response) => {
        console.log("Received GET MCP request");
        res.writeHead(405).end(
            JSON.stringify({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Method not allowed.",
                },
                id: null,
            })
        );
    });

    app.delete("/mcp", async (req: Request, res: Response) => {
        console.log("Received DELETE MCP request");
        res.writeHead(405).end(
            JSON.stringify({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Method not allowed.",
                },
                id: null,
            })
        );
    });

    // Start the server
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(
            `MCP Stateless Streamable HTTP Server listening on port ${PORT}`
        );
    });

    // Handle server shutdown
    process.on("SIGINT", async () => {
        console.log("Shutting down server...");
        process.exit(0);
    });
}
