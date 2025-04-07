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
 * - getTransaction
 * - getTransactionSummary
 * - getTransactionsForAddress
 * - getTransactionsForBlock
 */
export function addTransactionServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "getTransaction",
        "Gets detailed information about a specific transaction.\n" +
            "Required: chainName (blockchain network), txHash (transaction hash).\n" +
            "Optional: quoteCurrency (currency to convert to, USD by default), " +
            "noLogs (exclude event logs, true by default), " +
            "withInternal (include internal transactions, false by default), " +
            "withState (include state changes, false by default), " +
            "withInputData (include input data, false by default).\n" +
            "Tracing features (withInternal, withState, withInputData) supported on the following chains: eth-mainnet\n" +
            "Returns comprehensive details about the specified transaction.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            txHash: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            noLogs: z.boolean().optional().default(true),
            withInternal: z.boolean().optional(),
            withState: z.boolean().optional(),
            withInputData: z.boolean().optional(),
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
        "getTransactionSummary",
        "Gets a summary of transaction activity for a wallet address.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address).\n" +
            "Optional: quoteCurrency, withGas (include gas usage statistics).\n" +
            "Returns summary of transaction activity for the specified wallet.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            withGas: z.boolean().optional(),
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
        "getTransactionsForAddress",
        "Gets transactions for a wallet address using V3 API endpoint with specific page number.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address), page (page number).\n" +
            "Optional: quoteCurrency, noLogs, blockSignedAtAsc (chronological order).\n" +
            "Returns transactions for the specified page of results.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
            page: z.number(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            noLogs: z.boolean().optional().default(true),
            blockSignedAtAsc: z.boolean().optional(),
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
        "getTransactionsForBlock",
        "Commonly used to fetch all transactions including their decoded log events in a block and further flag interesting wallets or transactions..\n" +
            "Required: chainName (blockchain network), blockHeight (block number or latest).\n" +
            "Optional: quoteCurrency, noLogs (exclude event logs).\n" +
            "Returns all transactions from the specified block.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            blockHeight: z.union([z.string(), z.number(), z.literal("latest")]),
            page: z.number(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            noLogs: z.boolean().optional(),
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
