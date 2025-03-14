import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

async function getAllChainsExample(client: Client) {
  console.log("\n=== getAllChains Example ===");
  const result = await client.callTool({
    name: "getAllChains",
    arguments: {}
  });
  console.log("Supported chains:", result.content);
}

async function tokenBalancesExample(client: Client) {
  console.log("\n=== getTokenBalancesForWalletAddress Example ===");
  const result = await client.callTool({
    name: "getTokenBalancesForWalletAddress",
    arguments: {
      chainName: "eth-mainnet",
      address: "demo.eth",
      quoteCurrency: "USD",
      nft: false
    }
  });
  console.log("Token balances:", result.content);
}

async function historicalBalancesExample(client: Client) {
  console.log("\n=== getHistoricalTokenBalancesForWalletAddress Example ===");
  const result = await client.callTool({
    name: "getHistoricalTokenBalancesForWalletAddress",
    arguments: {
      chainName: "eth-mainnet",
      address: "demo.eth",
      quoteCurrency: "USD",
      date: "2024-01-01"
    }
  });
  console.log("Historical balances:", result.content);
}

async function transactionsExample(client: Client) {
  console.log("\n=== getAllTransactionsForAddress Example ===");
  const result = await client.callTool({
    name: "getAllTransactionsForAddress",
    arguments: {
      chainName: "eth-mainnet",
      address: "demo.eth",
      quoteCurrency: "USD",
      noLogs: true
    }
  });
  console.log("Transactions:", result.content);
}

async function specificTransactionExample(client: Client) {
  console.log("\n=== getTransaction Example ===");
  const result = await client.callTool({
    name: "getTransaction",
    arguments: {
      chainName: "eth-mainnet",
      txHash: "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060" // First DAO hack transaction
    }
  });
  console.log("Transaction details:", result.content);
}

async function main() {
  console.log("Starting GoldRush MCP example client...");

  // Create a STDIO transport that starts the server as a subprocess
  const transport = new StdioClientTransport({
    command: "node",
    args: [path.resolve(process.cwd(), "dist/index.js")]
  });

  // Create an MCP client
  const client = new Client(
    {
      name: "GoldRush MCP Example Client",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  try {
    // Connect to the server
    await client.connect(transport);
    console.log("Connected to GoldRush MCP server");

    // List available tools
    const tools = await client.listTools();
    console.log("Available tools:", tools.tools.map(tool => tool.name).join(", "));

    // Run all examples
    await getAllChainsExample(client);
    await tokenBalancesExample(client);
    await historicalBalancesExample(client);
    await transactionsExample(client);
    await specificTransactionExample(client);

    console.log("\nAll examples completed successfully");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    await client.close();
    console.log("Connection closed");
  }
}

main().catch(console.error); 