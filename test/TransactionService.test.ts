/**
 * Test suite for the TransactionService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 * @description
 * Tests the following TransactionService methods:
 * - transaction
 * - transaction_summary
 * - transactions_for_address
 * - transactions_for_block
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

const HAS_GOLDRUSH_API_KEY = Boolean(process.env["GOLDRUSH_API_KEY"]);

describe.skipIf(!HAS_GOLDRUSH_API_KEY)("TransactionService Tools", () => {
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

    it("transaction - minimal check", async () => {
        const resp = await client.callTool({
            name: "transaction",
            arguments: {
                chainName: "eth-mainnet",
                txHash: "0x0404ea4101e1256169b04cb2374e8eb179ddc690a55661cd40a9ec589b9548f8",
            },
        });
        console.log("transaction response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("transaction_summary - minimal check", async () => {
        const resp = await client.callTool({
            name: "transaction_summary",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
            },
        });
        console.log("transaction_summary response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("transactions_for_address - minimal check", async () => {
        const resp = await client.callTool({
            name: "transactions_for_address",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
                page: 0,
            },
        });
        console.log("transactions_for_address response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("transactions_for_block - minimal check", async () => {
        const resp = await client.callTool({
            name: "transactions_for_block",
            arguments: {
                chainName: "eth-mainnet",
                blockHeight: "latest",
                page: 0,
            },
        });
        console.log("transactions_for_block response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);
});
