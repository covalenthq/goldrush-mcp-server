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
 * Adds tools for the NftService.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - nft_chain_collections
 * - nft_for_address
 * - nft_token_ids
 * - nft_metadata_for_token_id
 * - nft_transactions
 * - nft_traits_for_collection
 * - nft_attributes_for_trait_in_collection
 * - nft_collection_traits_summary
 * - nft_historical_floor_prices_for_collection
 * - nft_historical_volume_for_collection
 * - nft_historical_sales_count_for_collection
 */
export function addNftServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "nft_chain_collections",
        "Gets NFT collections on a specific blockchain network with pagination.\n" +
            "Required: chainName (blockchain network).\n" +
            "Optional: pageSize, pageNumber, noSpam (filter out spam collections).\n" +
            "Returns NFT collections for a single page of results.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            pageSize: z.number().optional().default(10),
            pageNumber: z.number().optional().default(0),
            noSpam: z.boolean().optional().default(true),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getChainCollectionsByPage(
                        params.chainName as Chain,
                        {
                            pageSize: params.pageSize,
                            pageNumber: params.pageNumber,
                            noSpam: params.noSpam,
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
        "nft_for_address",
        "Gets all NFTs owned by a specific wallet address.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address).\n" +
            "Optional: noSpam (filter spam NFTs), noNftAssetMetadata (exclude metadata), withUncached (include uncached data).\n" +
            "Returns all NFTs owned by the specified wallet.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
            noSpam: z.boolean().optional().default(true),
            noNftAssetMetadata: z.boolean().optional().default(true),
            withUncached: z.boolean().optional().default(false),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getNftsForAddress(
                        params.chainName as Chain,
                        params.walletAddress,
                        {
                            noSpam: params.noSpam,
                            noNftAssetMetadata: params.noNftAssetMetadata,
                            withUncached: params.withUncached,
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
        "nft_token_ids",
        "Gets token IDs with metadata for a specific NFT contract with pagination.\n" +
            "Required: chainName (blockchain network), contractAddress (NFT contract address).\n" +
            "Optional: noMetadata, pageSize, pageNumber, traitsFilter, valuesFilter, withUncached.\n" +
            "Returns token IDs with metadata for a single page of results.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            contractAddress: z.string(),
            noMetadata: z.boolean().optional(),
            pageSize: z.number().optional().default(10),
            pageNumber: z.number().optional().default(0),
            traitsFilter: z.string().optional(),
            valuesFilter: z.string().optional(),
            withUncached: z.boolean().optional().default(false),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getTokenIdsForContractWithMetadataByPage(
                        params.chainName as Chain,
                        params.contractAddress,
                        {
                            noMetadata: params.noMetadata,
                            pageSize: params.pageSize,
                            pageNumber: params.pageNumber,
                            traitsFilter: params.traitsFilter,
                            valuesFilter: params.valuesFilter,
                            withUncached: params.withUncached,
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
        "nft_metadata_for_token_id",
        "Gets detailed metadata for a specific NFT token ID.\n" +
            "Required: chainName (blockchain network), contractAddress (NFT contract), tokenId (specific NFT ID).\n" +
            "Optional: noMetadata (exclude metadata), withUncached (include uncached data).\n" +
            "Returns comprehensive metadata for the specified NFT token.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            contractAddress: z.string(),
            tokenId: z.string(),
            noMetadata: z.boolean().optional(),
            withUncached: z.boolean().optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getNftMetadataForGivenTokenIdForContract(
                        params.chainName as Chain,
                        params.contractAddress,
                        params.tokenId,
                        {
                            noMetadata: params.noMetadata,
                            withUncached: params.withUncached,
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
        "nft_transactions",
        "Gets transaction history for a specific NFT token.\n" +
            "Required: chainName (blockchain network), contractAddress (NFT contract), tokenId (specific NFT ID).\n" +
            "Optional: noSpam (filter spam transactions).\n" +
            "Returns all transactions involving the specified NFT token.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            contractAddress: z.string(),
            tokenId: z.string(),
            noSpam: z.boolean().optional().default(true),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getNftTransactionsForContractTokenId(
                        params.chainName as Chain,
                        params.contractAddress,
                        params.tokenId,
                        { noSpam: params.noSpam }
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
        "nft_traits_for_collection",
        "Gets all trait types (e.g., 'Background', 'Eyes') available in an NFT collection.\n" +
            "Required: chainName (blockchain network), collectionContract (NFT collection address).\n" +
            "Returns all available trait types for the specified NFT collection.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            collectionContract: z.string(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getTraitsForCollection(
                        params.chainName as Chain,
                        params.collectionContract
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
        "nft_attributes_for_trait_in_collection",
        "Gets all possible attribute values for a specific trait in an NFT collection.\n" +
            "Required: chainName (blockchain network), collectionContract (NFT collection), trait (trait name).\n" +
            "Returns all attribute values for the specified trait (e.g., all 'Background' values).",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            collectionContract: z.string(),
            trait: z.string(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getAttributesForTraitInCollection(
                        params.chainName as Chain,
                        params.collectionContract,
                        params.trait
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
        "nft_collection_traits_summary",
        "Gets a summary of all traits and their distribution in an NFT collection.\n" +
            "Required: chainName (blockchain network), collectionContract (NFT collection address).\n" +
            "Returns statistics for all traits and values in the specified collection.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            collectionContract: z.string(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getCollectionTraitsSummary(
                        params.chainName as Chain,
                        params.collectionContract
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
        "nft_historical_floor_prices_for_collection",
        "Gets historical floor prices over time for an NFT collection.\n" +
            "Required: chainName (blockchain network), collectionAddress (NFT collection).\n" +
            "Optional: quoteCurrency (currency for prices), days (time period to analyze).\n" +
            "Returns floor price data points over the specified time period.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            collectionAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            days: z.number().optional().default(7),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getHistoricalFloorPricesForCollection(
                        params.chainName as Chain,
                        params.collectionAddress,
                        {
                            quote_currency: params.quoteCurrency as Quote,
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "nft_historical_volume_for_collection",
        "Gets historical trading volume over time for an NFT collection.\n" +
            "Required: chainName (blockchain network), collectionAddress (NFT collection).\n" +
            "Optional: quoteCurrency (currency for volume), days (time period to analyze).\n" +
            "Returns trading volume data points over the specified time period.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            collectionAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            days: z.number().optional().default(7),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getHistoricalVolumeForCollection(
                        params.chainName as Chain,
                        params.collectionAddress,
                        {
                            quote_currency: params.quoteCurrency as Quote,
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "nft_historical_sales_count_for_collection",
        "Gets historical count of sales over time for an NFT collection.\n" +
            "Required: chainName (blockchain network), collectionAddress (NFT collection).\n" +
            "Optional: quoteCurrency (currency for sales), days (time period to analyze).\n" +
            "Returns sales count data points over the specified time period.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            collectionAddress: z.string(),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
            days: z.number().optional().default(7),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.getHistoricalSalesCountForCollection(
                        params.chainName as Chain,
                        params.collectionAddress,
                        {
                            quote_currency: params.quoteCurrency as Quote,
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );
}
