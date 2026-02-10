/**
 * Test suite for the NftService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 * @description
 * Tests the following NftService methods:
 * - nft_for_address
 * - nft_check_ownership
 *
 * Notes:
 * - Start server as a subprocess using StdioClientTransport
 * - For each tool, do a minimal test calling it with placeholder or minimal arguments
 * - We do not do extensive validation, we just confirm isError is false
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("NftService Tools", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess via stdio
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "NftServiceTestClient",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Connect
        await client.connect(transport);
    }, 60000);

    it("getNftsForAddress - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_for_address",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "sovpunk.eth",
            },
        });
        console.log("nft_for_address result:", result.content);
        expect(result.isError).toBeFalsy();
    }, 30000);

    it("checkOwnershipInNft - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_check_ownership",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
            },
        });
        console.log("nft_check_ownership result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);
});
