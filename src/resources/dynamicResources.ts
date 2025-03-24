import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GoldRushClient } from "@covalenthq/client-sdk";
import { stringifyWithBigInt } from "../utils/helpers.js";

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
export function addRealTimeChainStatusResources(server: McpServer, goldRushClient: GoldRushClient) {
    // status://all-chains
    server.resource(
        "all-chains-status",
        "status://all-chains",
        async (uri) => {
            // Make a fresh call each time
            const response = await goldRushClient.BaseService.getAllChainStatus();
            return {
                contents: [{
                    uri: uri.href,
                    text: stringifyWithBigInt(response.data)
                }]
            };
        }
    );

    // status://chain/{chainName}
    const chainStatusTemplate = new ResourceTemplate("status://chain/{chainName}", { list: undefined });
    server.resource(
        "chain-status",
        chainStatusTemplate,
        async (uri, { chainName }) => {
            // For single chain, we again call getAllChainStatus
            const response = await goldRushClient.BaseService.getAllChainStatus();
            const data = response.data;
            if (!data || !data.items) {
                return {
                    contents: [{
                        uri: uri.href,
                        text: JSON.stringify({ error: "Failed to fetch chain status" }, null, 2)
                    }]
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
                    contents: [{
                        uri: uri.href,
                        text: JSON.stringify({ error: `Chain not found for: ${chainName}` }, null, 2)
                    }]
                };
            }
            return {
                contents: [{
                    uri: uri.href,
                    text: stringifyWithBigInt(chainStatus)
                }]
            };
        }
    );
} 