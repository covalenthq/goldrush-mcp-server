import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

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

    // Call the getAllChains tool
    console.log("Calling getAllChains tool...");
    const allChainsResult = await client.callTool({
      name: "getAllChains",
      arguments: {}
    });
    console.log("Supported chains:", allChainsResult.content);

    console.log("Example completed successfully");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    await client.close();
    console.log("Connection closed");
  }
}

main().catch(console.error); 