/**
 * Test suite for the PricingService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 * @description
 * Tests the following PricingService method:
 * - historical_token_prices
 * - pool_spot_prices
 *
 * Notes:
 * - We do minimal checks just to ensure that the call does not error out, as we do
 *   not have a real contract address nor a real chain to test thoroughly.
 * - Start server as a subprocess using StdioClientTransport
 * - For historical_token_prices, pass minimal valid arguments
 * - Confirm we get a non-error response
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("PricingService Tools", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess via stdio
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "PricingServiceTestClient",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        await client.connect(transport);
    }, 60000);

    it("historical_token_prices - minimal check", async () => {
        const resp = await client.callTool({
            name: "historical_token_prices",
            arguments: {
                chainName: "eth-mainnet",
                quoteCurrency: "USD",
                contractAddress: "0x7ABc8A5768E6bE61A6c693a6e4EAcb5B60602C4D", // CXT
                from: "2025-01-01",
                to: "2025-01-05",
                pricesAtAsc: true,
            },
        });

        console.log("historical_token_prices response:", resp.content);

        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("pool_spot_prices - minimal check", async () => {
        const resp = await client.callTool({
            name: "pool_spot_prices",
            arguments: {
                chainName: "eth-mainnet",
                contractAddress: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8", // Uniswap V3 USDC/ETH pool
                quoteCurrency: "USD",
            },
        });

        console.log("pool_spot_prices response:", resp.content);

        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);
});
