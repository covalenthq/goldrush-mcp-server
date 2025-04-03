import { validQuoteValues } from "../utils/constants.js";
import { stringifyWithBigInt } from "../utils/helpers.js";
import type { GoldRushClient, Quote } from "@covalenthq/client-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * @function addBitcoinServiceTools
 * @description
 * Adds tools for the BitcoinService.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - getBitcoinHdWalletBalances
 * - getTransactionsForBtcAddress
 * - getBitcoinNonHdWalletBalances
 */
export function addBitcoinServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "getBitcoinHdWalletBalances",
        "Gets balances for a Bitcoin Hierarchical Deterministic (HD) wallet address (xpub).\n" +
            "Required: walletAddress (Bitcoin xpub).\n" +
            "Optional: quoteCurrency (USD, EUR, etc).\n" +
            "Returns balance information for the specified Bitcoin HD wallet.",
        {
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BitcoinService.getBitcoinHdWalletBalances(
                        params.walletAddress,
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

    server.tool(
        "getTransactionsForBtcAddress",
        "Gets transactions for a standard (non-HD) Bitcoin address.\n" +
            "Required: address (Bitcoin address).\n" +
            "Optional: pageNumber, pageSize (pagination parameters).\n" +
            "Returns transactions for the specified Bitcoin address.",
        {
            address: z.string(),
            pageSize: z.number().optional().default(10),
            pageNumber: z.number().optional().default(0),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BitcoinService.getTransactionsForBtcAddress(
                        {
                            address: params.address,
                            pageSize: params.pageSize,
                            pageNumber: params.pageNumber,
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
        "getBitcoinNonHdWalletBalances",
        "Gets balances for a standard (non-HD) Bitcoin address.\n" +
            "Required: walletAddress (Bitcoin address).\n" +
            "Optional: quoteCurrency (USD, EUR, etc).\n" +
            "Returns balance information for the specified Bitcoin address.",
        {
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BitcoinService.getBitcoinNonHdWalletBalances(
                        params.walletAddress,
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
