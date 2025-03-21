/**
 * @file index.ts
 * @description
 * The main entry point for the GoldRush MCP Server. This file sets up an MCP server
 * providing tools (BaseService, BalanceService, TransactionService, and now AllChainsService)
 * and static resources. It connects with Covalent's GoldRush API using the @covalenthq/client-sdk.
 * 
 * Key Features:
 *  - Tools for AllChainsService, BaseService, BalanceService, TransactionService
 *  - Static resources listing supported chains and quote currencies
 * 
 * @notes
 *  - The GOLDRUSH_API_KEY environment variable must be set
 *  - Tools are implemented using zod for argument validation
 *  - The entire file is rewritten as part of step 1 in the plan
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Chain, ChainID, ChainName, GoldRushClient, Quote } from "@covalenthq/client-sdk";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * A type-safe Zod enum referencing valid quote currencies for Covalent/GolRush
 */
const QUOTE_VALUES = z.enum([
  "USD", "CAD", "EUR", "SGD", "INR", "JPY", "VND", "CNY", 
  "KRW", "RUB", "TRY", "NGN", "ARS", "AUD", "CHF", "GBP"
]);

/**
 * Convert QUOTE_VALUES to a TypeScript array of valid quote currency strings
 */
const validQuoteValues: readonly Quote[] = QUOTE_VALUES.options as Quote[];

// Retrieve API key from environment
const apiKey = process.env.GOLDRUSH_API_KEY;
if (!apiKey) {
  console.error("GOLDRUSH_API_KEY environment variable is not set");
  process.exit(1);
}

/**
 * Creates a Covalent GoldRush client using the provided API key
 */
const goldRushClient = new GoldRushClient(apiKey);

/**
 * Create an MCP server instance, specifying meta info
 */
const server = new McpServer({
  name: "GoldRush MCP Server",
  version: "1.0.0"
});

/**
 * Provide a static resource listing the supported Covalent chain names
 */
server.resource(
  "supported-chains",
  "config://supported-chains",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(Object.values(ChainName), null, 2)
    }]
  })
);

/**
 * Provide a static resource listing the supported Covalent quote currencies
 */
server.resource(
  "quote-currencies",
  "config://quote-currencies",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(Object.values(validQuoteValues), null, 2)
    }]
  })
);

/**
 * Add AllChainsService Tools
 */
addAllChainsServiceTools(server);

/**
 * Add BaseService Tools
 */
addBaseServiceTools(server);

/**
 * Add BalanceService Tools
 */
addBalanceServiceTools(server);

/**
 * Add TransactionService Tools
 */
addTransactionServiceTools(server);

//==================================================
//                ALL CHAINS SERVICE
//==================================================
/**
 * @function addAllChainsServiceTools
 * @description
 * Adds tools to handle Cross-Chain calls from AllChainsService:
 *  - getMultiChainMultiAddressTransactions
 *  - getMultiChainBalances
 *  - getAddressActivity
 * 
 * Each tool calls the respective method on goldRushClient.AllChainsService
 * using zod for argument validation. Returns the data as JSON.
 */
