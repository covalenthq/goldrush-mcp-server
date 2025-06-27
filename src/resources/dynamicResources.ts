import { stringifyWithBigInt } from "../utils/helpers.js";
import type { GoldRushClient } from "@covalenthq/client-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * @function addRealTimeChainStatusResources
 * @description
 * Adds dynamic resources that provide real-time chain status data with no caching.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates resources:
 * - "status://all-chains" - Fetches from BaseService.getAllChainStatus()
 * - "status://chain/{chainName}" - Calls getAllChainStatus() and filters for the specified chain
 *
 * This approach ensures no caching is done, as a fresh API call is made for each resource request.
 */
export function addRealTimeChainStatusResources(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    // status://all-chains
    server.registerResource(
        "all-chains-status",
        "status://all-chains",
        {
            title: "All Chains Status",
            description: "All chains status",
            mimeType: "application/json",
        },
        async (): Promise<ReadResourceResult> => {
            // Make a fresh call each time
            const response =
                await goldRushClient.BaseService.getAllChainStatus();
            return {
                contents: [
                    {
                        uri: "status://all-chains",
                        text: stringifyWithBigInt(response.data),
                    },
                ],
            };
        }
    );

    server.resource(
        "chain-status",
        new ResourceTemplate("status://chain/{chainName}", { list: undefined }),
        {
            title: "Chain Status",
            description: "Chain status",
            mimeType: "application/json",
        },
        async (uri, { chainName }): Promise<ReadResourceResult> => {
            // For single chain, we again call getAllChainStatus
            const response =
                await goldRushClient.BaseService.getAllChainStatus();
            const data = response.data;
            if (!data || !data.items) {
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify(
                                { error: "Failed to fetch chain status" },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }
            const items = data.items || [];
            // Filter for the given chainName if found
            const chainStatus = items.find((x: any) => {
                // x.name is the chain name e.g. "eth-mainnet"
                // x.chain_id is the chain ID e.g. 1
                // We'll handle numeric or string match
                if (x.name === chainName) {
                    return true;
                }
                // If chainName is numeric, maybe compare chain_id
                if (!isNaN(Number(chainName))) {
                    return x.chain_id === Number(chainName);
                }
                return false;
            });
            if (!chainStatus) {
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify(
                                { error: `Chain not found for: ${chainName}` },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }
            return {
                contents: [
                    {
                        uri: uri.href,
                        text: stringifyWithBigInt(chainStatus),
                    },
                ],
            };
        }
    );
}
