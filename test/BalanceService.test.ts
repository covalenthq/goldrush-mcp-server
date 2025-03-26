/**
 * Test suite for the BalanceService tools implemented in src/index.ts.
 *
 *
 * @remarks
 * These tests rely on having GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
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
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("BalanceService Tool", () => {
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
                walletAddress: "demo.eth",
                contractAddress: "0xf8C3527CC04340b208C854E985240c02F7B7793f",
                startingBlock: 20681357,
                endingBlock: 20681557,
                pageSize: 1,
                pageNumber: 0,
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
                walletAddress: "demo.eth",
                contractAddress: "0xf8C3527CC04340b208C854E985240c02F7B7793f",
                pageSize: 1,
                pageNumber: 0,
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
                tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
                pageNumber: 0,
            },
        });
        console.log(
            "getTokenHoldersV2ForTokenAddress response:",
            response.content
        );
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("getTokenHoldersV2ForTokenAddressByPage - minimal check", async () => {
        const response = await client.callTool({
            name: "getTokenHoldersV2ForTokenAddressByPage",
            arguments: {
                chainName: "eth-mainnet",
                tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
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
