/**
 * @file AllChainsService.test.ts
 * @description
 * Test suite for the AllChainsService tools implemented in src/index.ts.
 * These tests rely on having GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started. They test the
 * getMultiChainMultiAddressTransactions, getMultiChainBalances,
 * and getAddressActivity tools.
 * 
 * Key points:
 *  - We use the Vitest framework
 *  - We must ensure the server is started
 *  - For real tests, we need real addresses. Here we do minimal checks
 */

import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

describe("AllChainsService Tools", () => {
  let client: Client;

  beforeAll(async () => {
    // Start the server as a subprocess via stdio
    const transport = new StdioClientTransport({
      command: "node",
      args: [path.resolve(process.cwd(), "dist/index.js")]
    });

    client = new Client(
      {
        name: "AllChainsServiceTestClient",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Connect
    await client.connect(transport);
  }, 60000);

  it("should call getAddressActivity successfully (minimal check)", async () => {
    const response = await client.callTool({
      name: "getAddressActivity",
      arguments: {
        walletAddress: "demo.eth"
      }
    });
    // Log the full API response
    console.log("getAddressActivity response:", response.content);
    // We won't parse deeply, just ensure no error
    expect(response.isError).toBeFalsy();
    expect(response.content).toBeDefined();
    // The content is the JSON string from the Covalent API
    // For real usage we might parse and do further checks
  }, 30000);

  it("should call getMultiChainBalances successfully (minimal check)", async () => {
    const response = await client.callTool({
      name: "getMultiChainBalances",
      arguments: {
        walletAddress: "demo.eth",
        limit: 1
      }
    });
    // Log the full API response
    console.log("getMultiChainBalances response:", response.content);
    expect(response.isError).toBeFalsy();
    expect(response.content).toBeDefined();
  }, 30000);

  it("should call getMultiChainMultiAddressTransactions successfully (minimal check)", async () => {
    const response = await client.callTool({
      name: "getMultiChainMultiAddressTransactions",
      arguments: {
        addresses: ["demo.eth"],
        limit: 1
      }
    });
    // Log the full API response
    console.log("getMultiChainMultiAddressTransactions response:", response.content);
    expect(response.isError).toBeFalsy();
    expect(response.content).toBeDefined();
  }, 30000);
});