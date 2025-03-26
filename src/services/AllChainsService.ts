import { validQuoteValues } from "../utils/constants.js";
import { stringifyWithBigInt } from "../utils/helpers.js";
import type {
    Chain,
    ChainID,
    GoldRushClient,
    Quote,
} from "@covalenthq/client-sdk";
import { ChainName } from "@covalenthq/client-sdk";
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
            limit: z.number().optional(),
            before: z.string().optional(),
            after: z.string().optional(),
            withLogs: z.boolean().optional(),
            withDecodedLogs: z.boolean().optional(),
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
        {
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            before: z.string().optional(),
            limit: z.number().optional(),
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
        {
            walletAddress: z.string(),
            testnets: z.boolean().optional(),
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
