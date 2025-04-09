import { validQuoteValues } from "../utils/constants.js";
import { stringifyWithBigInt } from "../utils/helpers.js";
import {
    type Chain,
    ChainName,
    type GoldRushClient,
    type Quote,
} from "@covalenthq/client-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * @function addPricingServiceTools
 * @description
 * Adds tools for the PricingService.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - historical_token_prices
 */
export function addPricingServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "historical_token_prices",
        "Commonly used to get historic prices of a token between date ranges. Supports native tokens.\n" +
            "Required: chainName (blockchain network), quoteCurrency (price currency), contractAddress (token contract), from (start date YYYY-MM-DD), to (end date YYYY-MM-DD).\n" +
            "Optional: pricesAtAsc (set to true for chronological ascending order, default is false for descending order).\n" +
            "Returns historical token prices for the specified time range.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            quoteCurrency: z.enum(
                Object.values(validQuoteValues) as [string, ...string[]]
            ),
            contractAddress: z.string(),
            from: z.string(), // Making this required for MCP usage
            to: z.string(), // Making this required for MCP usage
            pricesAtAsc: z.boolean().optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.PricingService.getTokenPrices(
                        params.chainName as Chain,
                        params.quoteCurrency as Quote,
                        params.contractAddress,
                        {
                            from: params.from,
                            to: params.to,
                            pricesAtAsc: params.pricesAtAsc,
                        }
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
