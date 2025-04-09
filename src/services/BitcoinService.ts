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
        "Fetch balances for each active child address derived from a Bitcoin HD wallet.\n" +
            "This tool provides detailed balance data for Bitcoin wallets identified by an xpub key.\n" +
            "Required: walletAddress - The xpub key of the HD wallet.\n" +
            "Optional: quoteCurrency - The currency for price conversion (USD, EUR, etc).\n" +
            "Returns complete balance details including total balance, available balance, and transaction history summary.",
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
        "Used to fetch the full transaction history of a Bitcoin wallet.\n" +
            "Required: address - The Bitcoin address to query transactions for.\n" +
            "Optional: pageSize - Number of results per page (default: 10).\n" +
            "Optional: pageNumber - Page number for pagination (default: 0, first page).\n" +
            "Returns comprehensive transaction details including timestamps, amounts, and transaction IDs.",
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
        "Fetch Bitcoin balance for a non-HD address. Response includes spot prices and other metadata.\n" +
            "This tool provides detailed balance data for regular Bitcoin addresses.\n" +
            "Required: walletAddress - The Bitcoin address to query.\n" +
            "Optional: quoteCurrency - The currency for price conversion (USD, EUR, etc).\n" +
            "Returns complete balance details including total balance, available balance, and transaction count.",
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
