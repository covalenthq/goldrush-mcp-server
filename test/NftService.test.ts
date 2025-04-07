/**
 * Test suite for the NftService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 * @description
 * Tests the following NftService methods:
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
 *
 * Notes:
 * - Start server as a subprocess using StdioClientTransport
 * - For each tool, do a minimal test calling it with placeholder or minimal arguments
 * - We do not do extensive validation, we just confirm isError is false
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { describe, it, expect, beforeAll } from "vitest";

describe("NftService Tools", () => {
    let client: Client;

    beforeAll(async () => {
        // Start the server as a subprocess via stdio
        const transport = new StdioClientTransport({
            command: "node",
            args: [path.resolve(process.cwd(), "dist/index.js")],
        });

        client = new Client(
            {
                name: "NftServiceTestClient",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Connect
        await client.connect(transport);
    }, 60000);

    it("getChainCollections - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_chain_collections",
            arguments: {
                chainName: "base-mainnet",
            },
        });
        console.log("nft_chain_collections result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getNftsForAddress - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_for_address",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "sovpunk.eth",
            },
        });
        console.log("nft_for_address result:", result.content);
        expect(result.isError).toBeFalsy();
    }, 30000);

    it("getTokenIdsForContractWithMetadata - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_token_ids",
            arguments: {
                chainName: "eth-mainnet",
                contractAddress: "0xD97c7C5c30FEba950790D3A6F72d98509499112c",
            },
        });
        console.log("nft_token_ids result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 60000);

    it("getNftMetadataForGivenTokenIdForContract - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_metadata_for_token_id",
            arguments: {
                chainName: "eth-mainnet",
                contractAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                tokenId: "1",
            },
        });
        console.log("nft_metadata_for_token_id result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getNftTransactionsForContractTokenId - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_transactions",
            arguments: {
                chainName: "eth-mainnet",
                contractAddress: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
                tokenId: "1",
                pageSize: 1,
                pageNumber: 0,
            },
        });
        console.log("nft_transactions result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getTraitsForCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_traits_for_collection",
            arguments: {
                chainName: "eth-mainnet",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
            },
        });
        console.log("nft_traits_for_collection result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getAttributesForTraitInCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_attributes_for_trait_in_collection",
            arguments: {
                chainName: "eth-mainnet",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                trait: "Beanie",
            },
        });
        console.log(
            "nft_attributes_for_trait_in_collection result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getCollectionTraitsSummary - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_collection_traits_summary",
            arguments: {
                chainName: "eth-mainnet",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
            },
        });
        console.log("nft_collection_traits_summary result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getHistoricalFloorPricesForCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_historical_floor_prices_for_collection",
            arguments: {
                chainName: "eth-mainnet",
                collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                days: 1,
            },
        });
        console.log(
            "nft_historical_floor_prices_for_collection result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getHistoricalVolumeForCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_historical_volume_for_collection",
            arguments: {
                chainName: "eth-mainnet",
                collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                days: 1,
            },
        });
        console.log(
            "nft_historical_volume_for_collection result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
    }, 30000);

    it("getHistoricalSalesCountForCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "nft_historical_sales_count_for_collection",
            arguments: {
                chainName: "eth-mainnet",
                collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                days: 1,
            },
        });
        console.log(
            "nft_historical_sales_count_for_collection result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);
});
