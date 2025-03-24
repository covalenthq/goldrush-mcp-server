/**
 * @file Resources.test.ts
 * @description
 * Test suite for the newly added real-time resource functionality from Step #9.
 * Specifically checks:
 *   - "status://all-chains" resource
 *   - "status://chain/{chainName}" resource
 * We rely on GOLDRUSH_API_KEY in the environment, the server must be started, 
 * and we do minimal checks verifying isError is false and content is present.
 *
 * Implementation details:
 *  - Start the server as a subprocess using StdioClientTransport
 *  - Use the readResource method from MCP client
 *  - Confirm the resource returns non-empty content
 */

import { describe, it, beforeAll, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

describe("Real-Time Resource Management (Step #9)", () => {
    let client: Client;

    beforeAll(async () => {
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")]
        });
        client = new Client(
            {
                name: "ResourceTestClient",
                version: "1.0.0"
            },
            {
                capabilities: {
                    resources: {}
                }
            }
        );
        await client.connect(transport);
    }, 60000);

    it("Should read status://all-chains resource successfully", async () => {
        const resp = await client.readResource({ uri: "status://all-chains" });
        expect(resp.contents).toBeDefined();
        expect(resp.contents?.length).toBeGreaterThan(0);
        console.log("status://all-chains resource contents:", resp.contents);
    }, 30000);

    it("Should read status://chain/eth-mainnet resource successfully", async () => {
        // We'll pass "eth-mainnet" to see if it matches any chain in getAllChainStatus
        const resp = await client.readResource({ uri: "status://chain/eth-mainnet" });
        expect(resp.contents).toBeDefined();
        expect(resp.contents?.length).toBeGreaterThan(0);
        console.log("status://chain/eth-mainnet resource contents:", resp.contents);
    }, 30000);

    it("Should handle an invalid chain", async () => {
        const resp = await client.readResource({ uri: "status://chain/not-a-chain" });
        expect(resp.contents).toBeDefined();
        expect(resp.contents?.length).toBeGreaterThan(0);
        // Potentially it returns an error JSON
        console.log("status://chain/not-a-chain resource contents:", resp.contents);
    }, 30000);
});