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
        "Gets transactions for multiple wallet addresses across multiple blockchains. " +
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
                .optional(),
            addresses: z.array(z.string()).optional(),
            limit: z.number().optional().default(10),
            before: z.string().optional(),
            after: z.string().optional(),
            withLogs: z.boolean().optional().default(false),
            withDecodedLogs: z.boolean().optional().default(false),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
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
        "Gets token balances for a wallet address across multiple blockchains. " +
            "Requires walletAddress. Optional parameters include chains array to specify networks, " +
            "quoteCurrency for value conversion, limit (default 10), pagination (before), " +
            "and cutoffTimestamp to filter by time. " +
            "Use this to get a comprehensive view of token holdings across different blockchains.",
        {
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            before: z.string().optional(),
            limit: z.number().optional().default(10),
            chains: z
                .array(
                    z.union([
                        z.enum(
                            Object.values(ChainName) as [string, ...string[]]
                        ),
                        z.number(),
                    ])
                )
                .optional(),
            cutoffTimestamp: z.number().optional(),
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
        "Gets a summary of wallet activity across all supported blockchains. " +
            "Requires walletAddress. Optional parameter testnets (default false) " +
            "determines whether to include testnet activity. " +
            "Returns a comprehensive summary of chain activity including transaction counts, " +
            "first/last activity timestamps, and activity status across all networks.",
        {
            walletAddress: z.string(),
            testnets: z.boolean().optional().default(false),
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
