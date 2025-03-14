# GoldRush MCP Server

A Model Context Protocol (MCP) server that exposes Covalent's GoldRush API functionality as MCP tools, allowing AI assistants to query blockchain data through the Covalent GoldRush API.

## Features

- Implements the Model Context Protocol (MCP) specification
- Uses STDIO transport for communication
- Exposes Covalent GoldRush API methods as MCP tools
- Includes tools from BaseService, BalanceService, and TransactionService

## Prerequisites

- Node.js (v18 or higher)
- NPM or Yarn
- A GoldRush API key from Covalent

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/goldrush-mcp-server.git
   cd goldrush-mcp-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your GoldRush API key:
   ```
   GOLDRUSH_API_KEY=your_api_key_here
   ```

## Building

```
npm run build
```

## Usage

Start the server:

```
npm start
```

This will start the MCP server using the STDIO transport, ready to receive MCP protocol messages from an MCP client.

### As a subprocess

The server is designed to be started as a subprocess by an MCP client. For example, using the MCP TypeScript SDK:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["path/to/goldrush-mcp-server/dist/index.js"]
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

// Now you can call tools
const result = await client.callTool({
  name: "getAllChains",
  arguments: {}
});

console.log(result);
```

## Available Tools

### BaseService Tools

- **getAllChains**: Get a list of all chains, including those in development

### BalanceService Tools

- **getTokenBalancesForWalletAddress**: Get token balances for a specific wallet address
- **getHistoricalTokenBalancesForWalletAddress**: Get historical token balances for a wallet address at a specific block height or date

### TransactionService Tools

- **getAllTransactionsForAddress**: Get all transactions for a specific address
- **getTransaction**: Get details of a specific transaction by hash

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

## Acknowledgements

- [Covalent](https://www.covalenthq.com/) for their GoldRush API
- [MCP](https://modelcontextprotocol.io/) for the Model Context Protocol specification 