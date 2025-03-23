/**
 * @file SecurityService.test.ts
 * @description
 * Test suite for the SecurityService tools implemented in src/index.ts for Step #7.
 * We test:
 *   - getApprovals
 *   - getNftApprovals
 *
 * Usage:
 *  - Requires GOLDRUSH_API_KEY environment variable set
 *  - The server must be started
 *
 * We do minimal checks, ensuring no error and verifying response is defined.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

describe("SecurityService Tools (Step #7)", () => {
    let client: Client;

    beforeAll(async () => {
        // Launch the server as a subprocess
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")]
        });

        client = new Client(
            {
                name: "SecurityServiceTestClient",
                version: "1.0.0"
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        await client.connect(transport);
    }, 60000);

    it("getApprovals - minimal check", async () => {
        const response = await client.callTool({
            name: "getApprovals",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "demo.eth"
            }
        });
        console.log("getApprovals response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);

    it("getNftApprovals - minimal check", async () => {
        const response = await client.callTool({
            name: "getNftApprovals",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "demo.eth"
            }
        });
        console.log("getNftApprovals response:", response.content);
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
    }, 30000);
});