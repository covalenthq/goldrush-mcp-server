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

[📖 Documentation](https://goldrush.dev/docs/goldrush-mcp/)

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
- [Contributing](#contributing)
- [Show your support](#show-your-support)
- [License](#license)

---

## Key Features

Model Context Protocol (MCP) is a message protocol for connecting context or tool-providing servers with LLM clients. This server allows an LLM client to:

- Call Covalent GoldRush API endpoints as MCP Tools
- Read from MCP Resources that give chain info, quote currencies, chain statuses, etc.
- **Flexible Transport Support**: Unified server supporting both STDIO and HTTP transports
- **Command-line Interface**: Easy configuration via CLI arguments
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
            "args": ["-y", "@covalenthq/goldrush-mcp-server@latest"],
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
$ claude mcp add goldrush -e GOLDRUSH_API_KEY=<YOUR_API_KEY_HERE> -- npx -y @covalenthq/goldrush-mcp-server@latest
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
            "args": ["-y", "@covalenthq/goldrush-mcp-server@latest"],
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
            "args": ["-y", "@covalenthq/goldrush-mcp-server@latest"],
            "env": {
                "GOLDRUSH_API_KEY": "YOUR_API_KEY_HERE"
            }
        }
    }
}
```

### Programmatic Usage

The server supports both STDIO and HTTP transports for different integration scenarios:

#### STDIO Transport (Recommended for MCP Clients)

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@covalenthq/goldrush-mcp-server@latest"],
  env: {"GOLDRUSH_API_KEY": "your_api_key_here"}
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

// List tools and call them
const tools = await client.listTools();
console.log("Available tools:", tools.tools.map(tool => tool.name).join(", "));

const result = await client.callTool({
    name: "token_balances",
    arguments: {
        chainName: "eth-mainnet",
        address: "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de",
        quoteCurrency: "USD",
        nft: false,
    },
});
console.log("Token balances:", result.content);
```

#### HTTP Transport (For Web Integrations)

```bash
# Start the HTTP server
node dist/index.js --transport http --port 3000
```

Then make HTTP requests:

```javascript
const response = await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_GOLDRUSH_API_KEY'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'token_balances',
      arguments: {
        chainName: 'eth-mainnet',
        address: '0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de',
        quoteCurrency: 'USD',
        nft: false
      }
    }
  })
});

const result = await response.json();
console.log('Token balances:', result);
```

### Example LLM Flow

1. An LLM-based application starts.
2. It spawns or connects to this MCP server.
3. The LLM decides to call a tool like `transaction_summary` to gather data about a wallet.
4. The server calls the Covalent endpoint under the hood, returns JSON to the LLM, which then uses it in the conversation context.

---

## Tools

Tools are a powerful primitive in the Model Context Protocol (MCP) that enable servers to expose executable functionality to clients. Through tools, LLMs can interact with external systems, perform computations, and take actions in the real world.

Tools are designed to be model-controlled, meaning that tools are exposed from servers to clients with the intention of the AI model being able to automatically invoke them (with a human in the loop to grant approval).

1. `bitcoin_hd_wallet_balances`

    - Fetch balances for each active child address derived from a Bitcoin HD wallet. This tool provides detailed balance data for Bitcoin wallets identified by an xpub key. Required: walletAddress - The xpub key of the HD wallet. Optional: quoteCurrency - The currency for price conversion (USD, EUR, etc). Returns complete balance details including total balance, available balance, and transaction history summary.

2. `bitcoin_non_hd_wallet_balances`

    - Fetch Bitcoin balance for a non-HD address. Response includes spot prices and other metadata. This tool provides detailed balance data for regular Bitcoin addresses. Required: walletAddress - The Bitcoin address to query. Optional: quoteCurrency - The currency for price conversion (USD, EUR, etc). Returns complete balance details including total balance, available balance, and transaction count.

3. `bitcoin_transactions`

    - Fetch transactions for a specific Bitcoin address with full transaction details. Required: address - The Bitcoin address to query. Optional: pageSize - Number of results per page (default 100), pageNumber - Page number (default 0). Returns a paginated list of transactions with timestamps, amounts, inputs, outputs, and fees.

4. `block`

    - Commonly used to fetch and render a single block for a block explorer. Requires chainName (blockchain network) and blockHeight (block number). Returns comprehensive block data including timestamp, transaction count, size, miner information, and other blockchain-specific details.

5. `block_heights`

    - Commonly used to get all the block heights within a particular date range. Requires chainName (blockchain network), startDate (YYYY-MM-DD format), and endDate (YYYY-MM-DD or 'latest'). Optional pagination parameters include pageSize (default 10) and pageNumber (default 0). Returns block heights, timestamps, and related data for blocks within the specified date range, useful for historical analysis and time-based blockchain queries.

6. `erc20_token_transfers`

    - Commonly used to render the transfer-in and transfer-out of a token along with historical prices from an address. Required: chainName (blockchain network), walletAddress (wallet address). Optional: quoteCurrency for value conversion, contractAddress to filter by specific token, startingBlock/endingBlock to set range, pageSize (default 10) and pageNumber (default 0). Returns token transfer events with timestamps, values, and transaction details.

7. `gas_prices`

    - Get real-time gas estimates for different transaction speeds on a specific network, enabling users to optimize transaction costs and confirmation times. Requires chainName (blockchain network) and eventType (erc20, nativetokens, or uniswapv3). Optional parameter quoteCurrency allows conversion to different currencies (USD, EUR, etc). Returns estimated gas prices for low, medium, and high priority transactions for the specified event type.

8. `historical_portfolio_value`

    - Commonly used to render a daily portfolio balance for an address broken down by the token. Required: chainName (blockchain network), walletAddress (wallet address). Optional: quoteCurrency for value conversion, days (timeframe to analyze, default 7). Returns portfolio value time series data showing value changes over the specified timeframe.

9. `historical_token_balances`

    - Commonly used to fetch the historical native and fungible (ERC20) tokens held by an address at a given block height or date. Required: chainName (blockchain network), address (wallet address). Optional: quoteCurrency for value conversion, blockHeight or date to specify point in time, nft (include NFTs, default false), noNftFetch, noSpam, and noNftAssetMetadata (all default true). Returns token balances as they existed at the specified historical point.

10. `historical_token_prices`

    - Commonly used to get historic prices of a token between date ranges. Supports native tokens. Required: chainName (blockchain network), quoteCurrency (price currency), contractAddress (token contract), from (start date YYYY-MM-DD), to (end date YYYY-MM-DD). Optional: pricesAtAsc (set to true for chronological ascending order, default is false for descending order). Returns historical token prices for the specified time range.

11. `log_events_by_address`

    - Commonly used to get all the event logs emitted from a particular contract address. Useful for building dashboards that examine on-chain interactions. Requires chainName (blockchain network) and contractAddress (the address emitting events). Optional parameters include block range (startingBlock, endingBlock) and pagination settings (pageSize default 10, pageNumber default 0). Returns decoded event logs for the specified contract, useful for monitoring specific smart contract activity and analyzing on-chain events.

12. `log_events_by_topic`

    - Commonly used to get all event logs of the same topic hash across all contracts within a particular chain. Useful for cross-sectional analysis of event logs that are emitted on-chain. Requires chainName (blockchain network) and topicHash (the event signature hash). Optional parameters include block range (startingBlock, endingBlock), secondaryTopics for filtering by additional parameters, and pagination settings (pageSize default 10, pageNumber default 0). Returns decoded event logs matching the specified topic hash, ideal for tracking specific event types across multiple contracts on a blockchain.

13. `multichain_address_activity`

    - Gets a summary of wallet activity across all supported blockchains. Requires walletAddress. Optional parameter testnets (default false) determines whether to include testnet activity. Returns a comprehensive summary of chain activity including transaction counts, first/last activity timestamps, and activity status across all networks.

14. `multichain_balances`

    - Gets token balances for a wallet address across multiple blockchains. Requires walletAddress. Optional parameters include chains array to specify networks, quoteCurrency for value conversion, limit (default 10), pagination (before), and cutoffTimestamp to filter by time. Use this to get a comprehensive view of token holdings across different blockchains.

15. `multichain_transactions`

    - Gets transactions for multiple wallet addresses across multiple blockchains. Requires addresses array. Optional parameters include chains array, pagination (before/after), limit (default 10), quoteCurrency for value conversion, and options to include logs (withLogs, withDecodedLogs). Use this to analyze transaction history across different networks simultaneously.

16. `native_token_balance`

    - Get the native token balance (ETH, BNB, MATIC, etc.) for a specified wallet address on a blockchain. Required: chainName (blockchain network) and walletAddress. Optional: quoteCurrency for value conversion and blockHeight for historical queries. Returns detailed balance information including formatted amounts and USD values.

17. `nft_check_ownership`

    - Commonly used to verify ownership of NFTs (including ERC-721 and ERC-1155) within a collection. Required: chainName (blockchain network), walletAddress (wallet address), collectionContract (NFT collection). Optional: traitsFilter (filter by trait types), valuesFilter (filter by trait values). Returns ownership status and matching NFTs if owned.

18. `nft_for_address`

    - Commonly used to get all NFTs owned by a specific wallet address on a blockchain. Useful for NFT portfolio viewers. Required: chainName (blockchain network), walletAddress (wallet address). Optional: noSpam (exclude spam NFTs, default true), noNftAssetMetadata (exclude detailed metadata, default false), withUncached (include uncached items, default false). Returns a comprehensive list of all NFTs owned by the specified wallet.

19. `pool_spot_prices`

    - Get the spot token pair prices for a specified pool contract address. Supports pools on Uniswap V2, V3 and their forks. Required: chainName (blockchain network), contractAddress (pool contract address). Optional: quoteCurrency (price currency) for value conversion. Returns spot token pair prices with pool details and token metadata.

20. `token_approvals`

    - Commonly used to get a list of approvals across all token contracts categorized by spenders for a wallet's assets. Required: chainName (blockchain network, e.g. eth-mainnet or 1), walletAddress (wallet address, supports ENS, RNS, Lens Handle, or Unstoppable Domain). Returns a list of ERC20 token approvals and their associated security risk levels.

21. `token_balances`

    - Commonly used to fetch the native and fungible (ERC20) tokens held by an address. Required: chainName (blockchain network), address (wallet address). Optional: quoteCurrency for value conversion, nft (include NFTs, default false), noNftFetch, noSpam, and noNftAssetMetadata (all default true) to control data returned. Returns detailed token balance information including spot prices and metadata.

22. `token_holders`

    - Used to get a paginated list of current or historical token holders for a specified ERC20 or ERC721 token. Required: chainName (blockchain network), tokenAddress (token contract address). Optional: blockHeight or date for historical data, pageSize and pageNumber for pagination. Returns list of addresses holding the token with balance amounts and ownership percentages.

23. `transaction`

    - Commonly used to fetch and render a single transaction including its decoded log events. Required: chainName (blockchain network), txHash (transaction hash). Optional: quoteCurrency (currency to convert to, USD by default), noLogs (exclude event logs, true by default), withInternal (include internal transactions, false by default), withState (include state changes, false by default), withInputData (include input data, false by default). Tracing features (withInternal, withState, withInputData) supported on the following chains: eth-mainnet. Returns comprehensive details about the specified transaction.

24. `transaction_summary`

    - Commonly used to fetch the earliest and latest transactions, and the transaction count for a wallet. Required: chainName (blockchain network), walletAddress (wallet address). Optional: quoteCurrency, withGas (include gas usage statistics). Returns summary of transaction activity for the specified wallet.

25. `transactions_for_address`

    - Commonly used to fetch and render the most recent transactions involving an address. Required: chainName (blockchain network), walletAddress (wallet address), page (page number). Optional: quoteCurrency, noLogs, blockSignedAtAsc (chronological order). Returns transactions for the specified page of results.

26. `transactions_for_block`

    - Commonly used to fetch all transactions including their decoded log events in a block and further flag interesting wallets or transactions. Required: chainName (blockchain network), blockHeight (block number or latest). Optional: quoteCurrency, noLogs (exclude event logs). Returns all transactions from the specified block.

---

## Resources

Resources are a core primitive in the Model Context Protocol (MCP) that allow servers to expose data and content that can be read by clients and used as context for LLM interactions.

Resources are designed to be application-controlled, meaning that the client application can decide how and when they should be used. Different MCP clients may handle resources differently. For example:

- Claude Desktop currently requires users to explicitly select resources before they can be used
- Other clients might automatically select resources based on heuristics
- Some implementations may even allow the AI model itself to determine which resources to use

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
- **npm**, **yarn**, or **pnpm**
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

The server supports multiple transport options:

```bash
# Start with default STDIO transport (recommended for MCP clients)
npm run start

# Or explicitly specify STDIO transport
npm run start:stdio

# Start with HTTP transport on port 3000
npm run start:http

# Custom configuration with CLI arguments
node dist/index.js --transport http --port 8080
node dist/index.js --transport stdio --api-key YOUR_KEY_HERE
```

#### Transport Options

- **STDIO (default)**: Direct MCP protocol communication via stdin/stdout - ideal for MCP clients like Claude Desktop
- **HTTP**: RESTful HTTP server with `/mcp` endpoint - useful for web integrations

#### Command Line Arguments

- `--transport`, `-t`: Choose transport type (`stdio` or `http`)
- `--port`, `-p`: Set HTTP port (default: 3000)
- `--api-key`, `-k`: Provide API key directly
- `--help`, `-h`: Show usage information

STDIO transport spawns the MCP server on stdin/stdout where MCP clients can connect directly. HTTP transport starts a server that accepts POST requests to `/mcp` with Bearer token authentication.

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

### Setting GOLDRUSH_API_KEY

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
│   ├── index.ts                 # Main entry point with CLI parsing
│   ├── server.ts                # Unified server with STDIO and HTTP transports
│   ├── server-stdio.ts          # Legacy STDIO-only server (backup)
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
│   ├── Resources.test.ts
│   ├── SecurityService.test.ts
│   └── TransactionService.test.ts
├── eslint.config.mjs            # ESLint configuration
├── package.json                 # Project dependencies and scripts
├── package-lock.json            # Locked dependencies
├── tsconfig.json                # TypeScript configuration
├── LICENSE                      # MIT license
└── README.md                    # Project documentation
```

### Debugging

#### Using Inspector

https://modelcontextprotocol.io/docs/tools/inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## Contributing

We welcome contributions from the community! If you have suggestions, improvements, or new spam contract addresses to add, please open an issue or submit a pull request. Feel free to check <a href="https://github.com/covalenthq/goldrush-mcp-server/issues">issues</a> page.

## Show your support

Give a ⭐️ if this project helped you!

## License

This project is <a href="https://github.com/covalenthq/goldrush-mcp-server/blob/main/LICENSE">MIT</a> licensed.
