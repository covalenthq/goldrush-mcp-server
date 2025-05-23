/**
 * Test suite for the SecurityService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 * @description
 * Tests the following SecurityService methods:
 * - get_token_approvals
 *
 * Notes:
 * - We do minimal checks, ensuring no error and verifying response is defined
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("SecurityService Tools", () => {
    let client: Client;

    beforeAll(async () => {
        // Launch the server as a subprocess
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "SecurityServiceTestClient",
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

    it("token_approvals - minimal check", async () => {
        const response = await client.callTool({
            name: "token_approvals",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
            },
        });
        console.log("token_approvals response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);
});
