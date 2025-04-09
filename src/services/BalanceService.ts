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
 * - token_balances
 * - historical_token_balances
 * - historical_portfolio_value
 * - erc20_token_transfers
 * - token_holders
 * - native_token_balance
 */
export function addBalanceServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "token_balances",
        "Commonly used to fetch the native and fungible (ERC20) tokens held by an address. " +
            "Required: chainName (blockchain network), address (wallet address). " +
            "Optional: quoteCurrency for value conversion, nft (include NFTs, default false), " +
            "noNftFetch, noSpam, and noNftAssetMetadata (all default true) to control data returned. " +
            "Returns detailed token balance information including spot prices and metadata.",
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
        "historical_token_balances",
        "Commonly used to fetch the historical native and fungible (ERC20) tokens held by an address at a given block height or date" +
            "Required: chainName (blockchain network), address (wallet address). " +
            "Optional: quoteCurrency for value conversion, blockHeight or date to specify point in time, " +
            "nft (include NFTs, default false), noNftFetch, noSpam, and noNftAssetMetadata (all default true). " +
            "Returns token balances as they existed at the specified historical point.",
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
        "historical_portfolio_value",
        "Commonly used to render a daily portfolio balance for an address broken down by the token. " +
            "Required: chainName (blockchain network), walletAddress (wallet address). " +
            "Optional: quoteCurrency for value conversion, days (timeframe to analyze, default 7). " +
            "Returns portfolio value time series data showing value changes over the specified timeframe.",
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
        "erc20_token_transfers",
        "Commonly used to render the transfer-in and transfer-out of a token along with historical prices from an address. " +
            "Required: chainName (blockchain network), walletAddress (wallet address). " +
            "Optional: quoteCurrency for value conversion, contractAddress to filter by specific token, " +
            "startingBlock/endingBlock to set range, pageSize (default 10) and pageNumber (default 0). " +
            "Returns token transfer events with timestamps, values, and transaction details.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            contractAddress: z.string().nullable(),
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
        "token_holders",
        "Used to get a paginated list of current or historical token holders for a specified ERC20 or ERC721 token." +
            "Required: chainName (blockchain network), tokenAddress (token contract address). " +
            "Optional: blockHeight or date for historical data, pageSize and pageNumber for pagination. " +
            "Returns list of addresses holding the token with balance amounts and ownership percentages.",
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
        "native_token_balance",
        "Commonly used to fetch the native token balance (ETH, MATIC, etc.) for an address. " +
            "Required: chainName (blockchain network), walletAddress (wallet address). " +
            "Optional: quoteCurrency for value conversion, blockHeight for historical balance. " +
            "Returns native token balance with current market value and token metadata.",
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
