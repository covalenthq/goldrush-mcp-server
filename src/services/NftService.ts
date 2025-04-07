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
        "Commonly used to fetch the list of NFT collections with downloaded and cached off chain data like token metadata and asset files." +
            " Returns collections with cached metadata for a single page of results.\n" +
            "Required: chainName (blockchain network name).\n" +
            "Optional: pageSize (default 10), pageNumber (default 0), noSpam (filter spam collections, default true).",
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
        "Commonly used to render the NFTs (including ERC721 and ERC1155) held by an address." +
            " Returns complete details of NFTs in the wallet including metadata.\n" +
            "Required: chainName (blockchain network name), walletAddress (wallet address or ENS/domain).\n" +
            "Optional: noSpam (filter spam, default true), noNftAssetMetadata (exclude metadata for faster response, default true), " +
            "withUncached (fetch uncached metadata, may be slower, default false).",
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
        "Commonly used to get NFT token IDs with metadata from a collection. Useful for building NFT card displays." +
            " Returns token IDs and their metadata for a single page of results.\n" +
            "Required: chainName (blockchain network name), contractAddress (NFT contract address).\n" +
            "Optional: noMetadata (exclude metadata), pageSize (default 10), pageNumber (default 0), " +
            "traitsFilter (filter by traits, URL encoded), valuesFilter (filter by values, URL encoded), " +
            "withUncached (fetch uncached metadata, default false).",
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
        "Commonly used to get a single NFT metadata by token ID from a collection. Useful for building NFT card displays." +
            " Returns comprehensive details about a single NFT token.\n" +
            "Required: chainName (blockchain network name), contractAddress (NFT contract address), " +
            "tokenId (specific NFT token ID).\n" +
            "Optional: noMetadata (exclude metadata), withUncached (fetch uncached metadata).",
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
        "Commonly used to get all transactions of an NFT token. Useful for building a transaction history table or price chart." +
            " Returns all historical transactions involving the specified NFT token.\n" +
            "Required: chainName (blockchain network name), contractAddress (NFT contract address), " +
            "tokenId (specific NFT token ID).\n" +
            "Optional: noSpam (filter spam transactions, default true).",
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
        "Commonly used to fetch and render the traits of a collection as seen in rarity calculators." +
            " Returns list of traits like 'Background', 'Eyes', etc. for the collection.\n" +
            "Required: chainName (blockchain network name), collectionContract (NFT collection address).",
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
        "Commonly used to get the count of unique values for traits within an NFT collection." +
            " Returns all values for a given trait (e.g., all possible 'Background' colors).\n" +
            "Required: chainName (blockchain network name), collectionContract (NFT collection address), " +
            "trait (trait name to query).",
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
        "Commonly used to calculate rarity scores for a collection based on its traits." +
            " Returns statistics for all traits including rarity information.\n" +
            "Required: chainName (blockchain network name), collectionContract (NFT collection address).",
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
        "Commonly used to render a price floor chart for an NFT collection." +
            " Returns time-series data showing how minimum prices have changed.\n" +
            "Required: chainName (blockchain network name), collectionAddress (NFT collection address).\n" +
            "Optional: quoteCurrency (currency for price conversion), days (time period in days, default 7).",
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
        "Commonly used to build a time-series chart of the transaction volume of an NFT collection." +
            " Returns time-series data showing total value of trades per period.\n" +
            "Required: chainName (blockchain network name), collectionAddress (NFT collection address).\n" +
            "Optional: quoteCurrency (currency for volume conversion), days (time period in days, default 7).",
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
        "Commonly used to build a time-series chart of the sales count of an NFT collection." +
            " Returns time-series data showing number of sales per period.\n" +
            "Required: chainName (blockchain network name), collectionAddress (NFT collection address).\n" +
            "Optional: quoteCurrency (currency for sales conversion), days (time period in days, default 7).",
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
