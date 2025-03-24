import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Chain, ChainName, GoldRushClient, Quote } from "@covalenthq/client-sdk";
import { z } from "zod";
import { validQuoteValues } from "../utils/constants.js";
import { stringifyWithBigInt } from "../utils/helpers.js";

/**
 * Adds tools for the BalanceService.
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - getTokenBalancesForWalletAddress
 * - getHistoricalTokenBalancesForWalletAddress
 * - getHistoricalPortfolioForWalletAddress
 * - getErc20TransfersForWalletAddress
 * - getErc20TransfersForWalletAddressByPage
 * - getTokenHoldersV2ForTokenAddress
 * - getTokenHoldersV2ForTokenAddressByPage
 * - getNativeTokenBalance
 */
export function addBalanceServiceTools(server: McpServer, goldRushClient: GoldRushClient) {
    server.tool(
        "getTokenBalancesForWalletAddress",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            address: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            nft: z.boolean().optional(),
            noNftFetch: z.boolean().optional(),
            noSpam: z.boolean().optional(),
            noNftAssetMetadata: z.boolean().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BalanceService.getTokenBalancesForWalletAddress(
                    params.chainName as Chain,
                    params.address,
                    {
                        quoteCurrency: params.quoteCurrency as Quote,
                        nft: params.nft,
                        noNftFetch: params.noNftFetch,
                        noSpam: params.noSpam,
                        noNftAssetMetadata: params.noNftAssetMetadata
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getHistoricalTokenBalancesForWalletAddress",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            address: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            nft: z.boolean().optional(),
            noNftFetch: z.boolean().optional(),
            noSpam: z.boolean().optional(),
            noNftAssetMetadata: z.boolean().optional(),
            blockHeight: z.number().optional(),
            date: z.string().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BalanceService.getHistoricalTokenBalancesForWalletAddress(
                    params.chainName as Chain,
                    params.address,
                    {
                        quoteCurrency: params.quoteCurrency as Quote,
                        nft: params.nft,
                        noNftFetch: params.noNftFetch,
                        noSpam: params.noSpam,
                        noNftAssetMetadata: params.noNftAssetMetadata,
                        blockHeight: params.blockHeight,
                        date: params.date
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getHistoricalPortfolioForWalletAddress",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            days: z.number().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BalanceService.getHistoricalPortfolioForWalletAddress(
                    params.chainName as Chain,
                    params.walletAddress,
                    {
                        quoteCurrency: params.quoteCurrency as Quote,
                        days: params.days
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getErc20TransfersForWalletAddress",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            contractAddress: z.string().optional(),
            startingBlock: z.number().optional(),
            endingBlock: z.number().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional()
        },
        async (params) => {
            try {
                const allTransfers = [];
                const iterator = goldRushClient.BalanceService.getErc20TransfersForWalletAddress(
                    params.chainName as Chain,
                    params.walletAddress,
                    {
                        quoteCurrency: params.quoteCurrency as Quote,
                        contractAddress: params.contractAddress,
                        startingBlock: params.startingBlock,
                        endingBlock: params.endingBlock,
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber
                    }
                );

                for await (const page of iterator) {
                    if (page.data?.items) {
                        allTransfers.push(...page.data.items);
                    }
                }

                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt({ items: allTransfers })
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getErc20TransfersForWalletAddressByPage",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            contractAddress: z.string().optional(),
            startingBlock: z.number().optional(),
            endingBlock: z.number().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BalanceService.getErc20TransfersForWalletAddressByPage(
                    params.chainName as Chain,
                    params.walletAddress,
                    {
                        quoteCurrency: params.quoteCurrency as Quote,
                        contractAddress: params.contractAddress,
                        startingBlock: params.startingBlock,
                        endingBlock: params.endingBlock,
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getTokenHoldersV2ForTokenAddress",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            tokenAddress: z.string(),
            blockHeight: z.union([z.string(), z.number()]).optional(),
            date: z.string().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional()
        },
        async (params) => {
            try {
                const allHolders = [];
                const iterator = goldRushClient.BalanceService.getTokenHoldersV2ForTokenAddress(
                    params.chainName as Chain,
                    params.tokenAddress,
                    {
                        blockHeight: params.blockHeight,
                        date: params.date,
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber
                    }
                );

                for await (const page of iterator) {
                    if (page.data?.items) {
                        allHolders.push(...page.data.items);
                    }
                }

                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt({ items: allHolders })
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getTokenHoldersV2ForTokenAddressByPage",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            tokenAddress: z.string(),
            blockHeight: z.union([z.string(), z.number()]).optional(),
            date: z.string().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BalanceService.getTokenHoldersV2ForTokenAddressByPage(
                    params.chainName as Chain,
                    params.tokenAddress,
                    {
                        blockHeight: params.blockHeight,
                        date: params.date,
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber
                    }
                );

                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getNativeTokenBalance",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            blockHeight: z.union([z.string(), z.number()]).optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BalanceService.getNativeTokenBalance(
                    params.chainName as Chain,
                    params.walletAddress,
                    {
                        quoteCurrency: params.quoteCurrency as Quote,
                        blockHeight: params.blockHeight
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error}` }],
                    isError: true
                };
            }
        }
    );
} 