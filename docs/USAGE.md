# Advanced Usage

This document contains additional information about running the GoldRush MCP Server, customizing it, and hooking it into your own client.

## Transport Options

By default, the server uses **stdio** for communication. This is straightforward for local development:

- The server reads messages from `stdin`
- The server writes messages to `stdout`

If you want a network-based approach, you can provide an HTTP or SSE-based transport. For example, see the [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) docs for SSE-based servers.

## Tools and Resources

### Tools

All Covalent GoldRush endpoints are exposed as MCP "tools." Each service is organized into its own module under the `src/services/` directory:

- `AllChainsService.ts` - Cross-chain operations such as `getMultiChainBalances`
- `BalanceService.ts` - Balance-related operations
- `BaseService.ts` - Basic blockchain operations
- `BitcoinService.ts` - Bitcoin-specific operations
- `NftService.ts` - NFT-related operations
- `PricingService.ts` - Pricing-related operations
- `SecurityService.ts` - Security-related operations
- `TransactionService.ts` - Transaction-related operations

Each tool's name and input schema are defined in its respective service file using Zod. The main `index.ts` imports and registers all these service modules.

### Resources

Resources are split into static and dynamic types:

- Static resources (`src/resources/staticResources.ts`):
  - `config://supported-chains`
  - `config://quote-currencies`

- Dynamic resources (`src/resources/dynamicResources.ts`):
  - `status://all-chains`
  - `status://chain/{chainName}`

Dynamic resources fetch real-time data from the Covalent API on each request, ensuring current information.

## Development

1. **Code Organization**:
   - `src/index.ts` - Server setup and initialization
   - `src/services/` - Individual service modules 
   - `src/resources/` - Resource implementations
   - `src/utils/` - Utility functions and constants

2. **Adding New Services or Tools**:
   - Create a new service file in `src/services/` or add to an existing one
   - Follow the pattern of other services:
     ```typescript
     export function addYourServiceTools(server: McpServer, goldRushClient: GoldRushClient) {
         server.tool(
             "yourNewTool",
             { /* zod schema */ },
             async (params) => {
                 // Implementation
             }
         );
     }
     ```
   - Register your service in `src/index.ts`

3. **Testing** – We use [Vitest](https://vitest.dev/) with test files in `test/`:
   - `npm run test` runs all tests
   - Add corresponding test files for new services

4. **Integration** – If you want to integrate with a different or custom LLM client, see the `@modelcontextprotocol/sdk` documentation.

## Deploying

You can run this server as a stand-alone process or as part of a bigger system. For a stand-alone microservice:

1. Deploy to a server environment (Heroku, AWS, etc.)
2. Start it with `npm run start`
3. If using a custom transport, adapt the code in `index.ts` to your needs (like SSE or HTTP).

## Updating

If Covalent changes its API or adds new methods:

1. Update `@covalenthq/client-sdk` to the latest version
2. Add new tools in the appropriate service file under `src/services/`
3. If needed, create a new service file following the modular pattern
4. Register new services in `src/index.ts`

## Example Flow

1. An LLM-based application starts.
2. It spawns or connects to this MCP server.
3. The LLM decides to call a tool like `getTransactionSummary` to gather data about a wallet.
4. The server calls the Covalent endpoint under the hood, returns JSON to the LLM, which then uses it in the conversation context.

For further questions, see the main README or open an issue in your repository.