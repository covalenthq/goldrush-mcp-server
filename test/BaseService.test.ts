/**
 * Test suite for the BaseService tools implemented in src/index.ts.
 *
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 *
 * @description
 * Tests the following BaseService methods:
 * - getGasPrices
 * - getBlock
 * - getResolvedAddress
 * - getBlockHeights
 * - getLogs
 * - getLogEventsByAddress
 * - getLogEventsByTopicHash
 *
 * Notes:
 * - We use the Vitest framework
 * - Must ensure the server is started
 * - We do minimal checks for the returned data. We rely on the calls not erroring.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("BaseService Tools", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess via stdio
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "BaseServiceTestClient",
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

    it("getGasPrices - minimal check", async () => {
        const resp = await client.callTool({
            name: "getGasPrices",
            arguments: {
                chainName: "eth-mainnet",
                eventType: "erc20",
            },
        });
        console.log("getGasPrices response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getBlock - minimal check", async () => {
        const resp = await client.callTool({
            name: "getBlock",
            arguments: {
                chainName: "eth-mainnet",
                blockHeight: "latest",
            },
        });
        console.log("getBlock response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getResolvedAddress - minimal check", async () => {
        const resp = await client.callTool({
            name: "getResolvedAddress",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "demo.eth",
            },
        });
        console.log("getResolvedAddress response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getBlockHeights - minimal check", async () => {
        const resp = await client.callTool({
            name: "getBlockHeights",
            arguments: {
                chainName: "eth-mainnet",
                startDate: "2025-01-01",
                endDate: "2025-01-02",
            },
        });
        console.log("getBlockHeights (all pages) response:", resp.content);
        expect(resp.isError).toBeFalsy();
    }, 30000);

    it("getLogs - minimal check", async () => {
        const resp = await client.callTool({
            name: "getLogs",
            arguments: {
                chainName: "eth-mainnet",
                startingBlock: 22096686,
                endingBlock: 22098876,
                address: "0x7ABc8A5768E6bE61A6c693a6e4EAcb5B60602C4D",
                topics: "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
            },
        });
        console.log("getLogs response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getLogEventsByAddress - minimal check", async () => {
        const resp = await client.callTool({
            name: "getLogEventsByAddress",
            arguments: {
                chainName: "eth-mainnet",
                startingBlock: 22096686,
                endingBlock: 22098876,
                contractAddress: "0x7ABc8A5768E6bE61A6c693a6e4EAcb5B60602C4D",
            },
        });
        console.log("getLogEventsByAddress response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("getLogEventsByTopicHash - minimal check", async () => {
        const resp = await client.callTool({
            name: "getLogEventsByTopicHash",
            arguments: {
                chainName: "eth-mainnet",
                topicHash:
                    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                startingBlock: 22096686,
                endingBlock: 22096786,
            },
        });
        console.log("getLogEventsByTopicHash response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);
});
