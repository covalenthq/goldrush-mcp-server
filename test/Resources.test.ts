/**
 * Test suite for the real-time resource functionality.
 * 
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 * 
 * @description
 * Tests the following resources:
 * - "status://all-chains" resource
 * - "status://chain/{chainName}" resource
 * - "config://supported-chains" resource
 * - "config://quote-currencies" resource
 *
 * Notes:
 * - Start the server as a subprocess using StdioClientTransport
 * - Use the readResource method from MCP client
 * - Confirm the resource returns non-empty content
 * - We do minimal checks verifying isError is false and content is present
 */

import { describe, it, beforeAll, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

describe("Resources", () => {
    let client: Client;

    beforeAll(async () => {
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")]
        });
        client = new Client(
            {
                name: "ResourceTestClient",
                version: "1.0.0"
            },
            {
                capabilities: {
                    resources: {}
                }
            }
        );
        await client.connect(transport);
    }, 60000);

    it("Should read status://all-chains resource successfully", async () => {
        const resp = await client.readResource({ uri: "status://all-chains" });
        expect(resp.contents).toBeDefined();
        expect(resp.contents?.length).toBeGreaterThan(0);
        console.log("status://all-chains resource contents:", resp.contents);
    }, 30000);

    it("Should read status://chain/eth-mainnet resource successfully", async () => {
        // We'll pass "eth-mainnet" to see if it matches any chain in getAllChainStatus
        const resp = await client.readResource({ uri: "status://chain/eth-mainnet" });
        expect(resp.contents).toBeDefined();
        expect(resp.contents?.length).toBeGreaterThan(0);
        console.log("status://chain/eth-mainnet resource contents:", resp.contents);
    }, 30000);

    it("Should handle an invalid chain", async () => {
        const resp = await client.readResource({ uri: "status://chain/not-a-chain" });
        expect(resp.contents).toBeDefined();
        expect(resp.contents?.length).toBeGreaterThan(0);
        // Potentially it returns an error JSON
        console.log("status://chain/not-a-chain resource contents:", resp.contents);
    }, 30000);

    it("Should read config://supported-chains resource successfully", async () => {
        const resp = await client.readResource({ uri: "config://supported-chains" });
        expect(resp.contents).toBeDefined();
        expect(resp.contents?.length).toBeGreaterThan(0);
        
        // Parse the JSON to verify it's a valid array of chain names
        const content = resp.contents?.[0]?.text;
        expect(content).toBeDefined();
        
        const chainNames = JSON.parse(content as string);
        expect(Array.isArray(chainNames)).toBe(true);
        expect(chainNames.length).toBeGreaterThan(0);
        
        // Ethereum mainnet should be in the supported chains
        expect(chainNames).toContain("eth-mainnet");
        
        console.log("config://supported-chains resource contents:", chainNames.slice(0, 5), "...");
    }, 30000);

    it("Should read config://quote-currencies resource successfully", async () => {
        const resp = await client.readResource({ uri: "config://quote-currencies" });
        expect(resp.contents).toBeDefined();
        expect(resp.contents?.length).toBeGreaterThan(0);
        
        // Parse the JSON to verify it's a valid array of quote currencies
        const content = resp.contents?.[0]?.text;
        expect(content).toBeDefined();
        
        const quoteCurrencies = JSON.parse(content as string);
        expect(Array.isArray(quoteCurrencies)).toBe(true);
        expect(quoteCurrencies.length).toBeGreaterThan(0);
        
        // USD should be in the supported quote currencies
        expect(quoteCurrencies).toContain("USD");
        
        console.log("config://quote-currencies resource contents:", quoteCurrencies);
    }, 30000);
});