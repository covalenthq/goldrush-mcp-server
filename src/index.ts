/**
 * @file index.ts
 * @description
 * The main entry point for the GoldRush MCP Server. This file sets up an MCP server
 * providing tools for Covalent GoldRush services:
 *  - AllChainsService
 *  - BaseService
 *  - BalanceService
 *  - TransactionService
 *  - BitcoinService
 *  - NftService
 *  - PricingService
 *
 * as well as static resources. It connects with Covalent's GoldRush API using
 * the @covalenthq/client-sdk.
 *
 * Key Features:
 *  - Tools coverage for:
 *    * AllChainsService
 *    * BaseService
 *    * BalanceService
 *    * TransactionService
 *    * BitcoinService
 *    * NftService
 *    * PricingService
 *  - Static resources listing supported chains and quote currencies
 *  - Environment-driven GOLDRUSH_API_KEY
 *
 * @notes
 *  - The GOLDRUSH_API_KEY environment variable must be set
 *  - Tools are implemented using zod for argument validation
 *  - Each tool returns the Covalent response as JSON text.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  Chain,
  ChainID,
  ChainName,
  GoldRushClient,
  Quote
} from "@covalenthq/client-sdk";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * A type-safe Zod enum referencing valid quote currencies for Covalent/GoldRush.
 * If Covalent adds new ones, we can add them here as needed.
 */
const QUOTE_VALUES = z.enum([
  "USD", "CAD", "EUR", "SGD", "INR", "JPY", "VND", "CNY",
  "KRW", "RUB", "TRY", "NGN", "ARS", "AUD", "CHF", "GBP"
]);

/**
 * Convert QUOTE_VALUES to a TypeScript array of valid quote currency strings.
 */
const validQuoteValues: readonly Quote[] = QUOTE_VALUES.options as Quote[];

/**
 * Retrieve API key from environment
 */
const apiKey = process.env.GOLDRUSH_API_KEY;
if (!apiKey) {
  console.error("GOLDRUSH_API_KEY environment variable is not set.");
  process.exit(1);
}

/**
 * Create a Covalent GoldRush client using the provided API key.
 */
const goldRushClient = new GoldRushClient(apiKey);

/**
 * Create an MCP server instance, specifying meta info.
 */
const server = new McpServer({
  name: "GoldRush MCP Server",
  version: "1.0.0"
});

/**
 * Provide a static resource listing the supported Covalent chain names.
 */
server.resource(
  "supported-chains",
  "config://supported-chains",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(Object.values(ChainName), null, 2)
    }]
  })
);

/**
 * Provide a static resource listing the supported Covalent quote currencies.
 */
server.resource(
  "quote-currencies",
  "config://quote-currencies",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(Object.values(validQuoteValues), null, 2)
    }]
  })
);

/**
 * Add AllChainsService Tools
 */
addAllChainsServiceTools(server);

/**
 * Add BaseService Tools
 */
addBaseServiceTools(server);

/**
 * Add BalanceService Tools
 */
addBalanceServiceTools(server);

/**
 * Add TransactionService Tools
 */
addTransactionServiceTools(server);

/**
 * Add BitcoinService Tools
 */
addBitcoinServiceTools(server);

/**
 * Add NftService Tools
 */
addNftServiceTools(server);

/**
 * Add PricingService Tools (Step #6)
 */
addPricingServiceTools(server);

/**
 * @function addAllChainsServiceTools
 * @description
 * Adds tools for Cross-Chain calls (AllChainsService).
 */
