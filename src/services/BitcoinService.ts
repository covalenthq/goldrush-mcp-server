import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GoldRushClient, Quote } from "@covalenthq/client-sdk";
import { z } from "zod";
import { validQuoteValues } from "../utils/constants.js";
import { stringifyWithBigInt } from "../utils/helpers.js";

/**
 * @function addBitcoinServiceTools
 * @description
 * Adds tools for the BitcoinService.
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {GoldRushClient} goldRushClient - The GoldRush client
 * @remarks
 * This function creates tools:
 * - getBitcoinHdWalletBalances
 * - getTransactionsForBtcAddress
 * - getBitcoinNonHdWalletBalances
 */
export function addBitcoinServiceTools(server: McpServer, goldRushClient: GoldRushClient) {
    server.tool(
        "getBitcoinHdWalletBalances",
        {
            walletAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BitcoinService.getBitcoinHdWalletBalances(
                    params.walletAddress,
                    {
                        quoteCurrency: params.quoteCurrency as Quote
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [
                        { type: "text", text: `Error: ${error}` }
                    ],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getTransactionsForBtcAddress",
        {
            address: z.string(),
            pageSize: z.number().optional(),
            pageNumber: z.number().optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BitcoinService.getTransactionsForBtcAddress({
                    address: params.address,
                    pageSize: params.pageSize,
                    pageNumber: params.pageNumber
                });
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [
                        { type: "text", text: `Error: ${error}` }
                    ],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "getBitcoinNonHdWalletBalances",
        {
            walletAddress: z.string(),
            quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional()
        },
        async (params) => {
            try {
                const response = await goldRushClient.BitcoinService.getBitcoinNonHdWalletBalances(
                    params.walletAddress,
                    {
                        quoteCurrency: params.quoteCurrency as Quote
                    }
                );
                return {
                    content: [{
                        type: "text",
                        text: stringifyWithBigInt(response.data)
                    }]
                };
            } catch (error) {
                return {
                    content: [
                        { type: "text", text: `Error: ${error}` }
                    ],
                    isError: true
                };
            }
        }
    );
} 