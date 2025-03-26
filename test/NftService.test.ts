/**
 * Test suite for the NftService tools implemented in src/index.ts.
 *
 * @remarks
 * These tests rely on having the GOLDRUSH_API_KEY environment variable set,
 * and also rely on the server being started.
 *
 * @description
 * Tests the following NftService methods:
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

    // TODO: This is timing out, uncomment when we have a way to test it
    // it("getChainCollections - minimal check", async () => {
    //     const result = await client.callTool({
    //         name: "getChainCollections",
    //         arguments: {
    //             chainName: "eth-mainnet",
    //             pageSize: 1,
    //             pageNumber: 0,
    //             noSpam: true
    //         }
    //     });
    //     console.log("getChainCollections result:", result.content);
    //     expect(result.isError).toBeFalsy();
    //     expect(result.content).toBeDefined();
    // }, 30000);

    it("getChainCollectionsByPage - minimal check", async () => {
        const result = await client.callTool({
            name: "getChainCollectionsByPage",
            arguments: {
                chainName: "eth-mainnet",
                pageSize: 1,
                pageNumber: 0,
            },
        });
        console.log("getChainCollectionsByPage result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getNftsForAddress - minimal check", async () => {
        const result = await client.callTool({
            name: "getNftsForAddress",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "sovpunk.eth",
            },
        });
        console.log("getNftsForAddress result:", result.content);
        expect(result.isError).toBeFalsy();
    }, 30000);

    // TODO: This is timing out, uncomment when we have a way to test it
    // it("getTokenIdsForContractWithMetadata - minimal check", async () => {
    //     const result = await client.callTool({
    //         name: "getTokenIdsForContractWithMetadata",
    //         arguments: {
    //             chainName: "eth-mainnet",
    //             contractAddress: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
    //             pageSize: 1,
    //             pageNumber: 0
    //         }
    //     });
    //     console.log("getTokenIdsForContractWithMetadata result:", result.content);
    //     expect(result.isError).toBeFalsy();
    //     expect(result.content).toBeDefined();
    // }, 30000);

    it("getTokenIdsForContractWithMetadataByPage - minimal check", async () => {
        const result = await client.callTool({
            name: "getTokenIdsForContractWithMetadataByPage",
            arguments: {
                chainName: "eth-mainnet",
                contractAddress: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
                pageSize: 1,
                pageNumber: 0,
            },
        });
        console.log(
            "getTokenIdsForContractWithMetadataByPage result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getNftMetadataForGivenTokenIdForContract - minimal check", async () => {
        const result = await client.callTool({
            name: "getNftMetadataForGivenTokenIdForContract",
            arguments: {
                chainName: "eth-mainnet",
                contractAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                tokenId: "1",
            },
        });
        console.log(
            "getNftMetadataForGivenTokenIdForContract result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getNftTransactionsForContractTokenId - minimal check", async () => {
        const result = await client.callTool({
            name: "getNftTransactionsForContractTokenId",
            arguments: {
                chainName: "eth-mainnet",
                contractAddress: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
                tokenId: "1",
                pageSize: 1,
                pageNumber: 0,
            },
        });
        console.log(
            "getNftTransactionsForContractTokenId result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getTraitsForCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "getTraitsForCollection",
            arguments: {
                chainName: "eth-mainnet",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
            },
        });
        console.log("getTraitsForCollection result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getAttributesForTraitInCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "getAttributesForTraitInCollection",
            arguments: {
                chainName: "eth-mainnet",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                trait: "Beanie",
            },
        });
        console.log(
            "getAttributesForTraitInCollection result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getCollectionTraitsSummary - minimal check", async () => {
        const result = await client.callTool({
            name: "getCollectionTraitsSummary",
            arguments: {
                chainName: "eth-mainnet",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
            },
        });
        console.log("getCollectionTraitsSummary result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getHistoricalFloorPricesForCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "getHistoricalFloorPricesForCollection",
            arguments: {
                chainName: "eth-mainnet",
                collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                days: 1,
            },
        });
        console.log(
            "getHistoricalFloorPricesForCollection result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("getHistoricalVolumeForCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "getHistoricalVolumeForCollection",
            arguments: {
                chainName: "eth-mainnet",
                collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                days: 1,
            },
        });
        console.log("getHistoricalVolumeForCollection result:", result.content);
        expect(result.isError).toBeFalsy();
    }, 30000);

    it("getHistoricalSalesCountForCollection - minimal check", async () => {
        const result = await client.callTool({
            name: "getHistoricalSalesCountForCollection",
            arguments: {
                chainName: "eth-mainnet",
                collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                days: 1,
            },
        });
        console.log(
            "getHistoricalSalesCountForCollection result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("checkOwnershipInNft - minimal check", async () => {
        const result = await client.callTool({
            name: "checkOwnershipInNft",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
            },
        });
        console.log("checkOwnershipInNft result:", result.content);
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);

    it("checkOwnershipInNftForSpecificTokenId - minimal check", async () => {
        const result = await client.callTool({
            name: "checkOwnershipInNftForSpecificTokenId",
            arguments: {
                chainName: "eth-mainnet",
                walletAddress: "0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6",
                collectionContract:
                    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
                tokenId: "1",
            },
        });
        console.log(
            "checkOwnershipInNftForSpecificTokenId result:",
            result.content
        );
        expect(result.isError).toBeFalsy();
        expect(result.content).toBeDefined();
    }, 30000);
});