function addAllChainsServiceTools(server: McpServer) {
  /**
   * getMultiChainMultiAddressTransactions
   */
  server.tool(
    "getMultiChainMultiAddressTransactions",
    {
      // Summarized param schema
      chains: z.array(z.union([
        z.enum(Object.values(ChainName) as [string, ...string[]]),
        z.number()
      ])).optional(),
      addresses: z.array(z.string()).optional(),
      limit: z.number().optional(),
      before: z.string().optional(),
      after: z.string().optional(),
      withLogs: z.boolean().optional(),
      withDecodedLogs: z.boolean().optional(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.AllChainsService.getMultiChainMultiAddressTransactions({
          chains: params.chains as Chain[],
          addresses: params.addresses,
          limit: params.limit,
          before: params.before,
          after: params.after,
          withLogs: params.withLogs,
          withDecodedLogs: params.withDecodedLogs,
          quoteCurrency: params.quoteCurrency as Quote
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            , 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  /**
   * getMultiChainBalances
   */
  server.tool(
    "getMultiChainBalances",
    {
      walletAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      before: z.string().optional(),
      limit: z.number().optional(),
      chains: z.array(z.union([
        z.enum(Object.values(ChainName) as [string, ...string[]]),
        z.number()
      ])).optional(),
      cutoffTimestamp: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.AllChainsService.getMultiChainBalances(
          params.walletAddress,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            before: params.before,
            limit: params.limit,
            chains: params.chains as ChainID[] | ChainName[],
            cutoffTimestamp: params.cutoffTimestamp
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            , 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  /**
   * getAddressActivity
   */
  server.tool(
    "getAddressActivity",
    {
      walletAddress: z.string(),
      testnets: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.AllChainsService.getAddressActivity(
          params.walletAddress,
          { testnets: params.testnets }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            , 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );
}

//==================================================
//                BASE SERVICE
//==================================================
/**
 * @function addBaseServiceTools
 * @description
 * Adds tools for BaseService, e.g. getAllChains
 */
function addBaseServiceTools(server: McpServer) {
  server.tool(
    "getAllChains",
    {},
    async () => {
      try {
        const response = await goldRushClient.BaseService.getAllChains();
        return {
          content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );
}

//==================================================
//                BALANCE SERVICE
//==================================================
/**
 * @function addBalanceServiceTools
 * @description
 * Tools for the BalanceService, such as:
 *  - getTokenBalancesForWalletAddress
 *  - getHistoricalTokenBalancesForWalletAddress
 * (We can add more in subsequent steps.)
 */
function addBalanceServiceTools(server: McpServer) {

  // getTokenBalancesForWalletAddress
  server.tool(
    "getTokenBalancesForWalletAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      address: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      nft: z.boolean().optional(),
      noNftFetch: z.boolean().optional(),
      noSpam: z.boolean().optional(),
      noNftAssetMetadata: z.boolean().optional(),
    },
    async (params) => {
      try {
        const response = await goldRushClient.BalanceService.getTokenBalancesForWalletAddress(
          params.chainName as Chain,
          params.address,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            nft: params.nft,
            noNftFetch: params.noNftFetch,
            noSpam: params.noSpam,
            noNftAssetMetadata: params.noNftAssetMetadata,
          }
        );
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            , 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  // getHistoricalTokenBalancesForWalletAddress
  server.tool(
    "getHistoricalTokenBalancesForWalletAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      address: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      nft: z.boolean().optional(),
      noNftFetch: z.boolean().optional(),
      noSpam: z.boolean().optional(),
      noNftAssetMetadata: z.boolean().optional(),
      blockHeight: z.number().optional(),
      date: z.string().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BalanceService.getHistoricalTokenBalancesForWalletAddress(
          params.chainName as Chain,
          params.address,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            nft: params.nft,
            noNftFetch: params.noNftFetch,
            noSpam: params.noSpam,
            noNftAssetMetadata: params.noNftAssetMetadata,
            blockHeight: params.blockHeight,
            date: params.date
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            , 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );
}

//==================================================
//             TRANSACTION SERVICE
//==================================================
/**
 * @function addTransactionServiceTools
 * @description
 * Tools for the TransactionService, e.g.:
 *  - getAllTransactionsForAddress
 *  - getTransaction
 * (We can expand as needed in subsequent steps.)
 */
function addTransactionServiceTools(server: McpServer) {

  // getAllTransactionsForAddress
  server.tool(
    "getAllTransactionsForAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      address: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      noLogs: z.boolean().optional(),
      blockSignedAtAsc: z.boolean().optional(),
      withInternal: z.boolean().optional(),
      withState: z.boolean().optional(),
      withInputData: z.boolean().optional()
    },
    async (params) => {
      try {
        const transactions = [];
        const iterator = goldRushClient.TransactionService.getAllTransactionsForAddress(
          params.chainName as Chain,
          params.address,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            noLogs: params.noLogs,
            blockSignedAtAsc: params.blockSignedAtAsc,
            withInternal: params.withInternal,
            withState: params.withState,
            withInputData: params.withInputData
          }
        );
        
        // Gather all pages
        for await (const response of iterator) {
          transactions.push(...(response.data?.items || []));
        }
        
        return {
          content: [{ type: "text", text: JSON.stringify({ items: transactions }, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
          , 2) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  // getTransaction by hash
  server.tool(
    "getTransaction",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      txHash: z.string(),
    },
    async (params) => {
      try {
        const response = await goldRushClient.TransactionService.getTransaction(
          params.chainName as Chain,
          params.txHash
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            , 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );
}

/**
 * @async
 * @function startServer
 * @description
 * Initializes the server using STDIO transport for communication, logs success or failure.
 */
async function startServer() {
  console.log("Starting GoldRush MCP server (AllChainsService step 1)...");
  
  try {
    // Create the STDIO transport
    const transport = new StdioServerTransport();
    
    // Connect the server to the transport
    await server.connect(transport);
    
    console.log("GoldRush MCP server started successfully");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);