function addAllChainsServiceTools(server: McpServer) {
  server.tool(
    "getMultiChainMultiAddressTransactions",
    {
      chains: z.array(z.union([
        z.enum(Object.values(ChainName) as [string, ...string[]]),
        z.number()
      ])).optional(),
      addresses: z.array(z.string()).optional(),
      limit: z.number().optional(),
      before: z.string().optional(),
      after: z.string().optional(),
      withLogs: z.boolean().optional(),
      withDecodedLogs: z.boolean().optional(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.AllChainsService.getMultiChainMultiAddressTransactions({
          chains: params.chains as Chain[],
          addresses: params.addresses,
          limit: params.limit,
          before: params.before,
          after: params.after,
          withLogs: params.withLogs,
          withDecodedLogs: params.withDecodedLogs,
          quoteCurrency: params.quoteCurrency as Quote
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getMultiChainBalances",
    {
      walletAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      before: z.string().optional(),
      limit: z.number().optional(),
      chains: z.array(z.union([
        z.enum(Object.values(ChainName) as [string, ...string[]]),
        z.number()
      ])).optional(),
      cutoffTimestamp: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.AllChainsService.getMultiChainBalances(
          params.walletAddress,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            before: params.before,
            limit: params.limit,
            chains: params.chains as ChainID[] | ChainName[],
            cutoffTimestamp: params.cutoffTimestamp
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getAddressActivity",
    {
      walletAddress: z.string(),
      testnets: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.AllChainsService.getAddressActivity(
          params.walletAddress,
          { testnets: params.testnets }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );
}

//==================================================
//                BASE SERVICE
//==================================================
/**
 * @function addBaseServiceTools
 * @description
 * Adds tools for BaseService, including chain info, logs, etc.
 */
function addBaseServiceTools(server: McpServer) {
  server.tool(
    "getAllChains",
    {},
    async () => {
      try {
        const response = await goldRushClient.BaseService.getAllChains();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getAllChainStatus",
    {},
    async () => {
      try {
        const response = await goldRushClient.BaseService.getAllChainStatus();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getGasPrices",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      eventType: z.enum(["erc20", "nativetokens", "uniswapv3"]),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BaseService.getGasPrices(
          params.chainName as Chain,
          params.eventType,
          {
            quoteCurrency: params.quoteCurrency as Quote
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getBlock",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      blockHeight: z.string()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BaseService.getBlock(
          params.chainName as Chain,
          params.blockHeight
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getResolvedAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      walletAddress: z.string()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BaseService.getResolvedAddress(
          params.chainName as Chain,
          params.walletAddress
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getBlockHeights",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      startDate: z.string(),
      endDate: z.union([z.string(), z.literal("latest")]),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
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
            pageNumber: params.pageNumber
          }
        );
        for await (const page of iterator) {
          if (page.data?.items) {
            allBlocks.push(...page.data.items);
          }
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ items: allBlocks }, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getBlockHeightsByPage",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      startDate: z.string(),
      endDate: z.union([z.string(), z.literal("latest")]),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BaseService.getBlockHeightsByPage(
          params.chainName as Chain,
          params.startDate,
          params.endDate,
          {
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getLogs",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      startingBlock: z.number().optional(),
      endingBlock: z.string().optional(),
      address: z.string().optional(),
      topics: z.string().optional(),
      blockHash: z.string().optional(),
      skipDecode: z.boolean().optional()
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
            skipDecode: params.skipDecode
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getLogEventsByAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      contractAddress: z.string(),
      startingBlock: z.union([z.string(), z.number()]).optional(),
      endingBlock: z.union([z.string(), z.number()]).optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const allLogs: any[] = [];
        const iterator = goldRushClient.BaseService.getLogEventsByAddress(
          params.chainName as Chain,
          params.contractAddress,
          {
            startingBlock: params.startingBlock,
            endingBlock: params.endingBlock,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );
        for await (const page of iterator) {
          if (page.data?.items) {
            allLogs.push(...page.data.items);
          }
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ items: allLogs }, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getLogEventsByAddressByPage",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      contractAddress: z.string(),
      startingBlock: z.union([z.string(), z.number()]).optional(),
      endingBlock: z.union([z.string(), z.number()]).optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BaseService.getLogEventsByAddressByPage(
          params.chainName as Chain,
          params.contractAddress,
          {
            startingBlock: params.startingBlock,
            endingBlock: params.endingBlock,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getLogEventsByTopicHash",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      topicHash: z.string(),
      startingBlock: z.union([z.string(), z.number()]).optional(),
      endingBlock: z.union([z.string(), z.number()]).optional(),
      secondaryTopics: z.string().optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const allLogs: any[] = [];
        const iterator = goldRushClient.BaseService.getLogEventsByTopicHash(
          params.chainName as Chain,
          params.topicHash,
          {
            startingBlock: params.startingBlock,
            endingBlock: params.endingBlock,
            secondaryTopics: params.secondaryTopics,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );
        for await (const page of iterator) {
          if (page.data?.items) {
            allLogs.push(...page.data.items);
          }
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ items: allLogs }, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getLogEventsByTopicHashByPage",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      topicHash: z.string(),
      startingBlock: z.union([z.string(), z.number()]).optional(),
      endingBlock: z.union([z.string(), z.number()]).optional(),
      secondaryTopics: z.string().optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BaseService.getLogEventsByTopicHashByPage(
          params.chainName as Chain,
          params.topicHash,
          {
            startingBlock: params.startingBlock,
            endingBlock: params.endingBlock,
            secondaryTopics: params.secondaryTopics,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );
}

//==================================================
//             BALANCE SERVICE
//==================================================
/**
 * @function addBalanceServiceTools
 * @description
 * Tools for the BalanceService.
 */
function addBalanceServiceTools(server: McpServer) {
  server.tool(
    "getTokenBalancesForWalletAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      address: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      nft: z.boolean().optional(),
      noNftFetch: z.boolean().optional(),
      noSpam: z.boolean().optional(),
      noNftAssetMetadata: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BalanceService.getTokenBalancesForWalletAddress(
          params.chainName as Chain,
          params.address,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            nft: params.nft,
            noNftFetch: params.noNftFetch,
            noSpam: params.noSpam,
            noNftAssetMetadata: params.noNftAssetMetadata
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getHistoricalTokenBalancesForWalletAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      address: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      nft: z.boolean().optional(),
      noNftFetch: z.boolean().optional(),
      noSpam: z.boolean().optional(),
      noNftAssetMetadata: z.boolean().optional(),
      blockHeight: z.number().optional(),
      date: z.string().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BalanceService.getHistoricalTokenBalancesForWalletAddress(
          params.chainName as Chain,
          params.address,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            nft: params.nft,
            noNftFetch: params.noNftFetch,
            noSpam: params.noSpam,
            noNftAssetMetadata: params.noNftAssetMetadata,
            blockHeight: params.blockHeight,
            date: params.date
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getHistoricalPortfolioForWalletAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      walletAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      days: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BalanceService.getHistoricalPortfolioForWalletAddress(
          params.chainName as Chain,
          params.walletAddress,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            days: params.days
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getErc20TransfersForWalletAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      walletAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      contractAddress: z.string().optional(),
      startingBlock: z.number().optional(),
      endingBlock: z.number().optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const allTransfers = [];
        const iterator = goldRushClient.BalanceService.getErc20TransfersForWalletAddress(
          params.chainName as Chain,
          params.walletAddress,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            contractAddress: params.contractAddress,
            startingBlock: params.startingBlock,
            endingBlock: params.endingBlock,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );

        for await (const page of iterator) {
          if (page.data?.items) {
            allTransfers.push(...page.data.items);
          }
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ items: allTransfers }, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getErc20TransfersForWalletAddressByPage",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      walletAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      contractAddress: z.string().optional(),
      startingBlock: z.number().optional(),
      endingBlock: z.number().optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BalanceService.getErc20TransfersForWalletAddressByPage(
          params.chainName as Chain,
          params.walletAddress,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            contractAddress: params.contractAddress,
            startingBlock: params.startingBlock,
            endingBlock: params.endingBlock,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getTokenHoldersV2ForTokenAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      tokenAddress: z.string(),
      blockHeight: z.union([z.string(), z.number()]).optional(),
      date: z.string().optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const allHolders = [];
        const iterator = goldRushClient.BalanceService.getTokenHoldersV2ForTokenAddress(
          params.chainName as Chain,
          params.tokenAddress,
          {
            blockHeight: params.blockHeight,
            date: params.date,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );

        for await (const page of iterator) {
          if (page.data?.items) {
            allHolders.push(...page.data.items);
          }
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ items: allHolders }, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getTokenHoldersV2ForTokenAddressByPage",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      tokenAddress: z.string(),
      blockHeight: z.union([z.string(), z.number()]).optional(),
      date: z.string().optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BalanceService.getTokenHoldersV2ForTokenAddressByPage(
          params.chainName as Chain,
          params.tokenAddress,
          {
            blockHeight: params.blockHeight,
            date: params.date,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber
          }
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getNativeTokenBalance",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      walletAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      blockHeight: z.union([z.string(), z.number()]).optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.BalanceService.getNativeTokenBalance(
          params.chainName as Chain,
          params.walletAddress,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            blockHeight: params.blockHeight
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );
}

//==================================================
//             TRANSACTION SERVICE
//==================================================
/**
 * @function addTransactionServiceTools
 * @description
 * Tools for the TransactionService.
 */
function addTransactionServiceTools(server: McpServer) {
  server.tool(
    "getAllTransactionsForAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      address: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      noLogs: z.boolean().optional(),
      blockSignedAtAsc: z.boolean().optional(),
      withInternal: z.boolean().optional(),
      withState: z.boolean().optional(),
      withInputData: z.boolean().optional()
    },
    async (params) => {
      try {
        const transactions = [];
        const iterator = goldRushClient.TransactionService.getAllTransactionsForAddress(
          params.chainName as Chain,
          params.address,
          {
            quoteCurrency: params.quoteCurrency as Quote,
            noLogs: params.noLogs,
            blockSignedAtAsc: params.blockSignedAtAsc,
            withInternal: params.withInternal,
            withState: params.withState,
            withInputData: params.withInputData
          }
        );

        // Gather all pages
        for await (const response of iterator) {
          transactions.push(...(response.data?.items || []));
        }

        return {
          content: [{
            type: "text", text: JSON.stringify({ items: transactions }, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "getTransaction",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      txHash: z.string()
    },
    async (params) => {
      try {
        const response = await goldRushClient.TransactionService.getTransaction(
          params.chainName as Chain,
          params.txHash
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );
}

//==================================================
//                BITCOIN SERVICE
//==================================================
/**
 * @function addBitcoinServiceTools
 * @description
 * Adds tools for the BitcoinService.
 */
function addBitcoinServiceTools(server: McpServer) {
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
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
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
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
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
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
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

//==================================================
//             NFT SERVICE
//==================================================
/**
 * @function addNftServiceTools
 * @description
 * Tools for the NftService. They handle:
 *  - getChainCollections / getChainCollectionsByPage
 *  - getNftsForAddress
 *  - getTokenIdsForContractWithMetadata / getTokenIdsForContractWithMetadataByPage
 *  - getNftMetadataForGivenTokenIdForContract
 *  - getNftTransactionsForContractTokenId
 *  - getTraitsForCollection
 *  - getAttributesForTraitInCollection
 *  - getCollectionTraitsSummary
 *  - getHistoricalFloorPricesForCollection
 *  - getHistoricalVolumeForCollection
 *  - getHistoricalSalesCountForCollection
 *  - checkOwnershipInNft, checkOwnershipInNftForSpecificTokenId
 */
function addNftServiceTools(server: McpServer) {
  // getChainCollections - gather all pages
  server.tool(
    "getChainCollections",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional(),
      noSpam: z.boolean().optional()
    },
    async (params) => {
      try {
        const allItems = [];
        const iterator = goldRushClient.NftService.getChainCollections(
          params.chainName as Chain,
          {
            pageSize: params.pageSize,
            pageNumber: params.pageNumber,
            noSpam: params.noSpam
          }
        );
        for await (const page of iterator) {
          if (page.data?.items) {
            allItems.push(...page.data.items);
          }
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ items: allItems }, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getChainCollectionsByPage - single page
  server.tool(
    "getChainCollectionsByPage",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional(),
      noSpam: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getChainCollectionsByPage(
          params.chainName as Chain,
          {
            pageSize: params.pageSize,
            pageNumber: params.pageNumber,
            noSpam: params.noSpam
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getNftsForAddress
  server.tool(
    "getNftsForAddress",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      walletAddress: z.string(),
      noSpam: z.boolean().optional(),
      noNftAssetMetadata: z.boolean().optional(),
      withUncached: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getNftsForAddress(
          params.chainName as Chain,
          params.walletAddress,
          {
            noSpam: params.noSpam,
            noNftAssetMetadata: params.noNftAssetMetadata,
            withUncached: params.withUncached
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getTokenIdsForContractWithMetadata - gather all pages
  server.tool(
    "getTokenIdsForContractWithMetadata",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      contractAddress: z.string(),
      noMetadata: z.boolean().optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional(),
      traitsFilter: z.string().optional(),
      valuesFilter: z.string().optional(),
      withUncached: z.boolean().optional()
    },
    async (params) => {
      try {
        const allItems = [];
        const iterator = goldRushClient.NftService.getTokenIdsForContractWithMetadata(
          params.chainName as Chain,
          params.contractAddress,
          {
            noMetadata: params.noMetadata,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber,
            traitsFilter: params.traitsFilter,
            valuesFilter: params.valuesFilter,
            withUncached: params.withUncached
          }
        );
        for await (const page of iterator) {
          if (page.data?.items) {
            allItems.push(...page.data.items);
          }
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ items: allItems }, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getTokenIdsForContractWithMetadataByPage
  server.tool(
    "getTokenIdsForContractWithMetadataByPage",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      contractAddress: z.string(),
      noMetadata: z.boolean().optional(),
      pageSize: z.number().optional(),
      pageNumber: z.number().optional(),
      traitsFilter: z.string().optional(),
      valuesFilter: z.string().optional(),
      withUncached: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getTokenIdsForContractWithMetadataByPage(
          params.chainName as Chain,
          params.contractAddress,
          {
            noMetadata: params.noMetadata,
            pageSize: params.pageSize,
            pageNumber: params.pageNumber,
            traitsFilter: params.traitsFilter,
            valuesFilter: params.valuesFilter,
            withUncached: params.withUncached
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getNftMetadataForGivenTokenIdForContract
  server.tool(
    "getNftMetadataForGivenTokenIdForContract",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      contractAddress: z.string(),
      tokenId: z.string(),
      noMetadata: z.boolean().optional(),
      withUncached: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getNftMetadataForGivenTokenIdForContract(
          params.chainName as Chain,
          params.contractAddress,
          params.tokenId,
          {
            noMetadata: params.noMetadata,
            withUncached: params.withUncached
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getNftTransactionsForContractTokenId
  server.tool(
    "getNftTransactionsForContractTokenId",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      contractAddress: z.string(),
      tokenId: z.string(),
      noSpam: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getNftTransactionsForContractTokenId(
          params.chainName as Chain,
          params.contractAddress,
          params.tokenId,
          { noSpam: params.noSpam }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getTraitsForCollection
  server.tool(
    "getTraitsForCollection",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      collectionContract: z.string()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getTraitsForCollection(
          params.chainName as Chain,
          params.collectionContract
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getAttributesForTraitInCollection
  server.tool(
    "getAttributesForTraitInCollection",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      collectionContract: z.string(),
      trait: z.string()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getAttributesForTraitInCollection(
          params.chainName as Chain,
          params.collectionContract,
          params.trait
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getCollectionTraitsSummary
  server.tool(
    "getCollectionTraitsSummary",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      collectionContract: z.string()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getCollectionTraitsSummary(
          params.chainName as Chain,
          params.collectionContract
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getHistoricalFloorPricesForCollection
  server.tool(
    "getHistoricalFloorPricesForCollection",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      collectionAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      days: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getHistoricalFloorPricesForCollection(
          params.chainName as Chain,
          params.collectionAddress,
          {
            quote_currency: params.quoteCurrency as Quote,
            days: params.days
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getHistoricalVolumeForCollection
  server.tool(
    "getHistoricalVolumeForCollection",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      collectionAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      days: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getHistoricalVolumeForCollection(
          params.chainName as Chain,
          params.collectionAddress,
          {
            quote_currency: params.quoteCurrency as Quote,
            days: params.days
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // getHistoricalSalesCountForCollection
  server.tool(
    "getHistoricalSalesCountForCollection",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      collectionAddress: z.string(),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]).optional(),
      days: z.number().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.getHistoricalSalesCountForCollection(
          params.chainName as Chain,
          params.collectionAddress,
          {
            quote_currency: params.quoteCurrency as Quote,
            days: params.days
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // checkOwnershipInNft
  server.tool(
    "checkOwnershipInNft",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      walletAddress: z.string(),
      collectionContract: z.string(),
      traitsFilter: z.string().optional(),
      valuesFilter: z.string().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.checkOwnershipInNft(
          params.chainName as Chain,
          params.walletAddress,
          params.collectionContract,
          {
            traitsFilter: params.traitsFilter,
            valuesFilter: params.valuesFilter
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );

  // checkOwnershipInNftForSpecificTokenId
  server.tool(
    "checkOwnershipInNftForSpecificTokenId",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      walletAddress: z.string(),
      collectionContract: z.string(),
      tokenId: z.string()
    },
    async (params) => {
      try {
        const response = await goldRushClient.NftService.checkOwnershipInNftForSpecificTokenId(
          params.chainName as Chain,
          params.walletAddress,
          params.collectionContract,
          params.tokenId
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true
        };
      }
    }
  );
}

//==================================================
//             PRICING SERVICE
//==================================================
/**
 * @function addPricingServiceTools
 * @description
 * Tools for the PricingService.
 */
function addPricingServiceTools(server: McpServer) {
  server.tool(
    "getTokenPrices",
    {
      chainName: z.enum(Object.values(ChainName) as [string, ...string[]]),
      quoteCurrency: z.enum(Object.values(validQuoteValues) as [string, ...string[]]),
      contractAddress: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
      pricesAtAsc: z.boolean().optional()
    },
    async (params) => {
      try {
        const response = await goldRushClient.PricingService.getTokenPrices(
          params.chainName as Chain,
          params.quoteCurrency as Quote,
          params.contractAddress,
          {
            from: params.from,
            to: params.to,
            pricesAtAsc: params.pricesAtAsc
          }
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              response.data,
              (_, value) => typeof value === 'bigint' ? value.toString() : value,
              2
            )
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true
        };
      }
    }
  );
}

/**
 * @async
 * @function startServer
 * @description
 * Initializes the server using STDIO transport for communication, logs success or failure.
 */
async function startServer() {
  console.log("Starting GoldRush MCP server...");

  try {
    // Create the STDIO transport
    const transport = new StdioServerTransport();

    // Connect the server to the transport
    await server.connect(transport);

    console.log("GoldRush MCP server started successfully");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);