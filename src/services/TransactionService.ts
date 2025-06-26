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
 * Adds tools for the TransactionService.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - transaction
 * - transaction_summary
 * - transactions_for_address
 * - transactions_for_block
 */
export function addTransactionServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "transaction",
        "Commonly used to fetch and render a single transaction including its decoded log events.\n" +
            "Required: chainName (blockchain network), txHash (transaction hash).\n" +
            "Optional: quoteCurrency (currency to convert to, USD by default), " +
            "noLogs (exclude event logs, true by default), " +
            "withInternal (include internal transactions, false by default), " +
            "withState (include state changes, false by default), " +
            "withInputData (include input data, false by default).\n" +
            "Tracing features (withInternal, withState, withInputData) supported on the following chains: eth-mainnet\n" +
            "Returns comprehensive details about the specified transaction.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            txHash: z
                .string()
                .describe(
                    "The transaction hash to get details for. Must be a valid transaction hash."
                ),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional()
                .describe(
                    "Currency to quote transaction values in (e.g., 'USD', 'EUR'). If not specified, uses default quote currency."
                ),
            noLogs: z
                .boolean()
                .optional()
                .default(true)
                .describe(
                    "Exclude event logs from the response for faster performance. Default is true."
                ),
            withInternal: z
                .boolean()
                .optional()
                .describe(
                    "Include internal transaction traces. Only supported on eth-mainnet. Default is false."
                ),
            withState: z
                .boolean()
                .optional()
                .describe(
                    "Include state changes in the response. Only supported on eth-mainnet. Default is false."
                ),
            withInputData: z
                .boolean()
                .optional()
                .describe(
                    "Include transaction input data in the response. Only supported on eth-mainnet. Default is false."
                ),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.TransactionService.getTransaction(
                        params.chainName as Chain,
                        params.txHash,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            noLogs: params.noLogs,
                            withInternal: params.withInternal,
                            withState: params.withState,
                            withInputData: params.withInputData,
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
        "transaction_summary",
        "Commonly used to fetch the earliest and latest transactions, and the transaction count for a wallet.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address).\n" +
            "Optional: quoteCurrency, withGas (include gas usage statistics).\n" +
            "Returns summary of transaction activity for the specified wallet.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            walletAddress: z
                .string()
                .describe(
                    "The wallet address to get transaction summary for. Must be a valid blockchain address."
                ),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional()
                .describe(
                    "Currency to quote transaction values in (e.g., 'USD', 'EUR'). If not specified, uses default quote currency."
                ),
            withGas: z
                .boolean()
                .optional()
                .describe(
                    "Include gas usage statistics in the summary. Default is false."
                ),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.TransactionService.getTransactionSummary(
                        params.chainName as Chain,
                        params.walletAddress,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            withGas: params.withGas,
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "transactions_for_address",
        "Commonly used to fetch and render the most recent transactions involving an address.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address), page (page number).\n" +
            "Optional: quoteCurrency, noLogs, blockSignedAtAsc (chronological order).\n" +
            "Returns transactions for the specified page of results.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            walletAddress: z
                .string()
                .describe(
                    "The wallet address to get transactions for. Must be a valid blockchain address."
                ),
            page: z
                .number()
                .describe(
                    "Page number for pagination, starting from 0. Each page contains multiple transactions."
                ),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional()
                .describe(
                    "Currency to quote transaction values in (e.g., 'USD', 'EUR'). If not specified, uses default quote currency."
                ),
            noLogs: z
                .boolean()
                .optional()
                .default(true)
                .describe(
                    "Exclude event logs from transactions for faster performance. Default is true."
                ),
            blockSignedAtAsc: z
                .boolean()
                .optional()
                .describe(
                    "Sort transactions in ascending chronological order. Default is false (newest first)."
                ),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.TransactionService.getPaginatedTransactionsForAddress(
                        params.chainName as Chain,
                        params.walletAddress,
                        params.page,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            noLogs: params.noLogs,
                            blockSignedAtAsc: params.blockSignedAtAsc,
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "transactions_for_block",
        "Commonly used to fetch all transactions including their decoded log events in a block and further flag interesting wallets or transactions.\n" +
            "Required: chainName (blockchain network), blockHeight (block number or latest).\n" +
            "Optional: quoteCurrency, noLogs (exclude event logs).\n" +
            "Returns all transactions from the specified block.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            blockHeight: z
                .union([z.string(), z.number(), z.literal("latest")])
                .describe(
                    "The block number to get transactions from. Can be a block number or 'latest' for the most recent block."
                ),
            page: z
                .number()
                .describe(
                    "Page number for pagination, starting from 0. Each page contains multiple transactions from the block."
                ),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional()
                .describe(
                    "Currency to quote transaction values in (e.g., 'USD', 'EUR'). If not specified, uses default quote currency."
                ),
            noLogs: z
                .boolean()
                .optional()
                .describe(
                    "Exclude event logs from transactions for faster performance. Default varies by implementation."
                ),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.TransactionService.getTransactionsForBlockByPage(
                        params.chainName as Chain,
                        params.blockHeight,
                        params.page,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            noLogs: params.noLogs,
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );
}
