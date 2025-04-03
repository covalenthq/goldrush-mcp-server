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
 * Adds tools for the BalanceService.
 *
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - getTokenBalancesForWalletAddress
 * - getHistoricalTokenBalancesForWalletAddress
 * - getHistoricalPortfolioForWalletAddress
 * - getErc20TransfersForWalletAddress
 * - getTokenHoldersV2ForTokenAddress
 * - getNativeTokenBalance
 */
export function addBalanceServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "getTokenBalancesForWalletAddress",
        "Gets current token balances for a wallet address on a specified chain.\n" +
            "Required: chainName (blockchain network), address (wallet address).\n" +
            "Optional: quoteCurrency, nft, noNftFetch, noSpam, noNftAssetMetadata.\n" +
            "Returns detailed token balance information including prices.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            address: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            nft: z.boolean().optional().default(false),
            noNftFetch: z.boolean().optional().default(true),
            noSpam: z.boolean().optional().default(true),
            noNftAssetMetadata: z.boolean().optional().default(true),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BalanceService.getTokenBalancesForWalletAddress(
                        params.chainName as Chain,
                        params.address,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            nft: params.nft,
                            noNftFetch: params.noNftFetch,
                            noSpam: params.noSpam,
                            noNftAssetMetadata: params.noNftAssetMetadata,
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
        "getHistoricalTokenBalancesForWalletAddress",
        "Gets historical token balances for a wallet at a specific block height or date.\n" +
            "Required: chainName (blockchain network), address (wallet address).\n" +
            "Optional: quoteCurrency, nft, noNftFetch, noSpam, noNftAssetMetadata, blockHeight, date.\n" +
            "Returns token balances as they were at the specified point in time.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            address: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            nft: z.boolean().optional().default(false),
            noNftFetch: z.boolean().optional().default(true),
            noSpam: z.boolean().optional().default(true),
            noNftAssetMetadata: z.boolean().optional().default(true),
            blockHeight: z.number().optional(),
            date: z.string().optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BalanceService.getHistoricalTokenBalancesForWalletAddress(
                        params.chainName as Chain,
                        params.address,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            nft: params.nft,
                            noNftFetch: params.noNftFetch,
                            noSpam: params.noSpam,
                            noNftAssetMetadata: params.noNftAssetMetadata,
                            blockHeight: params.blockHeight,
                            date: params.date,
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
        "getHistoricalPortfolioForWalletAddress",
        "Gets historical portfolio value for a wallet over time.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address).\n" +
            "Optional: quoteCurrency (USD, EUR, etc), days (number of days to look back).\n" +
            "Returns portfolio value time series data for the specified period.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            days: z.number().optional().default(7),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BalanceService.getHistoricalPortfolioForWalletAddress(
                        params.chainName as Chain,
                        params.walletAddress,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            days: params.days,
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
        "getErc20TransfersForWalletAddress",
        "Gets ERC20 token transfers for a wallet address with pagination.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address).\n" +
            "Optional: quoteCurrency, contractAddress (specific token), startingBlock, endingBlock, pageSize, pageNumber.\n" +
            "Returns token transfer events for a single page of results.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            contractAddress: z.string().optional(),
            startingBlock: z.number().optional(),
            endingBlock: z.number().optional(),
            pageSize: z.number().optional().default(10),
            pageNumber: z.number().optional().default(0),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BalanceService.getErc20TransfersForWalletAddressByPage(
                        params.chainName as Chain,
                        params.walletAddress,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            contractAddress: params.contractAddress,
                            startingBlock: params.startingBlock,
                            endingBlock: params.endingBlock,
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
        "getTokenHoldersV2ForTokenAddress",
        "Gets token holders for a specific token with pagination.\n" +
            "Required: chainName (blockchain network), tokenAddress (token contract address).\n" +
            "Optional: blockHeight, date (historical point), pageSize, pageNumber (pagination parameters).\n" +
            "Returns token holders for a single page of results.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            tokenAddress: z.string(),
            blockHeight: z.union([z.string(), z.number()]).optional(),
            date: z.string().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BalanceService.getTokenHoldersV2ForTokenAddressByPage(
                        params.chainName as Chain,
                        params.tokenAddress,
                        {
                            blockHeight: params.blockHeight,
                            date: params.date,
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
        "getNativeTokenBalance",
        "Gets the native token balance (ETH, MATIC, etc.) for a wallet address.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address).\n" +
            "Optional: quoteCurrency (USD, EUR, etc), blockHeight (for historical balance).\n" +
            "Returns native token balance information.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            blockHeight: z.union([z.string(), z.number()]).optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BalanceService.getNativeTokenBalance(
                        params.chainName as Chain,
                        params.walletAddress,
                        {
                            quoteCurrency: params.quoteCurrency as Quote,
                            blockHeight: params.blockHeight,
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
