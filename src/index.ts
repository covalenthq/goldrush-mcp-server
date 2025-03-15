import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Chain, ChainName, GoldRushClient, Quote } from "@covalenthq/client-sdk";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get the API key from environment variables
const apiKey = process.env.GOLDRUSH_API_KEY;
if (!apiKey) {
  console.error("GOLDRUSH_API_KEY environment variable is not set");
  process.exit(1);
}

// Create a GoldRush client
const goldRushClient = new GoldRushClient(apiKey);

// Create an MCP server
const server = new McpServer({
  name: "GoldRush MCP Server",
  version: "1.0.0"
});

// Add the BaseService tools
addBaseServiceTools(server);

// Add the BalanceService tools
addBalanceServiceTools(server);

// Add the TransactionService tools
addTransactionServiceTools(server);

// Helper function to add BaseService tools
function addBaseServiceTools(server: McpServer) {
  // Get all chains
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

// Helper function to add BalanceService tools
function addBalanceServiceTools(server: McpServer) {
  // Get token balances for address
  server.tool(
    "getTokenBalancesForWalletAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      address: z.string(),
      quoteCurrency: z.string().optional(),
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

  // Get historical portfolio value
  server.tool(
    "getHistoricalTokenBalancesForWalletAddress",
    {
      chainName: z.string(),
      address: z.string(),
      quoteCurrency: z.string().optional(),
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
          content: [{ type: "text", text: JSON.stringify(response.data, (_, value) =>
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
}

// Helper function to add TransactionService tools
function addTransactionServiceTools(server: McpServer) {
  // Get transactions for address
  server.tool(
    "getAllTransactionsForAddress",
    {
      chainName: z.string(),
      address: z.string(),
      quoteCurrency: z.string().optional(),
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
        
        // Option 1: Get all pages (could be a lot of data)
        for await (const response of iterator) {
          transactions.push(...response.data?.items || []);
        }
        
        return {
          content: [{ type: "text", text: JSON.stringify({ items: transactions }, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
          , 2) }]
        };
        
        // Option 2 (Alternative): Return just the first page
        // const firstPage = await iterator.next();
        // if (firstPage.done) {
        //   return {
        //     content: [{ type: "text", text: JSON.stringify({ items: [] }, null, 2) }]
        //   };
        // }
        // return {
        //   content: [{ type: "text", text: JSON.stringify(firstPage.value.data, null, 2) }]
        // };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  // Get transaction by hash
  server.tool(
    "getTransaction",
    {
      chainName: z.string(),
      txHash: z.string(),
    },
    async (params) => {
      try {
        const response = await goldRushClient.TransactionService.getTransaction(
          params.chainName as Chain,
          params.txHash
        );
        return {
          content: [{ type: "text", text: JSON.stringify(response.data, (_, value) =>
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
}

// Start the server with STDIO transport
async function startServer() {
  console.log("Starting GoldRush MCP server...");
  
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