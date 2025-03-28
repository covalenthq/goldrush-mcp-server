<div align="center">

# GoldRush MCP Server

[![NPM Version](https://img.shields.io/npm/v/@covalenthq/goldrush-mcp-server)](https://www.npmjs.com/package/@covalenthq/goldrush-mcp-server)
[![NPM Downloads](https://img.shields.io/npm/dt/@covalenthq/goldrush-mcp-server)](https://www.npmjs.com/package/@covalenthq/goldrush-mcp-server)
[![GitHub license](https://img.shields.io/github/license/covalenthq/goldrush-mcp-server)](https://github.com/covalenthq/goldrush-mcp-server/blob/main/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/covalenthq/goldrush-mcp-server)](https://github.com/covalenthq/goldrush-mcp-server/commits/master)
[![GitHub contributors](https://img.shields.io/github/contributors/covalenthq/goldrush-mcp-server)](https://github.com/covalenthq/goldrush-mcp-server/graphs/contributors)
[![GitHub issues](https://img.shields.io/github/issues/covalenthq/goldrush-mcp-server)](https://github.com/covalenthq/goldrush-mcp-server/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/covalenthq/goldrush-mcp-server)](https://github.com/covalenthq/goldrush-mcp-server/pulls)

[![GitHub stars](https://img.shields.io/github/stars/covalenthq/goldrush-mcp-server)](https://github.com/covalenthq/goldrush-mcp-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/covalenthq/goldrush-mcp-server)](https://github.com/covalenthq/goldrush-mcp-server/network/members)

[📖 Documentation](https://https://goldrush.dev/docs/goldrush-mcp/)

</div>

---

This project provides a [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that exposes Covalent's [GoldRush](https://www.covalenthq.com/platform) APIs as MCP resources and tools. It is implemented in TypeScript using [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) and [@covalenthq/client-sdk](https://www.npmjs.com/package/@covalenthq/client-sdk).

---

## Table of Contents

- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [GoldRush API key](#goldrush-api-key)
  - [Usage with Claude Desktop](#usage-with-claude-desktop)
  - [Usage with Claude Code CLI](#usage-with-claude-code-cli)
  - [Usage with Cursor](#usage-with-cursor)
  - [Usage with Windsurf](#usage-with-windsurf)
  - [Programmatic Usage](#programmatic-usage)
  - [Example LLM Flow](#example-llm-flow)
- [Tools](#tools)
- [Resources](#resources)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the MCP Server](#running-the-mcp-server)
  - [Example Client](#example-client)
  - [Running the Tests](#running-the-tests)
  - [Setting GOLDRUSH_API_KEY](#setting-goldrush_api_key)
  - [File Layout](#file-layout)
  - [Debugging](#debugging)
- [License](#license)

---

## Key Features

Model Context Protocol (MCP) is a message protocol for connecting context or tool-providing servers with LLM clients. This server allows an LLM client to:

- Call Covalent GoldRush API endpoints as MCP Tools
- Read from MCP Resources that give chain info, quote currencies, chain statuses, etc.
- Fully testable with [Vitest](https://vitest.dev/) for testing each group of tools.
- Modular architecture where each service is implemented as a separate module, making the codebase easier to maintain and extend.

---

## Getting Started

### GoldRush API key

Using any of the GoldRush developer tools requires an API key.
Get yours at https://goldrush.dev/platform/auth/register/

### Usage with Claude Desktop
Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "goldrush": {
      "command": "npx",
      "args": [
        "-y",
        "@covalenthq/goldrush-mcp-server"
      ],
      "env": {
        "GOLDRUSH_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}   
```

For more details follow the official [MCP Quickstart for Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user)

### Usage with Claude Code CLI
```
$ claude mcp add goldrush -e GOLDRUSH_API_KEY=<YOUR_API_KEY_HERE> -- npx @covalenthq/goldrush-mcp-server
```
For more details see [Set up Model Context Protocol (MCP)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/tutorials#set-up-model-context-protocol-mcp) 

### Usage with Cursor

1. Open Cursor Settings
2. Go to Features > MCP
3. Click + Add new global MCP server
4. Add this to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "goldrush": {
      "command": "npx",
      "args": [
        "-y",
        "@covalenthq/goldrush-mcp-server"
      ],
      "env": {
        "GOLDRUSH_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}   
```

For project specific configuration, add the above to a `.cursor/mcp.json` file in your project directory. This allows you to define MCP servers that are only available within that specific project.

After adding, refresh the MCP server list to see the new tools. The Composer Agent will automatically use any MCP tools that are listed under Available Tools on the MCP settings page if it determines them to be relevant. To prompt tool usage intentionally, simply tell the agent to use the tool, referring to it either by name or by description.

See [Example LLM Flow](#example-llm-flow)

### Usage with Windsurf

Add this to your `~/.codeium/windsurf/mcp_config.json` file:

```json
{
  "mcpServers": {
    "goldrush": {
      "command": "npx",
      "args": [
        "-y",
        "@covalenthq/goldrush-mcp-server"
      ],
      "env": {
        "GOLDRUSH_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}   
```

### Programmatic Usage

The server is designed to be started as a subprocess by an MCP client. For example, using the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk):

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@covalenthq/goldrush-mcp-server"],
  env: {"GOLDRUSH_API_KEY"="your_api_key_here"}
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

await client.connect(transport);

// List tools
const resources = await client.listTools();
const tools = await client.listTools();
console.log("Available tools:", tools.tools.map(tool => tool.name).join(", "));

// Now you can call tools
const result = await client.callTool({
  name: "getAllChains",
  arguments: {}
});

console.log(result);
...
```

### Example LLM Flow

<!-- TODO: add more and better examples -->

1. An LLM-based application starts.
2. It spawns or connects to this MCP server.
3. The LLM decides to call a tool like `getTransactionSummary` to gather data about a wallet.
4. The server calls the Covalent endpoint under the hood, returns JSON to the LLM, which then uses it in the conversation context.

---

## Tools

Tools are a powerful primitive in the Model Context Protocol (MCP) that enable servers to expose executable functionality to clients. Through tools, LLMs can interact with external systems, perform computations, and take actions in the real world.

Tools are designed to be model-controlled, meaning that tools are exposed from servers to clients with the intention of the AI model being able to automatically invoke them (with a human in the loop to grant approval).

1.  `getTokenBalancesForWalletAddress`
    *   Gets the token balances for a specific wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `address` (string): The wallet address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `nft` (boolean, optional): Include NFTs in the response.
        *   `noNftFetch` (boolean, optional): Do not fetch NFT metadata.
        *   `noSpam` (boolean, optional): Exclude spam tokens.
        *   `noNftAssetMetadata` (boolean, optional): Do not include NFT asset metadata.
    *   Returns: A list of token balances for the specified wallet address.

2.  `getHistoricalTokenBalancesForWalletAddress`
    *   Gets the historical token balances for a specific wallet address on a given chain at a specific date or block height.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `address` (string): The wallet address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `nft` (boolean, optional): Include NFTs in the response.
        *   `noNftFetch` (boolean, optional): Do not fetch NFT metadata.
        *   `noSpam` (boolean, optional): Exclude spam tokens.
        *   `noNftAssetMetadata` (boolean, optional): Do not include NFT asset metadata.
        *   `blockHeight` (number, optional): The block height to query historical balances.
        *   `date` (string, optional): The date (YYYY-MM-DD) to query historical balances.
    *   Returns: A list of historical token balances for the specified wallet address.

3.  `getHistoricalPortfolioForWalletAddress`
    *   Gets the historical portfolio value over a period for a specific wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `days` (number, optional): The number of days of historical data to retrieve.
    *   Returns: Historical portfolio value data for the specified wallet address.

4.  `getErc20TransfersForWalletAddress`
    *   Gets all ERC20 token transfers for a specific wallet address on a given chain, handling pagination automatically.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `contractAddress` (string, optional): Filter transfers by a specific token contract address.
        *   `startingBlock` (number, optional): The starting block number to query transfers from.
        *   `endingBlock` (number, optional): The ending block number to query transfers to.
        *   `pageSize` (number, optional): Number of results per page (used internally for pagination).
        *   `pageNumber` (number, optional): Page number (used internally for pagination).
    *   Returns: A list containing all ERC20 transfers for the specified wallet address across all pages.

5.  `getErc20TransfersForWalletAddressByPage`
    *   Gets a single page of ERC20 token transfers for a specific wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `contractAddress` (string, optional): Filter transfers by a specific token contract address.
        *   `startingBlock` (number, optional): The starting block number to query transfers from.
        *   `endingBlock` (number, optional): The ending block number to query transfers to.
        *   `pageSize` (number, optional): Number of results per page.
        *   `pageNumber` (number, optional): Page number to retrieve.
    *   Returns: A single page of ERC20 transfers for the specified wallet address.

6.  `getTokenHoldersV2ForTokenAddress`
    *   Gets all token holders for a specific token contract address on a given chain at a specific block height or date, handling pagination automatically.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `tokenAddress` (string): The token contract address.
        *   `blockHeight` (string, optional): The block height to query token holders at.
        *   `date` (string, optional): The date (YYYY-MM-DD) to query token holders at.
        *   `pageSize` (number, optional): Number of results per page (used internally for pagination).
        *   `pageNumber` (number, optional): Page number (used internally for pagination).
    *   Returns: A list containing all token holders for the specified token address across all pages.

7.  `getTokenHoldersV2ForTokenAddressByPage`
    *   Gets a single page of token holders for a specific token contract address on a given chain at a specific block height or date.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `tokenAddress` (string): The token contract address.
        *   `blockHeight` (string, optional): The block height to query token holders at.
        *   `date` (string, optional): The date (YYYY-MM-DD) to query token holders at.
        *   `pageSize` (number, optional): Number of results per page.
        *   `pageNumber` (number, optional): Page number to retrieve.
    *   Returns: A single page of token holders for the specified token address.

8.  `getNativeTokenBalance`
    *   Gets the native token balance for a specific wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `blockHeight` (string, optional): The block height to query the balance at.
    *   Returns: The native token balance for the specified wallet address.

9.  `getApprovals`
    *   Gets the token approvals for a specific wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address.
    *   Returns: A list of token approvals for the specified wallet address.

10. `getNftApprovals`
    *   Gets the NFT approvals for a specific wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address.
    *   Returns: A list of NFT approvals for the specified wallet address.

11. `getAllTransactionsForAddress`
    *   Gets all transactions for a specific address on a given chain, handling pagination automatically.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `address` (string): The wallet or contract address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `noLogs` (boolean, optional): Exclude logs from the response.
        *   `blockSignedAtAsc` (boolean, optional): Sort transactions by block timestamp in ascending order.
        *   `withInternal` (boolean, optional): Include internal transactions.
        *   `withState` (boolean, optional): Include transaction state information.
        *   `withInputData` (boolean, optional): Include transaction input data.
    *   Returns: A list containing all transactions for the specified address across all pages.

12. `getTransaction`
    *   Gets details for a specific transaction hash on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `txHash` (string): The transaction hash.
    *   Returns: Detailed information about the specified transaction.

13. `getAllTransactionsForAddressByPage`
    *   Gets a single page of transactions for a specific address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `address` (string): The wallet or contract address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `noLogs` (boolean, optional): Exclude logs from the response.
        *   `blockSignedAtAsc` (boolean, optional): Sort transactions by block timestamp in ascending order.
        *   `withInternal` (boolean, optional): Include internal transactions.
        *   `withState` (boolean, optional): Include transaction state information.
        *   `withInputData` (boolean, optional): Include transaction input data.
    *   Returns: A single page of transactions for the specified address.

14. `getTransactionsForBlock`
    *   Gets transactions for a specific block height on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `blockHeight` (string): The block height or "latest".
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `noLogs` (boolean, optional): Exclude logs from the response.
    *   Returns: A list of transactions included in the specified block.

15. `getTransactionSummary`
    *   Gets a summary of transactions for a specific wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `withGas` (boolean, optional): Include gas usage details in the summary.
    *   Returns: A summary of transaction activity for the specified wallet address.

16. `getTransactionsForAddressV3`
    *   Gets transactions for a specific address on a given chain using the V3 endpoint (page-based).
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet or contract address.
        *   `page` (number): The page number to retrieve.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `noLogs` (boolean, optional): Exclude logs from the response.
        *   `blockSignedAtAsc` (boolean, optional): Sort transactions by block timestamp in ascending order.
    *   Returns: A page of transactions for the specified address from the V3 endpoint.

17. `getTimeBucketTransactionsForAddress`
    *   Gets transactions for a specific address within a given time bucket on a specific chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet or contract address.
        *   `timeBucket` (number): The time bucket identifier.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `noLogs` (boolean, optional): Exclude logs from the response.
    *   Returns: Transactions within the specified time bucket for the given address.

18. `getAllChains`
    *   Gets a list of all supported blockchain networks.
    *   Inputs: None
    *   Returns: A list of all chains supported by the GoldRush API.

19. `getAllChainStatus`
    *   Gets the synchronization status for all supported blockchain networks.
    *   Inputs: None
    *   Returns: The status information for all chains.

20. `getGasPrices`
    *   Gets gas price estimations for a specific event type on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `eventType` (string ["erc20", "nativetokens", "uniswapv3"]): The type of event to estimate gas for.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
    *   Returns: Gas price estimations for the specified event type.

21. `getBlock`
    *   Gets details for a specific block height on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `blockHeight` (string): The block height.
    *   Returns: Detailed information about the specified block.

22. `getResolvedAddress`
    *   Resolves an ENS or RNS domain name to its corresponding wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The domain name (e.g., ENS, RNS) or wallet address.
    *   Returns: The resolved address information.

23. `getBlockHeights`
    *   Gets all block heights within a specified date range on a given chain, handling pagination automatically.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `startDate` (string): The start date (YYYY-MM-DD).
        *   `endDate` (string): The end date (YYYY-MM-DD) or "latest".
        *   `pageSize` (number, optional): Number of results per page (used internally for pagination).
        *   `pageNumber` (number, optional): Page number (used internally for pagination).
    *   Returns: A list containing all block details within the date range across all pages.

24. `getBlockHeightsByPage`
    *   Gets a single page of block heights within a specified date range on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `startDate` (string): The start date (YYYY-MM-DD).
        *   `endDate` (string): The end date (YYYY-MM-DD) or "latest".
        *   `pageSize` (number, optional): Number of results per page.
        *   `pageNumber` (number, optional): Page number to retrieve.
    *   Returns: A single page of block details within the date range.

25. `getLogs`
    *   Gets blockchain log events based on various filter criteria on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `startingBlock` (number, optional): The starting block number.
        *   `endingBlock` (string, optional): The ending block number or "latest".
        *   `address` (string, optional): Filter logs by contract address.
        *   `topics` (string, optional): Filter logs by topic hashes (comma-separated).
        *   `blockHash` (string, optional): Filter logs by a specific block hash.
        *   `skipDecode` (boolean, optional): Skip decoding log event data.
    *   Returns: A list of log events matching the filter criteria.

26. `getLogEventsByAddress`
    *   Gets all log events emitted by a specific contract address on a given chain, handling pagination automatically.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `contractAddress` (string): The contract address.
        *   `startingBlock` (string, optional): The starting block number or "latest".
        *   `endingBlock` (string, optional): The ending block number or "latest".
        *   `pageSize` (number, optional): Number of results per page (used internally for pagination).
        *   `pageNumber` (number, optional): Page number (used internally for pagination).
    *   Returns: A list containing all log events for the specified address across all pages.

27. `getLogEventsByAddressByPage`
    *   Gets a single page of log events emitted by a specific contract address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `contractAddress` (string): The contract address.
        *   `startingBlock` (string, optional): The starting block number or "latest".
        *   `endingBlock` (string, optional): The ending block number or "latest".
        *   `pageSize` (number, optional): Number of results per page.
        *   `pageNumber` (number, optional): Page number to retrieve.
    *   Returns: A single page of log events for the specified address.

28. `getLogEventsByTopicHash`
    *   Gets all log events matching a specific topic hash on a given chain, handling pagination automatically.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `topicHash` (string): The primary topic hash to filter by.
        *   `startingBlock` (string, optional): The starting block number or "latest".
        *   `endingBlock` (string, optional): The ending block number or "latest".
        *   `secondaryTopics` (string, optional): Additional topic hashes to filter by (comma-separated).
        *   `pageSize` (number, optional): Number of results per page (used internally for pagination).
        *   `pageNumber` (number, optional): Page number (used internally for pagination).
    *   Returns: A list containing all log events matching the topic hash(es) across all pages.

29. `getLogEventsByTopicHashByPage`
    *   Gets a single page of log events matching a specific topic hash on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `topicHash` (string): The primary topic hash to filter by.
        *   `startingBlock` (string, optional): The starting block number or "latest".
        *   `endingBlock` (string, optional): The ending block number or "latest".
        *   `secondaryTopics` (string, optional): Additional topic hashes to filter by (comma-separated).
        *   `pageSize` (number, optional): Number of results per page.
        *   `pageNumber` (number, optional): Page number to retrieve.
    *   Returns: A single page of log events matching the topic hash(es).

30. `getChainCollections`
    *   Gets all NFT collections on a given chain, handling pagination automatically.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `pageSize` (number, optional): Number of results per page (used internally for pagination).
        *   `pageNumber` (number, optional): Page number (used internally for pagination).
        *   `noSpam` (boolean, optional): Exclude spam collections.
    *   Returns: A list containing all NFT collections on the specified chain across all pages.

31. `getChainCollectionsByPage`
    *   Gets a single page of NFT collections on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `pageSize` (number, optional): Number of results per page.
        *   `pageNumber` (number, optional): Page number to retrieve.
        *   `noSpam` (boolean, optional): Exclude spam collections.
    *   Returns: A single page of NFT collections on the specified chain.

32. `getNftsForAddress`
    *   Gets all NFTs owned by a specific wallet address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address.
        *   `noSpam` (boolean, optional): Exclude spam NFTs.
        *   `noNftAssetMetadata` (boolean, optional): Do not include NFT asset metadata.
        *   `withUncached` (boolean, optional): Include uncached NFTs.
    *   Returns: A list of NFTs owned by the specified wallet address.

33. `getTokenIdsForContractWithMetadata`
    *   Gets all token IDs and their metadata for a specific NFT contract address on a given chain, handling pagination automatically.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `contractAddress` (string): The NFT contract address.
        *   `noMetadata` (boolean, optional): Exclude metadata from the response.
        *   `pageSize` (number, optional): Number of results per page (used internally for pagination).
        *   `pageNumber` (number, optional): Page number (used internally for pagination).
        *   `traitsFilter` (string, optional): Filter by traits (e.g., 'trait1:value1,trait2:value2').
        *   `valuesFilter` (string, optional): Filter by trait values (e.g., 'value1,value2').
        *   `withUncached` (boolean, optional): Include uncached NFTs.
    *   Returns: A list containing all token IDs and metadata for the specified contract across all pages.

34. `getTokenIdsForContractWithMetadataByPage`
    *   Gets a single page of token IDs and their metadata for a specific NFT contract address on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `contractAddress` (string): The NFT contract address.
        *   `noMetadata` (boolean, optional): Exclude metadata from the response.
        *   `pageSize` (number, optional): Number of results per page.
        *   `pageNumber` (number, optional): Page number to retrieve.
        *   `traitsFilter` (string, optional): Filter by traits (e.g., 'trait1:value1,trait2:value2').
        *   `valuesFilter` (string, optional): Filter by trait values (e.g., 'value1,value2').
        *   `withUncached` (boolean, optional): Include uncached NFTs.
    *   Returns: A single page of token IDs and metadata for the specified contract.

35. `getNftMetadataForGivenTokenIdForContract`
    *   Gets the metadata for a specific token ID within an NFT contract on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `contractAddress` (string): The NFT contract address.
        *   `tokenId` (string): The specific token ID.
        *   `noMetadata` (boolean, optional): Exclude metadata from the response.
        *   `withUncached` (boolean, optional): Include uncached NFTs.
    *   Returns: The metadata for the specified NFT token ID.

36. `getNftTransactionsForContractTokenId`
    *   Gets the transaction history for a specific token ID within an NFT contract on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `contractAddress` (string): The NFT contract address.
        *   `tokenId` (string): The specific token ID.
        *   `noSpam` (boolean, optional): Exclude spam transactions.
    *   Returns: The transaction history for the specified NFT token ID.

37. `getTraitsForCollection`
    *   Gets the available traits for a specific NFT collection contract on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `collectionContract` (string): The NFT collection contract address.
    *   Returns: A list of traits available within the specified collection.

38. `getAttributesForTraitInCollection`
    *   Gets the possible attribute values for a specific trait within an NFT collection contract on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `collectionContract` (string): The NFT collection contract address.
        *   `trait` (string): The specific trait name.
    *   Returns: A list of attribute values for the specified trait in the collection.

39. `getCollectionTraitsSummary`
    *   Gets a summary of traits and their distribution within an NFT collection contract on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `collectionContract` (string): The NFT collection contract address.
    *   Returns: A summary of the trait distribution for the specified collection.

40. `getHistoricalFloorPricesForCollection`
    *   Gets the historical floor prices for an NFT collection over a specified number of days on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `collectionAddress` (string): The NFT collection contract address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `days` (number, optional): The number of days of historical data to retrieve.
    *   Returns: Historical floor price data for the specified collection.

41. `getHistoricalVolumeForCollection`
    *   Gets the historical trading volume for an NFT collection over a specified number of days on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `collectionAddress` (string): The NFT collection contract address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `days` (number, optional): The number of days of historical data to retrieve.
    *   Returns: Historical trading volume data for the specified collection.

42. `getHistoricalSalesCountForCollection`
    *   Gets the historical sales count for an NFT collection over a specified number of days on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `collectionAddress` (string): The NFT collection contract address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in (may not be used directly but included for consistency).
        *   `days` (number, optional): The number of days of historical data to retrieve.
    *   Returns: Historical sales count data for the specified collection.

43. `checkOwnershipInNft`
    *   Checks if a wallet address owns any NFT within a specific collection on a given chain, potentially filtered by traits.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address to check.
        *   `collectionContract` (string): The NFT collection contract address.
        *   `traitsFilter` (string, optional): Filter by traits (e.g., 'trait1:value1,trait2:value2').
        *   `valuesFilter` (string, optional): Filter by trait values (e.g., 'value1,value2').
    *   Returns: Information about the ownership status within the specified collection.

44. `checkOwnershipInNftForSpecificTokenId`
    *   Checks if a wallet address owns a specific token ID within an NFT collection on a given chain.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `walletAddress` (string): The wallet address to check.
        *   `collectionContract` (string): The NFT collection contract address.
        *   `tokenId` (string): The specific token ID to check ownership for.
    *   Returns: Information about the ownership status for the specific token ID.

45. `getTokenPrices`
    *   Gets the historical prices for a specific token contract address on a given chain within a date range.
    *   Inputs
        *   `chainName` (string): The name of the blockchain network.
        *   `quoteCurrency` (string): The currency to quote prices in.
        *   `contractAddress` (string): The token contract address.
        *   `from` (string, optional): The start date (YYYY-MM-DD) for the price history.
        *   `to` (string, optional): The end date (YYYY-MM-DD) for the price history.
        *   `pricesAtAsc` (boolean, optional): Sort prices by date in ascending order.
    *   Returns: Historical price data for the specified token.

46. `getMultiChainMultiAddressTransactions`
    *   Gets transactions across multiple chains and multiple addresses.
    *   Inputs
        *   `chains` (array(string), optional): List of chain names or IDs.
        *   `addresses` (array(string), optional): List of wallet or contract addresses.
        *   `limit` (number, optional): Maximum number of transactions to return.
        *   `before` (string, optional): Cursor for pagination (previous page).
        *   `after` (string, optional): Cursor for pagination (next page).
        *   `withLogs` (boolean, optional): Include logs in the response.
        *   `withDecodedLogs` (boolean, optional): Include decoded logs in the response.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
    *   Returns: A list of transactions matching the multi-chain and multi-address criteria.

47. `getMultiChainBalances`
    *   Gets token balances for a wallet address across multiple chains.
    *   Inputs
        *   `walletAddress` (string): The wallet address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
        *   `before` (string, optional): Cursor for pagination (previous page).
        *   `limit` (number, optional): Maximum number of results per chain.
        *   `chains` (array(string), optional): List of chain names or IDs to include.
        *   `cutoffTimestamp` (number, optional): Timestamp to query historical balances at.
    *   Returns: Token balances for the wallet address aggregated across the specified chains.

48. `getAddressActivity`
    *   Checks the activity status (active chains) for a given wallet address across all supported chains.
    *   Inputs
        *   `walletAddress` (string): The wallet address.
        *   `testnets` (boolean, optional): Include testnet chains in the activity check.
    *   Returns: A list of chains where the address has been active.

49. `getBitcoinHdWalletBalances`
    *   Gets balances for a Bitcoin Hierarchical Deterministic (HD) wallet address (xpub).
    *   Inputs
        *   `walletAddress` (string): The Bitcoin xpub address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
    *   Returns: Balance information for the specified Bitcoin HD wallet.

50. `getTransactionsForBtcAddress`
    *   Gets transactions for a specific Bitcoin address (standard, non-HD).
    *   Inputs
        *   `address` (string): The Bitcoin address.
        *   `pageSize` (number, optional): Number of results per page.
        *   `pageNumber` (number, optional): Page number to retrieve.
    *   Returns: A page of transactions for the specified Bitcoin address.

51. `getBitcoinNonHdWalletBalances`
    *   Gets balances for a standard (non-HD) Bitcoin wallet address.
    *   Inputs
        *   `walletAddress` (string): The standard Bitcoin address.
        *   `quoteCurrency` (string, optional): The currency to quote prices in.
    *   Returns: Balance information for the specified standard Bitcoin wallet address.

---

## Resources

Resources are a core primitive in the Model Context Protocol (MCP) that allow servers to expose data and content that can be read by clients and used as context for LLM interactions.

Resources are designed to be application-controlled, meaning that the client application can decide how and when they should be used. Different MCP clients may handle resources differently. For example:

* Claude Desktop currently requires users to explicitly select resources before they can be used
* Other clients might automatically select resources based on heuristics
* Some implementations may even allow the AI model itself to determine which resources to use

Resources exposed by the GoldRush MCP server are split into static and dynamic types:

- Static resources (`src/resources/staticResources.ts`):

    - `config://supported-chains`
    - `config://quote-currencies`

- Dynamic resources (`src/resources/dynamicResources.ts`):
    - `status://all-chains`
    - `status://chain/{chainName}`

Dynamic resources fetch real-time data from the Covalent API on each request, ensuring current information.

---

## Development

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **GOLDRUSH_API_KEY** environment variable containing a valid GoldRush API key

### Installation

```bash
git clone https://github.com/covalenthq/goldrush-mcp-server.git
cd goldrush-mcp-server
npm install
```

Then build:
```bash
npm run build
```

### Running the MCP Server
```bash
# Start the server (runs dist/index.js)
npm run start
```
This spawns the MCP server on stdin/stdout. Typically, an MCP client will connect to the server.

### Example Client

You can run the example client that will spawn the server as a child process via STDIO:

```
npm run example
```

This attempts a few Covalent calls and prints out the responses.

### Running the Tests

```
npm run test
```

This runs the entire test suite covering each service.

### Setting GOLDRUSH\_API\_KEY

You **must** set the `GOLDRUSH_API_KEY` environment variable to a valid key from the Covalent platform.  
For example on Linux/macOS:

```
export GOLDRUSH_API_KEY=YOUR_KEY_HERE
```

Or on Windows:

```
set GOLDRUSH_API_KEY=YOUR_KEY_HERE
```

### File Layout

```
goldrush-mcp-server
├── src
│   ├── index.ts                 # Main MCP server entry point
│   ├── services/                # Modular service implementations
│   │   ├── AllChainsService.ts  # Cross-chain service tools
│   │   ├── BalanceService.ts    # Balance-related tools
│   │   ├── BaseService.ts       # Basic blockchain tools
│   │   ├── BitcoinService.ts    # Bitcoin-specific tools
│   │   ├── NftService.ts        # NFT-related tools
│   │   ├── PricingService.ts    # Pricing-related tools
│   │   ├── SecurityService.ts   # Security-related tools
│   │   └── TransactionService.ts# Transaction-related tools
│   ├── resources/               # Resource implementations
│   │   ├── staticResources.ts   # Static configuration resources
│   │   └── dynamicResources.ts  # Dynamic chain status resources
│   ├── utils/                   # Utility functions and constants
│   │   ├── constants.ts         # Shared constants
│   │   └── helpers.ts           # Helper functions
│   └── example-client.ts        # Example LLM client using STDIO transport
├── test
│   ├── AllChainsService.test.ts
│   ├── BalanceService.test.ts
│   ├── BaseService.test.ts
│   ├── BitcoinService.test.ts
│   ├── NftService.test.ts
│   ├── PricingService.test.ts
│   ├── SecurityService.test.ts
│   ├── TransactionService.test.ts
│   └── Resources.test.ts
├── package.json
├── tsconfig.json
└── README.md (this file)
```

### Debugging

#### Using Inspector
https://modelcontextprotocol.io/docs/tools/inspector
```
npx @modelcontextprotocol/inspector node dist/index.js
```
---

## 🤝 Contributing

We welcome contributions from the community! If you have suggestions, improvements, or new spam contract addresses to add, please open an issue or submit a pull request. Feel free to check <a href="https://github.com/covalenthq/goldrush-mcp-server/issues">issues</a> page.

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

This project is <a href="https://github.com/covalenthq/goldrush-mcp-server/blob/main/LICENSE">MIT</a> licensed.
