import { stringifyWithBigInt } from "../utils/helpers.js";
import {
    type Chain,
    ChainName,
    type GoldRushClient,
} from "@covalenthq/client-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * @function addSecurityServiceTools
 * @description
 * Adds tools for the SecurityService. This includes:
 *  - token_approvals
 *
 * These calls fetch approvals for tokens and NFTs, respectively.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 */
export function addSecurityServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "token_approvals",
        "Commonly used to get a list of approvals across all token contracts categorized by spenders for a wallet's assets.\n" +
            "Required: chainName (blockchain network, e.g. eth-mainnet or 1), walletAddress (wallet address, supports ENS, RNS, Lens Handle, or Unstoppable Domain).\n" +
            "Returns a list of ERC20 token approvals and their associated security risk levels.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ).describe("The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."),
            walletAddress: z.string().describe("The wallet address to get token approvals for. Supports wallet addresses, ENS, RNS, Lens Handle, or Unstoppable Domain names."),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.SecurityService.getApprovals(
                        params.chainName as Chain,
                        params.walletAddress
                    );
                return {
                    content: [
                        {
                            type: "text",
                            text: stringifyWithBigInt(response.data),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true,
                };
            }
        }
    );
}
