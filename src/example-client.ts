import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

async function getAllChainsExample(client: Client) {
    console.log("\n=== getAllChains Example ===");
    const result = await client.callTool({
        name: "getAllChains",
        arguments: {},
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
            nft: false,
        },
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
            date: "2024-01-01",
        },
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
            noLogs: true,
        },
    });
    console.log("Transactions:", result.content);
}

async function specificTransactionExample(client: Client) {
    console.log("\n=== getTransaction Example ===");
    const result = await client.callTool({
        name: "getTransaction",
        arguments: {
            chainName: "eth-mainnet",
            txHash: "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060", // First DAO hack transaction
        },
    });
    console.log("Transaction details:", result.content);
}

async function getSupportedChainsResourceExample(client: Client) {
    console.log("\n=== supported-chains Resource Example ===");
    const result = await client.readResource({
        uri: "config://supported-chains",
    });

    if (
        result.contents &&
        result.contents.length > 0 &&
        result.contents[0] &&
        "text" in result.contents[0]
    ) {
        const chains = JSON.parse(result.contents[0].text as string);
        console.log("Supported chains from resource:", chains);
    } else {
        console.log("No content found in supported-chains resource");
    }
}

async function getQuoteCurrenciesResourceExample(client: Client) {
    console.log("\n=== quote-currencies Resource Example ===");
    const result = await client.readResource({
        uri: "config://quote-currencies",
    });

    if (
        result.contents &&
        result.contents.length > 0 &&
        result.contents[0] &&
        "text" in result.contents[0]
    ) {
        const currencies = JSON.parse(result.contents[0].text as string);
        console.log("Supported quote currencies from resource:", currencies);
    } else {
        console.log("No content found in quote-currencies resource");
    }
}

async function main() {
    // Create a STDIO transport that starts the server as a subprocess
    const transport = new StdioClientTransport({
        command: "node",
        args: [path.resolve(process.cwd(), "dist/index.js")],
    });

    // Create an MCP client
    const client = new Client(
        {
            name: "GoldRush MCP Example Client",
            version: "1.0.0",
        },
        {
            capabilities: {
                tools: {},
                resources: {}, // Add resources capability
            },
        }
    );

    try {
        // Connect to the server
        await client.connect(transport);

        // List available tools
        const tools = await client.listTools();
        console.log(
            "Available tools:",
            tools.tools.map((tool) => tool.name).join(", ")
        );

        // List available resources
        const resources = await client.listResources();
        console.log(
            "Available resources:",
            resources.resources.map((resource) => resource.name).join(", ")
        );

        // Run all examples
        await getAllChainsExample(client);
        await tokenBalancesExample(client);
        await historicalBalancesExample(client);
        await transactionsExample(client);
        await specificTransactionExample(client);

        // Run resource examples
        await getSupportedChainsResourceExample(client);
        await getQuoteCurrenciesResourceExample(client);

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
