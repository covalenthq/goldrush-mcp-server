/**
 * Test suite for the TransactionService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 * @description
 * Tests the following TransactionService methods:
 * - getAllTransactionsForAddressByPage
 * - getTransactionsForBlock
 * - getTransactionSummary
 * - getTransactionsForAddressV3
 * - getTimeBucketTransactionsForAddress
 *
 * Notes:
 * - Start the server as a subprocess using StdioClientTransport
 * - For each tool, do a minimal test calling it with placeholder arguments
 * - We do minimal checks, ensuring the calls do not error out
 * - Some addresses/blocks might be placeholders
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("TransactionService Tools", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "TransactionServiceTestClient",
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

    it("getAllTransactionsForAddressByPage - minimal check", async () => {
        const resp = await client.callTool({
            name: "getAllTransactionsForAddressByPage",
            arguments: {
                chainName: "eth-mainnet",
                address: "test.eth",
            },
        });
        console.log(
            "getAllTransactionsForAddressByPage response:",
            resp.content
        );
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getTransactionsForBlock - minimal check", async () => {
        const resp = await client.callTool({
            name: "getTransactionsForBlock",
            arguments: {
                chainName: "eth-mainnet",
                blockHeight: "latest",
            },
        });
        console.log("getTransactionsForBlock response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getTransactionSummary - minimal check", async () => {
        const resp = await client.callTool({
            name: "getTransactionSummary",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "demo.eth",
            },
        });
        console.log("getTransactionSummary response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getTransactionsForAddressV3 - minimal check", async () => {
        const resp = await client.callTool({
            name: "getTransactionsForAddressV3",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "demo.eth",
                page: 0,
            },
        });
        console.log("getTransactionsForAddressV3 response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getTimeBucketTransactionsForAddress - minimal check", async () => {
        const resp = await client.callTool({
            name: "getTimeBucketTransactionsForAddress",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "demo.eth",
                timeBucket: 1863861, // example bucket
            },
        });
        console.log(
            "getTimeBucketTransactionsForAddress response:",
            resp.content
        );
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);
});
