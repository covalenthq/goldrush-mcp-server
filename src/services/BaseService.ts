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
 * Adds Utility tools (BaseService).
 *
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - gas_prices
 * - block
 * - block_heights
 * - log_events_by_address
 * - log_events_by_topic
 */
export function addBaseServiceTools(
    server: McpServer,
    goldRushClient: GoldRushClient
) {
    server.tool(
        "gas_prices",
        "Gets gas price estimations for a specific event type on a given chain.\n" +
            "Required: chainName (blockchain network), eventType (erc20, nativetokens, or uniswapv3).\n" +
            "Optional: quoteCurrency (USD, EUR, etc).\n" +
            "Returns gas price estimations for the specified event type.",
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
        "block",
        "Gets details for a specific block height on a given chain.\n" +
            "Required: chainName (blockchain network), blockHeight (block number).\n" +
            "Returns detailed information about the specified block.",
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
        "block_heights",
        "Gets block heights within a specified date range on a given chain with pagination.\n" +
            "Required: chainName (blockchain network), startDate (YYYY-MM-DD), endDate (YYYY-MM-DD or latest).\n" +
            "Optional: pageSize, pageNumber (pagination parameters).\n" +
            "Returns block details for a single page of results.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            startDate: z.string(),
            endDate: z.union([z.string(), z.literal("latest")]),
            pageSize: z.number().optional().default(10),
            pageNumber: z.number().optional().default(0),
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
        "log_events_by_address",
        "Gets event logs emitted by a specific contract address with pagination.\n" +
            "Required: chainName (blockchain network), contractAddress (contract emitting events).\n" +
            "Optional: startingBlock, endingBlock, pageSize, pageNumber (pagination parameters).\n" +
            "Returns event logs for a single page of results.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            contractAddress: z.string(),
            startingBlock: z.union([z.string(), z.number()]).optional(),
            endingBlock: z.union([z.string(), z.number()]).optional(),
            pageSize: z.number().optional().default(10),
            pageNumber: z.number().optional().default(0),
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
        "log_events_by_topic",
        "Gets event logs matching a specific event signature (topic hash) with pagination.\n" +
            "Required: chainName (blockchain network), topicHash (event signature hash).\n" +
            "Optional: startingBlock, endingBlock, secondaryTopics, pageSize, pageNumber.\n" +
            "Returns event logs for a single page of results.",
        {
            chainName: z.enum(
                Object.values(ChainName) as [string, ...string[]]
            ),
            topicHash: z.string(),
            startingBlock: z.union([z.string(), z.number()]).optional(),
            endingBlock: z.union([z.string(), z.number()]).optional(),
            secondaryTopics: z.string().optional(),
            pageSize: z.number().optional().default(10),
            pageNumber: z.number().optional().default(0),
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
