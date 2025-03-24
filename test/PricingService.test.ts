/**
 * Test suite for the PricingService tools implemented in src/index.ts.
 * 
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 * 
 * @description
 * Tests the following PricingService method:
 * - getTokenPrices
 *
 * Notes:
 * - We do minimal checks just to ensure that the call does not error out, as we do
 *   not have a real contract address nor a real chain to test thoroughly.
 * - Start server as a subprocess using StdioClientTransport
 * - For getTokenPrices, pass minimal valid arguments
 * - Confirm we get a non-error response
 */

import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

describe("PricingService Tools (Step #6)", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess via stdio
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")]
        });

        client = new Client(
            {
                name: "PricingServiceTestClient",
                version: "1.0.0"
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        await client.connect(transport);
    }, 60000);

    it("getTokenPrices - minimal check", async () => {
        const resp = await client.callTool({
            name: "getTokenPrices",
            arguments: {
                chainName: "eth-mainnet",
                quoteCurrency: "USD",
                contractAddress: "0x7ABc8A5768E6bE61A6c693a6e4EAcb5B60602C4D", // CXT
                from: "2025-01-01",
                to: "2025-01-05",
                pricesAtAsc: true
            }
        });

        console.log("getTokenPrices response:", resp.content);

        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);
});