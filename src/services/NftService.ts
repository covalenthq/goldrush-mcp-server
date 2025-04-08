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
        "nft_check_ownership",
        "Commonly used to verify ownership of NFTs (including ERC-721 and ERC-1155) within a collection.\n" +
            "Required: chainName (blockchain network), walletAddress (wallet address), collectionContract (NFT collection).\n" +
            "Optional: traitsFilter (filter by trait types), valuesFilter (filter by trait values).\n" +
            "Returns ownership status and matching NFTs if owned.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
            collectionContract: z.string(),
            traitsFilter: z.string().optional(),
            valuesFilter: z.string().optional(),
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
