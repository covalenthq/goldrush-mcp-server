import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Chain, ChainName, GoldRushClient } from "@covalenthq/client-sdk";
import { z } from "zod";
import { stringifyWithBigInt } from "../utils/helpers.js";

/**
 * @function addSecurityServiceTools
 * @description
 * Adds tools for the SecurityService. This includes:
 *  - getApprovals
 *  - getNftApprovals
 *
 * These calls fetch approvals for tokens and NFTs, respectively.
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 */
export function addSecurityServiceTools(server: McpServer, goldRushClient: GoldRushClient) {
    server.tool(
        "getApprovals",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string()
        },
        async (params) => {
            try {
                const response = await goldRushClient.SecurityService.getApprovals(
                    params.chainName as Chain,
                    params.walletAddress
                );
                return {
                    content: [
                        {
                            type: "text",
                            text: stringifyWithBigInt(response.data)
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getNftApprovals",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string()
        },
        async (params) => {
            try {
                const response = await goldRushClient.SecurityService.getNftApprovals(
                    params.chainName as Chain,
                    params.walletAddress
                );
                return {
                    content: [
                        {
                            type: "text",
                            text: stringifyWithBigInt(response.data)
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );
} 