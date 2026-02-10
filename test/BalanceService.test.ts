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
 * Tests the following BalanceService tools:
 * - token_balances
 * - historical_token_balances
 * - historical_portfolio_value
 * - erc20_token_transfers
 * - token_holders
 * - native_token_balance
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

const HAS_GOLDRUSH_API_KEY = Boolean(process.env["GOLDRUSH_API_KEY"]);

describe.skipIf(!HAS_GOLDRUSH_API_KEY)("BalanceService Tool", () => {
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

    it("token_balances - minimal check", async () => {
        const response = await client.callTool({
            name: "token_balances",
            arguments: {
                chainName: "eth-mainnet",
                address: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
                noSpam: true,
            },
        });
        console.log("token_balances response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("historical_token_balances - minimal check", async () => {
        const response = await client.callTool({
            name: "historical_token_balances",
            arguments: {
                chainName: "eth-mainnet",
                address: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
                blockHeight: 20681357,
                noSpam: true,
            },
        });
        console.log("historical_token_balances response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("historical_portfolio_value - minimal check", async () => {
        const response = await client.callTool({
            name: "historical_portfolio_value",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
            },
        });
        console.log("historical_portfolio_value response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("erc20_token_transfers - minimal check", async () => {
        const response = await client.callTool({
            name: "erc20_token_transfers",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
                contractAddress: "0xf8C3527CC04340b208C854E985240c02F7B7793f",
                startingBlock: 20681357,
                endingBlock: 20681557,
            },
        });
        console.log("erc20_token_transfers response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("token_holders - minimal check", async () => {
        const response = await client.callTool({
            name: "token_holders",
            arguments: {
                chainName: "eth-mainnet",
                tokenAddress: "0x7ABc8A5768E6bE61A6c693a6e4EAcb5B60602C4D", // CXT
                pageSize: 1,
                pageNumber: 0,
            },
        });
        console.log("token_holders response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("native_token_balance - minimal check", async () => {
        const response = await client.callTool({
            name: "native_token_balance",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
            },
        });
        console.log("native_token_balance response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);
});
