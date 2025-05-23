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
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";

// Get the version from the package.json file
const { version } = packageJson;

// Load environment variables
dotenv.config();

/**
 * Create a Covalent GoldRush client using the provided API key.
 */
export function createGoldRushClient() {
    const apiKey = process.env["GOLDRUSH_API_KEY"];
    if (!apiKey) {
        console.error("GOLDRUSH_API_KEY environment variable is not set.");
        process.exit(1);
    }
    return new GoldRushClient(apiKey);
}

/**
 * Create and configure an MCP server instance
 */
export function createServer() {
    const goldRushClient = createGoldRushClient();
    const server = new McpServer({
        name: "GoldRush MCP Server",
        version: version,
    });

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
 * Initializes the server using STDIO transport for communication.
 */
export async function startServer() {
    try {
        const server = createServer();
        const transport = new StdioServerTransport();
        await server.connect(transport);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
