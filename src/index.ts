/**
 * The main entry point for the GoldRush MCP Server.
 *
 * This file sets up an MCP server providing tools for Covalent GoldRush services:
 * - AllChainsService
 * - BaseService
 * - BalanceService
 * - TransactionService
 * - BitcoinService
 * - NftService
 * - PricingService
 * - SecurityService
 *
 * It also provides static and dynamic resources:
 * - "config://supported-chains"
 * - "config://quote-currencies"
 * - "status://all-chains" (dynamic, calls getAllChainStatus from BaseService)
 * - "status://chain/{chainName}" (dynamic, calls getAllChainStatus and filters for a single chain)
 *
 * @remarks
 * Key Features:
 * - Tools coverage for the listed Covalent services
 * - Resources for real-time data (no caching) about chain statuses
 * - Environment-driven GOLDRUSH_API_KEY
 *
 * @notes
 * - The GOLDRUSH_API_KEY environment variable must be set
 * - Tools are implemented using zod for argument validation
 * - Each tool returns Covalent response as JSON text
 * - For resources, we do not cache any data; each call to the resource triggers a fresh Covalent API call
 */
import { addRealTimeChainStatusResources } from "./resources/dynamicResources.js";
// Import resources
import { addStaticResources } from "./resources/staticResources.js";
// Import service tools
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

// Load environment variables
dotenv.config();

/**
 * Retrieve API key from environment
 */
const apiKey = process.env["GOLDRUSH_API_KEY"];
if (!apiKey) {
    console.error("GOLDRUSH_API_KEY environment variable is not set.");
    process.exit(1);
}

/**
 * Create a Covalent GoldRush client using the provided API key.
 */
const goldRushClient = new GoldRushClient(apiKey);

/**
 * Create an MCP server instance, specifying meta info.
 */
const server = new McpServer({
    name: "GoldRush MCP Server",
    version: "1.0.0",
});

/**
 * Initialize all relevant Covalent-based tools and resources.
 */
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

/**
 * Initializes the server using STDIO transport for communication.
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If server fails to start
 * @remarks
 * Logs success or failure to the console.
 */
async function startServer() {
    try {
        // Create the STDIO transport
        const transport = new StdioServerTransport();

        // Connect the server to the transport
        await server.connect(transport);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

// Start the server
startServer().catch(console.error);
