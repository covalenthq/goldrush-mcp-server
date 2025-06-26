import { stringifyWithBigInt } from "../utils/helpers.js";
import {
    type Chain,
    ChainName,
    type GoldRushClient,
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
 * - nft_for_address
 * - nft_check_ownership
 */
export function addNftServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "nft_for_address",
        "Commonly used to render the NFTs (including ERC721 and ERC1155) held by an address.\n" +
            "Required: chainName (blockchain network name), walletAddress (wallet address or ENS/domain).\n" +
            "Optional: noSpam (filter spam, default true), noNftAssetMetadata (exclude metadata for faster response, default true), " +
            "withUncached (fetch uncached metadata, may be slower, default false).\n" +
            "Returns complete details of NFTs in the wallet including metadata.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ).describe("The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."),
            walletAddress: z.string().describe("The wallet address to get NFTs for. Can be a wallet address or ENS/domain name."),
            noSpam: z.boolean().optional().default(true).describe("Filter out spam/scam NFTs from results. Default is true."),
            noNftAssetMetadata: z.boolean().optional().default(true).describe("Skip fetching NFT asset metadata for faster response. Default is true."),
            withUncached: z.boolean().optional().default(false).describe("Fetch uncached metadata directly from source (may be slower but more up-to-date). Default is false."),
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
        "nft_check_ownership",
        "Commonly used to verify ownership of NFTs (including ERC-721 and ERC-1155) within a collection.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address), collectionContract (NFT collection).\n" +
            "Optional: traitsFilter (filter by trait types), valuesFilter (filter by trait values).\n" +
            "Returns ownership status and matching NFTs if owned.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ).describe("The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."),
            walletAddress: z.string().describe("The wallet address to check NFT ownership for. Must be a valid blockchain address."),
            collectionContract: z.string().describe("The NFT collection contract address to check ownership in. Must be a valid ERC-721 or ERC-1155 contract address."),
            traitsFilter: z.string().optional().describe("Filter by specific trait types (comma-separated list of trait names to filter by)."),
            valuesFilter: z.string().optional().describe("Filter by specific trait values (comma-separated list of trait values to match)."),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.NftService.checkOwnershipInNft(
                        params.chainName as Chain,
                        params.walletAddress,
                        params.collectionContract,
                        {
                            traitsFilter: params.traitsFilter,
                            valuesFilter: params.valuesFilter,
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
