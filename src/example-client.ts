import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

async function tokenBalancesExample(client: Client) {
    console.log("\n=== token_balances Example ===");
    const result = await client.callTool({
        name: "token_balances",
        arguments: {
            chainName: "eth-mainnet",
            address: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
            quoteCurrency: "USD",
            nft: false,
        },
    });
    console.log("Token balances:", result.content);
}

async function historicalBalancesExample(client: Client) {
    console.log("\n=== historical_token_balances Example ===");
    const result = await client.callTool({
        name: "historical_token_balances",
        arguments: {
            chainName: "eth-mainnet",
            address: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
            quoteCurrency: "USD",
            date: "2024-01-01",
        },
    });
    console.log("Historical balances:", result.content);
}

async function transactionsExample(client: Client) {
    console.log("\n=== transactions_for_address Example ===");
    const result = await client.callTool({
        name: "transactions_for_address",
        arguments: {
            chainName: "eth-mainnet",
            walletAddress: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
            page: 0,
            quoteCurrency: "USD",
            noLogs: true,
        },
    });
    console.log("Transactions:", result.content);
}

async function specificTransactionExample(client: Client) {
    console.log("\n=== transaction Example ===");
    const result = await client.callTool({
        name: "transaction",
        arguments: {
            chainName: "eth-mainnet",
            txHash: "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060", // First DAO hack transaction
        },
    });
    console.log("Transaction details:", result.content);
}

async function poolSpotPricesExample(client: Client) {
    console.log("\n=== pool_spot_prices Example ===");
    const result = await client.callTool({
        name: "pool_spot_prices",
        arguments: {
            chainName: "eth-mainnet",
            contractAddress: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8", // Uniswap V3 USDC/ETH pool
            quoteCurrency: "USD",
        },
    });
    console.log("Pool spot prices:", result.content);
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
        await tokenBalancesExample(client);
        await historicalBalancesExample(client);
        await transactionsExample(client);
        await specificTransactionExample(client);
        await poolSpotPricesExample(client);

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
