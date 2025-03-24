import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Chain, ChainName, GoldRushClient, Quote } from "@covalenthq/client-sdk";
import { z } from "zod";
import { validQuoteValues } from "../utils/constants.js";
import { stringifyWithBigInt } from "../utils/helpers.js";

/**
 * Adds tools for the NftService.
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - getChainCollections / getChainCollectionsByPage
 * - getNftsForAddress
 * - getTokenIdsForContractWithMetadata / getTokenIdsForContractWithMetadataByPage
 * - getNftMetadataForGivenTokenIdForContract
 * - getNftTransactionsForContractTokenId
 * - getTraitsForCollection
 * - getAttributesForTraitInCollection
 * - getCollectionTraitsSummary
 * - getHistoricalFloorPricesForCollection
 * - getHistoricalVolumeForCollection
 * - getHistoricalSalesCountForCollection
 * - checkOwnershipInNft, checkOwnershipInNftForSpecificTokenId
 */
export function addNftServiceTools(server: McpServer, goldRushClient: GoldRushClient) {
    // getChainCollections - gather all pages
    server.tool(
        "getChainCollections",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
            noSpam: z.boolean().optional()
        },
        async (params) => {
            try {
                const allItems = [];
                const iterator = goldRushClient.NftService.getChainCollections(
                    params.chainName as Chain,
                    {
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber,
                        noSpam: params.noSpam
                    }
                );
                for await (const page of iterator) {
                    if (page.data?.items) {
                        allItems.push(...page.data.items);
                    }
                }
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt({ items: allItems })
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getChainCollectionsByPage - single page
    server.tool(
        "getChainCollectionsByPage",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
            noSpam: z.boolean().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getChainCollectionsByPage(
                    params.chainName as Chain,
                    {
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber,
                        noSpam: params.noSpam
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getNftsForAddress
    server.tool(
        "getNftsForAddress",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string(),
            noSpam: z.boolean().optional(),
            noNftAssetMetadata: z.boolean().optional(),
            withUncached: z.boolean().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getNftsForAddress(
                    params.chainName as Chain,
                    params.walletAddress,
                    {
                        noSpam: params.noSpam,
                        noNftAssetMetadata: params.noNftAssetMetadata,
                        withUncached: params.withUncached
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getTokenIdsForContractWithMetadata - gather all pages
    server.tool(
        "getTokenIdsForContractWithMetadata",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            contractAddress: z.string(),
            noMetadata: z.boolean().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
            traitsFilter: z.string().optional(),
            valuesFilter: z.string().optional(),
            withUncached: z.boolean().optional()
        },
        async (params) => {
            try {
                const allItems = [];
                const iterator = goldRushClient.NftService.getTokenIdsForContractWithMetadata(
                    params.chainName as Chain,
                    params.contractAddress,
                    {
                        noMetadata: params.noMetadata,
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber,
                        traitsFilter: params.traitsFilter,
                        valuesFilter: params.valuesFilter,
                        withUncached: params.withUncached
                    }
                );
                for await (const page of iterator) {
                    if (page.data?.items) {
                        allItems.push(...page.data.items);
                    }
                }
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt({ items: allItems })
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getTokenIdsForContractWithMetadataByPage
    server.tool(
        "getTokenIdsForContractWithMetadataByPage",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            contractAddress: z.string(),
            noMetadata: z.boolean().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
            traitsFilter: z.string().optional(),
            valuesFilter: z.string().optional(),
            withUncached: z.boolean().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getTokenIdsForContractWithMetadataByPage(
                    params.chainName as Chain,
                    params.contractAddress,
                    {
                        noMetadata: params.noMetadata,
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber,
                        traitsFilter: params.traitsFilter,
                        valuesFilter: params.valuesFilter,
                        withUncached: params.withUncached
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getNftMetadataForGivenTokenIdForContract
    server.tool(
        "getNftMetadataForGivenTokenIdForContract",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            contractAddress: z.string(),
            tokenId: z.string(),
            noMetadata: z.boolean().optional(),
            withUncached: z.boolean().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getNftMetadataForGivenTokenIdForContract(
                    params.chainName as Chain,
                    params.contractAddress,
                    params.tokenId,
                    {
                        noMetadata: params.noMetadata,
                        withUncached: params.withUncached
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getNftTransactionsForContractTokenId
    server.tool(
        "getNftTransactionsForContractTokenId",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            contractAddress: z.string(),
            tokenId: z.string(),
            noSpam: z.boolean().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getNftTransactionsForContractTokenId(
                    params.chainName as Chain,
                    params.contractAddress,
                    params.tokenId,
                    { noSpam: params.noSpam }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getTraitsForCollection
    server.tool(
        "getTraitsForCollection",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            collectionContract: z.string()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getTraitsForCollection(
                    params.chainName as Chain,
                    params.collectionContract
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getAttributesForTraitInCollection
    server.tool(
        "getAttributesForTraitInCollection",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            collectionContract: z.string(),
            trait: z.string()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getAttributesForTraitInCollection(
                    params.chainName as Chain,
                    params.collectionContract,
                    params.trait
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getCollectionTraitsSummary
    server.tool(
        "getCollectionTraitsSummary",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            collectionContract: z.string()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getCollectionTraitsSummary(
                    params.chainName as Chain,
                    params.collectionContract
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getHistoricalFloorPricesForCollection
    server.tool(
        "getHistoricalFloorPricesForCollection",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            collectionAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            days: z.number().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getHistoricalFloorPricesForCollection(
                    params.chainName as Chain,
                    params.collectionAddress,
                    {
                        quote_currency: params.quoteCurrency as Quote,
                        days: params.days
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getHistoricalVolumeForCollection
    server.tool(
        "getHistoricalVolumeForCollection",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            collectionAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            days: z.number().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getHistoricalVolumeForCollection(
                    params.chainName as Chain,
                    params.collectionAddress,
                    {
                        quote_currency: params.quoteCurrency as Quote,
                        days: params.days
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // getHistoricalSalesCountForCollection
    server.tool(
        "getHistoricalSalesCountForCollection",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            collectionAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
            days: z.number().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.getHistoricalSalesCountForCollection(
                    params.chainName as Chain,
                    params.collectionAddress,
                    {
                        quote_currency: params.quoteCurrency as Quote,
                        days: params.days
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // checkOwnershipInNft
    server.tool(
        "checkOwnershipInNft",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string(),
            collectionContract: z.string(),
            traitsFilter: z.string().optional(),
            valuesFilter: z.string().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.checkOwnershipInNft(
                    params.chainName as Chain,
                    params.walletAddress,
                    params.collectionContract,
                    {
                        traitsFilter: params.traitsFilter,
                        valuesFilter: params.valuesFilter
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );

    // checkOwnershipInNftForSpecificTokenId
    server.tool(
        "checkOwnershipInNftForSpecificTokenId",
        {
            chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
            walletAddress: z.string(),
            collectionContract: z.string(),
            tokenId: z.string()
        },
        async (params) => {
            try {
                const response = await goldRushClient.NftService.checkOwnershipInNftForSpecificTokenId(
                    params.chainName as Chain,
                    params.walletAddress,
                    params.collectionContract,
                    params.tokenId
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true
                };
            }
        }
    );
} 