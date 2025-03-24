# GoldRush MCP Server

This project provides an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that exposes Covalent's [GoldRush](https://www.covalenthq.com/platform) APIs as MCP resources and tools. It is implemented in TypeScript using [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) and [@covalenthq/client-sdk](https://www.npmjs.com/package/@covalenthq/client-sdk).

## Overview

- **Server**: The MCP server provides comprehensive coverage of Covalent's GoldRush API services through a modular architecture:
  - **AllChainsService**  
  - **BaseService**  
  - **BalanceService**  
  - **TransactionService**  
  - **BitcoinService**  
  - **NftService**  
  - **PricingService**  
  - **SecurityService**  

- **MCP**: Model Context Protocol is a message protocol for connecting context or tool-providing servers with LLM clients. This server allows an LLM client to:
  - Call Covalent GoldRush API endpoints as "tools"
  - Read from "resources" that give chain info, quote currencies, chain statuses, etc.

## Features

1. **Tools** – The server registers each Covalent endpoint as an MCP tool, e.g. `getMultiChainBalances`, `getNftMetadataForGivenTokenIdForContract`, etc.
2. **Resources** – The server also provides read-only resources such as:
   - `config://supported-chains` – A JSON list of supported chain names  
   - `config://quote-currencies` – A JSON list of supported quote currencies  
   - `status://all-chains` – Real-time chain status  
   - `status://chain/{chainName}` – Status for a single chain
3. **Fully Testable** – Uses [Vitest](https://vitest.dev/) to test each group of tools. 
4. **Configuration** – Must specify `GOLDRUSH_API_KEY` environment variable for Covalent API calls.
5. **Modular Architecture** – Each service is implemented as a separate module, making the codebase easier to maintain and extend.

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **GOLDRUSH_API_KEY** environment variable containing a valid Covalent API key

## Installation

```bash
git clone https://github.com/covalenthq/goldrush-mcp-server.git
cd goldrush-mcp-server
npm install
```

Then build:
```bash
npm run build
```
## Usage
### Running the MCP Server
```bash
# Start the server (runs dist/index.js)
npm run start
```
This spawns the MCP server on stdin/stdout. Typically, an MCP client will connect to the server.

### Client Configuration
#### npx

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
        "COVALENT_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}   
```

#### Claude Code

```
$ claude mcp add goldrush -e GOLDRUSH_API_KEY=<YOUR_API_KEY> -- npx @covalenthq/goldrush-mcp-server
```

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

## File Layout

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
├── docs
│   └── USAGE.md                 # Additional usage documentation
├── package.json
├── tsconfig.json
└── README.md (this file)
```

## Documentation

See `docs/USAGE.md` for more details on how to integrate with or customize the server.

## Debugging

### Using Inspector
https://modelcontextprotocol.io/docs/tools/inspector
```
npx @modelcontextprotocol/inspector node dist/index.js
```

### Using Claude Code

```
$ claude mcp add goldrush-server -e GOLDRUSH_API_KEY=<YOUR_API_KEY> -- <NODE_EXECUTABLE_PATH>/node $PWD/dist/index.js
```


## License

TBD
