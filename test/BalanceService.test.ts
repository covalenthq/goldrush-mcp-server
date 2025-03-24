/**
 * Test suite for the BalanceService tools implemented in src/index.ts.
 * 
 * @remarks
 * These tests rely on having GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 * 
 * @description
 * Tests the following BalanceService methods:
 * - getHistoricalPortfolioForWalletAddress
 * - getErc20TransfersForWalletAddress
 * - getErc20TransfersForWalletAddressByPage
 * - getTokenHoldersV2ForTokenAddress
 * - getTokenHoldersV2ForTokenAddressByPage
 * - getNativeTokenBalance
 *
 * Notes:
 * - We use the Vitest framework
 * - We must ensure the server is started
 * - For real tests, we need real addresses or block heights. We do minimal checks
 *   and do not do extensive validation of the returned data.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

describe("BalanceService Tools (Step #2)", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess via stdio
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "BalanceServiceTestClient",
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

    it("getHistoricalPortfolioForWalletAddress - minimal check", async () => {
        const response = await client.callTool({
            name: "getHistoricalPortfolioForWalletAddress",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "demo.eth",
            },
        });
        console.log(
            "getHistoricalPortfolioForWalletAddress response:",
            response.content
        );
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("getErc20TransfersForWalletAddress - minimal check", async () => {
        const response = await client.callTool({
            name: "getErc20TransfersForWalletAddress",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "test.eth",
                pageSize: 1,
                pageNumber: 0
            },
        });
        console.log(
            "getErc20TransfersForWalletAddress response:",
            response.content
        );
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("getErc20TransfersForWalletAddressByPage - minimal check", async () => {
        const response = await client.callTool({
            name: "getErc20TransfersForWalletAddressByPage",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "test.eth",
                pageSize: 1,
                pageNumber: 0
            },
        });
        console.log(
            "getErc20TransfersForWalletAddressByPage response:",
            response.content
        );
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("getTokenHoldersV2ForTokenAddress - minimal check", async () => {
        const response = await client.callTool({
            name: "getTokenHoldersV2ForTokenAddress",
            arguments: {
                chainName: "eth-mainnet",
                tokenAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB", // cryptopunks
                pageSize: 1,
                pageNumber: 0
            },
        });
        console.log("getTokenHoldersV2ForTokenAddress response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("getTokenHoldersV2ForTokenAddressByPage - minimal check", async () => {
        const response = await client.callTool({
            name: "getTokenHoldersV2ForTokenAddressByPage",
            arguments: {
                chainName: "eth-mainnet",
                tokenAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB", // cryptopunks
                pageSize: 1,
                pageNumber: 0,
            },
        });
        console.log(
            "getTokenHoldersV2ForTokenAddressByPage response:",
            response.content
        );
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("getNativeTokenBalance - minimal check", async () => {
        const response = await client.callTool({
            name: "getNativeTokenBalance",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "demo.eth",
            },
        });
        console.log("getNativeTokenBalance response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);
});
