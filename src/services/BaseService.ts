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
 * Adds tools for BaseService, including chain info, logs, etc.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - getAllChains
 * - getAllChainStatus
 * - getGasPrices
 * - getBlock
 * - getResolvedAddress
 * - getBlockHeights
 * - getBlockHeightsByPage
 * - getLogs
 * - getLogEventsByAddress
 * - getLogEventsByAddressByPage
 * - getLogEventsByTopicHash
 * - getLogEventsByTopicHashByPage
 */
export function addBaseServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool("getAllChains", {}, async () => {
        try {
            const response = await goldRushClient.BaseService.getAllChains();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error}` }],
                isError: true,
            };
        }
    });

    server.tool("getAllChainStatus", {}, async () => {
        try {
            const response =
                await goldRushClient.BaseService.getAllChainStatus();
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
    });

    server.tool(
        "getGasPrices",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            eventType: z.enum(["erc20", "nativetokens", "uniswapv3"]),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional(),
        },
        async (params) => {
            try {
                const response = await goldRushClient.BaseService.getGasPrices(
                    params.chainName as Chain,
                    params.eventType,
                    {
                        quoteCurrency: params.quoteCurrency as Quote,
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
        "getBlock",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            blockHeight: z.string(),
        },
        async (params) => {
            try {
                const response = await goldRushClient.BaseService.getBlock(
                    params.chainName as Chain,
                    params.blockHeight
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
        "getResolvedAddress",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            walletAddress: z.string(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BaseService.getResolvedAddress(
                        params.chainName as Chain,
                        params.walletAddress
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
        "getBlockHeights",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            startDate: z.string(),
            endDate: z.union([z.string(), z.literal("latest")]),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
        },
        async (params) => {
            try {
                const allBlocks: any[] = [];
                const iterator = goldRushClient.BaseService.getBlockHeights(
                    params.chainName as Chain,
                    params.startDate,
                    params.endDate,
                    {
                        pageSize: params.pageSize,
                        pageNumber: params.pageNumber,
                    }
                );
                for await (const page of iterator) {
                    if (page.data?.items) {
                        allBlocks.push(...page.data.items);
                    }
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: stringifyWithBigInt({ items: allBlocks }),
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
        "getBlockHeightsByPage",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            startDate: z.string(),
            endDate: z.union([z.string(), z.literal("latest")]),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BaseService.getBlockHeightsByPage(
                        params.chainName as Chain,
                        params.startDate,
                        params.endDate,
                        {
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "getLogs",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            startingBlock: z.number().optional(),
            endingBlock: z.string().optional(),
            address: z.string().optional(),
            topics: z.string().optional(),
            blockHash: z.string().optional(),
            skipDecode: z.boolean().optional(),
        },
        async (params) => {
            try {
                const response = await goldRushClient.BaseService.getLogs(
                    params.chainName as Chain,
                    {
                        startingBlock: params.startingBlock,
                        endingBlock: params.endingBlock,
                        address: params.address,
                        topics: params.topics,
                        blockHash: params.blockHash,
                        skipDecode: params.skipDecode,
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
        "getLogEventsByAddress",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            contractAddress: z.string(),
            startingBlock: z.union([z.string(), z.number()]).optional(),
            endingBlock: z.union([z.string(), z.number()]).optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
        },
        async (params) => {
            try {
                const allLogs: any[] = [];
                const iterator =
                    goldRushClient.BaseService.getLogEventsByAddress(
                        params.chainName as Chain,
                        params.contractAddress,
                        {
                            startingBlock: params.startingBlock,
                            endingBlock: params.endingBlock,
                            pageSize: params.pageSize,
                            pageNumber: params.pageNumber,
                        }
                    );
                for await (const page of iterator) {
                    if (page.data?.items) {
                        allLogs.push(...page.data.items);
                    }
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: stringifyWithBigInt({ items: allLogs }),
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
        "getLogEventsByAddressByPage",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            contractAddress: z.string(),
            startingBlock: z.union([z.string(), z.number()]).optional(),
            endingBlock: z.union([z.string(), z.number()]).optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BaseService.getLogEventsByAddressByPage(
                        params.chainName as Chain,
                        params.contractAddress,
                        {
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "getLogEventsByTopicHash",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            topicHash: z.string(),
            startingBlock: z.union([z.string(), z.number()]).optional(),
            endingBlock: z.union([z.string(), z.number()]).optional(),
            secondaryTopics: z.string().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
        },
        async (params) => {
            try {
                const allLogs: any[] = [];
                const iterator =
                    goldRushClient.BaseService.getLogEventsByTopicHash(
                        params.chainName as Chain,
                        params.topicHash,
                        {
                            startingBlock: params.startingBlock,
                            endingBlock: params.endingBlock,
                            secondaryTopics: params.secondaryTopics,
                            pageSize: params.pageSize,
                            pageNumber: params.pageNumber,
                        }
                    );
                for await (const page of iterator) {
                    if (page.data?.items) {
                        allLogs.push(...page.data.items);
                    }
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: stringifyWithBigInt({ items: allLogs }),
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
        "getLogEventsByTopicHashByPage",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            topicHash: z.string(),
            startingBlock: z.union([z.string(), z.number()]).optional(),
            endingBlock: z.union([z.string(), z.number()]).optional(),
            secondaryTopics: z.string().optional(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional(),
        },
        async (params) => {
            try {
                const response =
                    await goldRushClient.BaseService.getLogEventsByTopicHashByPage(
                        params.chainName as Chain,
                        params.topicHash,
                        {
                            startingBlock: params.startingBlock,
                            endingBlock: params.endingBlock,
                            secondaryTopics: params.secondaryTopics,
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
            } catch (err) {
                return {
                    content: [{ type: "text", text: `Error: ${err}` }],
                    isError: true,
                };
            }
        }
    );
}
