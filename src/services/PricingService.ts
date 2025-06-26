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
 * - pool_spot_prices
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
            ).describe("The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."),
            quoteCurrency: z.enum(
                Object.values(validQuoteValues) as [string, ...string[]]
            ).describe("Currency to quote token prices in (e.g., 'USD', 'EUR'). This determines the currency for historical price data."),
            contractAddress: z.string().describe("The token contract address to get historical prices for. Use the native token address for native token prices."),
            from: z.string().describe("Start date for historical price data in YYYY-MM-DD format (e.g., '2023-01-01')."),
            to: z.string().describe("End date for historical price data in YYYY-MM-DD format (e.g., '2023-12-31')."),
            pricesAtAsc: z.boolean().optional().describe("Sort prices in ascending chronological order. Default is false (descending order, newest first)."),
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

    server.tool(
        "pool_spot_prices",
        "Get the spot token pair prices for a specified pool contract address. Supports pools on Uniswap V2, V3 and their forks.\n" +
            "Required: chainName (blockchain network), contractAddress (pool contract address).\n" +
            "Optional: quoteCurrency (price currency) for value conversion.\n" +
            "Returns spot token pair prices with pool details and token metadata.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ).describe("The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."),
            contractAddress: z.string().describe("The liquidity pool contract address to get spot prices for. Must be a valid Uniswap V2/V3 or compatible DEX pool address."),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional()
                .describe("Currency to quote pool token values in (e.g., 'USD', 'EUR'). If not specified, uses default quote currency."),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.PricingService.getPoolSpotPrices(
                        params.chainName as Chain,
                        params.contractAddress,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
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
