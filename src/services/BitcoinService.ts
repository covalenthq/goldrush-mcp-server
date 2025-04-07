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
 * - bitcoin_hd_wallet_balances
 * - bitcoin_transactions
 * - bitcoin_non_hd_wallet_balances
 */
export function addBitcoinServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "bitcoin_hd_wallet_balances",
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
        "bitcoin_transactions",
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
        "bitcoin_non_hd_wallet_balances",
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
