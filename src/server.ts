/**
 * Unified server implementation for the GoldRush MCP Server.
 *
 * This file sets up an MCP server providing tools for Covalent GoldRush services
 * with support for multiple transport options: STDIO and HTTP.
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
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";

// Load environment variables
dotenv.config();

// Get the version from the package.json file
const { version } = packageJson;

// Transport types
type TransportType = "stdio" | "http";

// Default configuration
const DEFAULT_PORT = 3000;

/**
 * Create a Covalent GoldRush client using the provided API key or environment variable.
 */
export function createGoldRushClient(apiKey?: string) {
    const key = apiKey || process.env["GOLDRUSH_API_KEY"];
    if (!key) {
        throw new Error(
            "GOLDRUSH_API_KEY is required. Provide it as a parameter or set the environment variable."
        );
    }
    return new GoldRushClient(key);
}

/**
 * Create and configure an MCP server instance
 */
export function createServer(apiKey?: string) {
    const goldRushClient = createGoldRushClient(apiKey);
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

/**
 * Start the server with STDIO transport
 */
export async function startStdioServer(apiKey?: string) {
    try {
        const server = createServer(apiKey);
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.log("MCP Server started with STDIO transport");
    } catch (error) {
        console.error("Failed to start STDIO server:", error);
        process.exit(1);
    }
}

/**
 * Start the server with HTTP transport
 */
export function startHttpServer(port: number = DEFAULT_PORT) {
    const app = express();
    app.use(express.json());

    app.post("/mcp", async (req: Request, res: Response) => {
        // In stateless mode, create a new instance of transport and server for each request
        // to ensure complete isolation. A single instance would cause request ID collisions
        // when multiple clients connect concurrently.

        try {
            // Get the API key from the Authorization header
            const authHeader = req.headers.authorization;
            const requestId = (() => {
                try {
                    return req.body?.id || null;
                } catch {
                    return null;
                }
            })();
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
                        id: requestId,
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
                        id: requestId,
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
    app.listen(port, () => {
        console.log(`MCP Streamable HTTP Server listening on port ${port}`);
    });

    // Handle server shutdown
    process.on("SIGINT", async () => {
        console.log("Shutting down HTTP server...");
        process.exit(0);
    });
}

/**
 * Start the server with the specified transport type
 */
export async function startServer(
    transportType: TransportType = "stdio",
    options: { port?: number; apiKey?: string } = {}
) {
    const { port = DEFAULT_PORT, apiKey } = options;

    switch (transportType) {
        case "stdio":
            await startStdioServer(apiKey);
            break;
        case "http":
            startHttpServer(port);
            break;
        default:
            throw new Error(`Unsupported transport type: ${transportType}`);
    }
}

/**
 * Parse command line arguments and start the server
 */
export function parseArgsAndStart() {
    const args = process.argv.slice(2);
    let transportType: TransportType = "stdio";
    let port = DEFAULT_PORT;
    let apiKey: string | undefined;

    // Simple argument parsing
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case "--transport":
            case "-t": {
                const transport = args[i + 1];
                if (!transport) {
                    console.error("Transport type is required");
                    process.exit(1);
                }
                if (transport === "stdio" || transport === "http") {
                    transportType = transport;
                    i++; // Skip next argument
                } else {
                    console.error(
                        `Invalid transport type: ${transport}. Supported: stdio, http`
                    );
                    process.exit(1);
                }
                break;
            }
            case "--port":
            case "-p": {
                const portStr = args[i + 1];
                if (!portStr) {
                    console.error("Port value is required");
                    process.exit(1);
                }
                const parsedPort = parseInt(portStr, 10);
                if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
                    console.error(`Invalid port: ${portStr}`);
                    process.exit(1);
                }
                port = parsedPort;
                i++; // Skip next argument
                break;
            }
            case "--api-key":
            case "-k": {
                const keyValue = args[i + 1];
                if (!keyValue) {
                    console.error("API key cannot be empty");
                    process.exit(1);
                }
                apiKey = keyValue;
                i++; // Skip next argument
                break;
            }
            case "--help":
            case "-h":
                console.log(`
GoldRush MCP Server v${version}

Usage: goldrush-mcp-server [options]

Options:
  -t, --transport <type>    Transport type: stdio (default) or http
  -p, --port <number>       Port for HTTP transport (default: ${DEFAULT_PORT})
  -k, --api-key <key>       GoldRush API key (or set GOLDRUSH_API_KEY env var)
  -h, --help                Show this help message

Examples:
  goldrush-mcp-server                           # STDIO transport
  goldrush-mcp-server -t http                   # HTTP transport on default port
  goldrush-mcp-server -t http -p 8080           # HTTP transport on port 8080
  goldrush-mcp-server -k your_api_key          # With API key argument
`);
                process.exit(0);
                break;
        }
    }

    // Start the server
    startServer(transportType, { port, apiKey }).catch((error) => {
        console.error("Failed to start server:", error);
        process.exit(1);
    });
}
