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
 * - getMultiChainMultiAddressTransactions
 * - getMultiChainBalances
 * - getAddressActivity
 */
export function addAllChainsServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "getMultiChainMultiAddressTransactions",
        "Gets transactions for multiple wallet addresses across multiple blockchains.\n" +
            "Required: addresses (array of wallet addresses).\n" +
            "Optional: chains (array of blockchain networks), before/after (pagination), limit, quoteCurrency, withDecodedLogs, withLogs.\n" +
            "Returns transactions for the specified addresses across selected chains.",
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
        "getMultiChainBalances",
        "Gets token balances for a wallet address across multiple blockchains.\n" +
            "Required: walletAddress (wallet address).\n" +
            "Optional: chains (array of blockchain networks), quoteCurrency, before, cutoffTimestamp, limit.\n" +
            "Returns token balances across all specified chains.",
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
        "getAddressActivity",
        "Gets a summary of wallet activity across all supported blockchains.\n" +
            "Required: walletAddress (wallet address).\n" +
            "Optional: testnets (include testnet activity).\n" +
            "Returns chain activity summary across all networks.",
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
