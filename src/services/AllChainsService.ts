import { validQuoteValues } from "../utils/constants.js";
import { stringifyWithBigInt } from "../utils/helpers.js";
import {
    type Chain,
    type ChainID,
    ChainName,
    type GoldRushClient,
    type Quote,
} from "@covalenthq/client-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Adds tools for Cross-Chain calls (AllChainsService).
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - multichain_transactions
 * - multichain_balances
 * - multichain_address_activity
 */
export function addAllChainsServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "multichain_transactions",
        "Fetch paginated transactions for up to 10 EVM addresses and 10 EVM chains with one API call. Useful for building Activity Feeds. " +
            "Requires addresses array. Optional parameters include chains array, " +
            "pagination (before/after), limit (default 10), quoteCurrency for value conversion, " +
            "and options to include logs (withLogs, withDecodedLogs). " +
            "Use this to analyze transaction history across different networks simultaneously.",
        {
            chains: z
                .array(
                    z.union([
                        z.enum(
                            Object.values(ChainName) as [string, ...string[]]
                        ),
                        z.number(),
                    ])
                )
                .optional()
                .describe(
                    "Array of blockchain networks to query. Can be chain names (e.g., 'eth-mainnet') or chain IDs (e.g., 1). If not specified, queries all supported chains."
                ),
            addresses: z
                .array(z.string())
                .optional()
                .describe(
                    "Array of wallet addresses to get transactions for. Each address should be a valid blockchain address."
                ),
            limit: z
                .number()
                .optional()
                .default(10)
                .describe(
                    "Maximum number of transactions to return per request. Default is 10, maximum is 100."
                ),
            before: z
                .string()
                .optional()
                .describe(
                    "Pagination cursor to get transactions before this point. Use the 'before' value from previous response."
                ),
            after: z
                .string()
                .optional()
                .describe(
                    "Pagination cursor to get transactions after this point. Use the 'after' value from previous response."
                ),
            withLogs: z
                .boolean()
                .optional()
                .default(false)
                .describe(
                    "Include transaction logs in the response. Default is false."
                ),
            withDecodedLogs: z
                .boolean()
                .optional()
                .default(false)
                .describe(
                    "Include decoded transaction logs in the response. Only applicable when withLogs is true. Default is false."
                ),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional()
                .describe(
                    "Currency to quote token values in (e.g., 'USD', 'EUR'). If not specified, uses default quote currency."
                ),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.AllChainsService.getMultiChainMultiAddressTransactions(
                        {
                            chains: params.chains as Chain[],
                            addresses: params.addresses,
                            limit: params.limit,
                            before: params.before,
                            after: params.after,
                            withLogs: params.withLogs,
                            withDecodedLogs: params.withDecodedLogs,
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
        "multichain_balances",
        "Fetch paginated spot & historical native and token balances for a single address on up to 10 EVM chains with one API call. " +
            "Requires walletAddress. Optional parameters include chains array to specify networks, " +
            "quoteCurrency for value conversion, limit (default 10), pagination (before), " +
            "and cutoffTimestamp to filter by time. " +
            "Use this to get a comprehensive view of token holdings across different blockchains.",
        {
            walletAddress: z
                .string()
                .describe(
                    "The wallet address to get token balances for. Must be a valid blockchain address."
                ),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional()
                .describe(
                    "Currency to quote token values in (e.g., 'USD', 'EUR'). If not specified, uses default quote currency."
                ),
            before: z
                .string()
                .optional()
                .describe(
                    "Pagination cursor to get balances before this point. Use the 'before' value from previous response."
                ),
            limit: z
                .number()
                .optional()
                .default(10)
                .describe(
                    "Maximum number of token balances to return. Default is 10, maximum is 100."
                ),
            chains: z
                .array(
                    z.union([
                        z.enum(
                            Object.values(ChainName) as [string, ...string[]]
                        ),
                        z.number(),
                    ])
                )
                .optional()
                .describe(
                    "Array of blockchain networks to query balances from. Can be chain names or chain IDs. If not specified, queries all supported chains."
                ),
            cutoffTimestamp: z
                .number()
                .optional()
                .describe(
                    "Unix timestamp to filter balances by last activity. Only returns tokens with activity after this time."
                ),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.AllChainsService.getMultiChainBalances(
                        params.walletAddress,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            before: params.before,
                            limit: params.limit,
                            chains: params.chains as ChainID[] | ChainName[],
                            cutoffTimestamp: params.cutoffTimestamp,
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
        "multichain_address_activity",
        "Commonly used to locate chains which an address is active on with a single API call. " +
            "Requires walletAddress. Optional parameter testnets (default false) " +
            "determines whether to include testnet activity. " +
            "Returns a comprehensive summary of chain activity including transaction counts, " +
            "first/last activity timestamps, and activity status across all networks.",
        {
            walletAddress: z
                .string()
                .describe(
                    "The wallet address to analyze activity for. Passing in an ENS, RNS, Lens Handle, or an Unstoppable Domain resolves automatically."
                ),
            testnets: z
                .boolean()
                .optional()
                .default(false)
                .describe(
                    "Whether to include testnet activity in the analysis. Default is false (mainnet only)."
                ),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.AllChainsService.getAddressActivity(
                        params.walletAddress,
                        { testnets: params.testnets }
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
