/**
 * Test suite for the AllChainsService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started. They test the
 * multichain_transactions, multichain_balances,
 * and multichain_address_activity tools.
 *
 * @description
 * - We use the Vitest framework
 * - We must ensure the server is started
 * - For real tests, we need real addresses. Here we do minimal checks
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("AllChainsService Tools", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess via stdio
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "AllChainsServiceTestClient",
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

    it("should call multichain_address_activity successfully (minimal check)", async () => {
        const response = await client.callTool({
            name: "multichain_address_activity",
            arguments: {
                walletAddress: "demo.eth",
            },
        });
        // Log the full API response
        console.log("multichain_address_activity response:", response.content);
        // We won't parse deeply, just ensure no error
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
        // The content is the JSON string from the Covalent API
        // For real usage we might parse and do further checks
    }, 30000);

    it("should call multichain_balances successfully (minimal check)", async () => {
        const response = await client.callTool({
            name: "multichain_balances",
            arguments: {
                walletAddress: "demo.eth",
                limit: 1,
            },
        });
        // Log the full API response
        console.log("multichain_balances response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("should call multichain_transactions successfully (minimal check)", async () => {
        const response = await client.callTool({
            name: "multichain_transactions",
            arguments: {
                addresses: ["demo.eth"],
                limit: 1,
            },
        });
        // Log the full API response
        console.log("multichain_transactions response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);
});
