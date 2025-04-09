/**
 * Test suite for the BitcoinService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 * @description
 * Tests the following BitcoinService methods:
 * - bitcoin_hd_wallet_balances
 * - bitcoin_transactions
 * - bitcoin_non_hd_wallet_balances
 *
 * Notes:
 * - We use the Vitest framework
 * - We must ensure the server is started
 * - The addresses used are placeholders ("demo" or "dummy"), so we only do
 *   minimal checks to ensure no error is returned. In real usage, the user
 *   would pass real xpub/ypub or real BTC address.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("BitcoinService Tools", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess via stdio
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "BitcoinServiceTestClient",
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

    it("bitcoin_hd_wallet_balances - minimal check", async () => {
        const response = await client.callTool({
            name: "bitcoin_hd_wallet_balances",
            arguments: {
                walletAddress: "bc1qxjpqzt38xwh09x34dgjn4jtnw2vus82p88haqp",
            },
        });
        console.log("bitcoin_hd_wallet_balances response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("bitcoin_transactions - minimal check", async () => {
        const response = await client.callTool({
            name: "bitcoin_transactions",
            arguments: {
                address: "bc1qxjpqzt38xwh09x34dgjn4jtnw2vus82p88haqp",
                pageSize: 10,
                pageNumber: 0,
            },
        });
        console.log("bitcoin_transactions response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("bitcoin_non_hd_wallet_balances - minimal check", async () => {
        const response = await client.callTool({
            name: "bitcoin_non_hd_wallet_balances",
            arguments: {
                walletAddress: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo",
            },
        });
        console.log(
            "bitcoin_non_hd_wallet_balances response:",
            response.content
        );
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);
});
