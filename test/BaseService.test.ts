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
 * - gas_prices
 * - block
 * - block_heights
 * - log_events_by_address
 * - log_events_by_topic
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

const HAS_GOLDRUSH_API_KEY = Boolean(process.env["GOLDRUSH_API_KEY"]);

describe.skipIf(!HAS_GOLDRUSH_API_KEY)("BaseService Tools", () => {
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

    it("gas_prices - minimal check", async () => {
        const resp = await client.callTool({
            name: "gas_prices",
            arguments: {
                chainName: "eth-mainnet",
                eventType: "erc20",
            },
        });
        console.log("gas_prices response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("block - minimal check", async () => {
        const resp = await client.callTool({
            name: "block",
            arguments: {
                chainName: "eth-mainnet",
                blockHeight: "latest",
            },
        });
        console.log("block response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("block_heights - minimal check", async () => {
        const resp = await client.callTool({
            name: "block_heights",
            arguments: {
                chainName: "eth-mainnet",
                startDate: "2025-01-01",
                endDate: "2025-01-02",
            },
        });
        console.log("block_heights response:", resp.content);
        expect(resp.isError).toBeFalsy();
    }, 30000);

    it("log_events_by_address - minimal check", async () => {
        const resp = await client.callTool({
            name: "log_events_by_address",
            arguments: {
                chainName: "eth-mainnet",
                startingBlock: 22096686,
                endingBlock: 22098876,
                contractAddress: "0x7ABc8A5768E6bE61A6c693a6e4EAcb5B60602C4D",
            },
        });
        console.log("log_events_by_address response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);

    it("log_events_by_topic - minimal check", async () => {
        const resp = await client.callTool({
            name: "log_events_by_topic",
            arguments: {
                chainName: "eth-mainnet",
                topicHash:
                    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                startingBlock: 22096686,
                endingBlock: 22096786,
            },
        });
        console.log("log_events_by_topic response:", resp.content);
        expect(resp.isError).toBeFalsy();
        expect(resp.content).toBeDefined();
    }, 30000);
});
