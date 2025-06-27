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
        "Get real-time gas estimates for different transaction speeds on a specific network, enabling users to optimize transaction costs and confirmation times. " +
            "Requires chainName (blockchain network) and eventType (erc20, nativetokens, or uniswapv3). " +
            "Optional parameter quoteCurrency allows conversion to different currencies (USD, EUR, etc). " +
            "Returns estimated gas prices for low, medium, and high priority transactions for the specified event type.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to get gas prices for (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            eventType: z
                .enum(["erc20", "nativetokens", "uniswapv3"])
                .describe(
                    "Type of transaction to estimate gas for: 'erc20' for token transfers, 'nativetokens' for native transfers, 'uniswapv3' for DEX swaps."
                ),
            quoteCurrency: z
                .enum(Object.values(validQuoteValues) as [string, ...string[]])
                .optional()
                .describe(
                    "Currency to quote gas costs in (e.g., 'USD', 'EUR'). If not specified, uses default quote currency."
                ),
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
        "Commonly used to fetch and render a single block for a block explorer." +
            "Requires chainName (blockchain network) and blockHeight (block number). " +
            "Returns comprehensive block data including timestamp, transaction count, size, " +
            "miner information, and other blockchain-specific details.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            blockHeight: z
                .string()
                .describe(
                    "The block number to retrieve. Can be a specific block number or 'latest' for the most recent block."
                ),
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
        "Commonly used to get all the block heights within a particular date range. " +
            "Requires chainName (blockchain network), startDate (YYYY-MM-DD format), and endDate (YYYY-MM-DD or 'latest'). " +
            "Optional pagination parameters include pageSize (default 10) and pageNumber (default 0). " +
            "Returns block heights, timestamps, and related data for blocks within the specified date range, " +
            "useful for historical analysis and time-based blockchain queries.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            startDate: z
                .string()
                .describe(
                    "Start date for the query in YYYY-MM-DD format (e.g., '2023-01-01')."
                ),
            endDate: z
                .union([z.string(), z.literal("latest")])
                .describe(
                    "End date for the query in YYYY-MM-DD format or 'latest' for current date."
                ),
            pageSize: z
                .number()
                .optional()
                .default(10)
                .describe(
                    "Number of block heights to return per page. Default is 10, maximum is 100."
                ),
            pageNumber: z
                .number()
                .optional()
                .default(0)
                .describe(
                    "Page number for pagination, starting from 0. Default is 0."
                ),
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
        "Commonly used to get all the event logs emitted from a particular contract address. " +
            "Useful for building dashboards that examine on-chain interactions." +
            "Requires chainName (blockchain network) and contractAddress (the address emitting events). " +
            "Optional parameters include block range (startingBlock, endingBlock) and pagination settings " +
            "(pageSize default 10, pageNumber default 0). " +
            "Returns decoded event logs for the specified contract, useful for monitoring specific " +
            "smart contract activity and analyzing on-chain events.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            contractAddress: z
                .string()
                .describe(
                    "The smart contract address to get event logs from. Must be a valid contract address."
                ),
            startingBlock: z
                .union([z.string(), z.number()])
                .optional()
                .describe(
                    "Starting block number to begin search from. Use with endingBlock to define a range."
                ),
            endingBlock: z
                .union([z.string(), z.number()])
                .optional()
                .describe(
                    "Ending block number to search until. Use with startingBlock to define a range."
                ),
            pageSize: z
                .number()
                .optional()
                .default(10)
                .describe(
                    "Number of log events to return per page. Default is 10, maximum is 100."
                ),
            pageNumber: z
                .number()
                .optional()
                .default(0)
                .describe(
                    "Page number for pagination, starting from 0. Default is 0."
                ),
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
        "Commonly used to get all event logs of the same topic hash across all contracts within a particular chain. " +
            "Useful for cross-sectional analysis of event logs that are emitted on-chain." +
            "Requires chainName (blockchain network) and topicHash (the event signature hash). " +
            "Optional parameters include block range (startingBlock, endingBlock), secondaryTopics for " +
            "filtering by additional parameters, and pagination settings (pageSize default 10, pageNumber default 0). " +
            "Returns decoded event logs matching the specified topic hash, ideal for tracking specific " +
            "event types across multiple contracts on a blockchain.",
        {
            chainName: z
                .enum(Object.values(ChainName) as [string, ...string[]])
                .describe(
                    "The blockchain network to query (e.g., 'eth-mainnet', 'matic-mainnet', 'bsc-mainnet')."
                ),
            topicHash: z
                .string()
                .describe(
                    "The event signature hash (topic[0]) to search for. This is the keccak256 hash of the event signature."
                ),
            startingBlock: z
                .union([z.string(), z.number()])
                .optional()
                .describe(
                    "Starting block number to begin search from. Use with endingBlock to define a range."
                ),
            endingBlock: z
                .union([z.string(), z.number()])
                .optional()
                .describe(
                    "Ending block number to search until. Use with startingBlock to define a range."
                ),
            secondaryTopics: z
                .string()
                .optional()
                .describe(
                    "Additional topic filters (topic[1], topic[2], topic[3]) to narrow down the search."
                ),
            pageSize: z
                .number()
                .optional()
                .default(10)
                .describe(
                    "Number of log events to return per page. Default is 10, maximum is 100."
                ),
            pageNumber: z
                .number()
                .optional()
                .default(0)
                .describe(
                    "Page number for pagination, starting from 0. Default is 0."
                ),
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
