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
 *  - nft_approvals
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
        "Gets token approvals granted by a wallet that may pose security risks.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address).\n" +
            "Returns a list of ERC20 token approvals and their associated security risk levels.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
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

    server.tool(
        "nft_approvals",
        "Gets NFT approvals (setApprovalForAll) granted by a wallet that may pose security risks.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address).\n" +
            "Returns a list of NFT collection approvals and their associated security risk levels.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.SecurityService.getNftApprovals(
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
