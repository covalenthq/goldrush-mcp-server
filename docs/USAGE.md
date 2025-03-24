# Advanced Usage

This document contains additional information about running the GoldRush MCP Server, customizing it, and hooking it into your own client.

## Transport Options

By default, the server uses **stdio** for communication. This is straightforward for local development:

- The server reads messages from `stdin`
- The server writes messages to `stdout`

If you want a network-based approach, you can provide an HTTP or SSE-based transport. For example, see the [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) docs for SSE-based servers.

## Tools and Resources

### Tools

All Covalent GoldRush endpoints are exposed as MCP “tools.” For instance:

- `getMultiChainBalances`
- `getNftMetadataForGivenTokenIdForContract`
- `getApprovals`
- etc.

Each tool's name and input schema are defined in src/index.ts. The input schema is declared via [Zod](https://github.com/colinhacks/zod). On invocation, the server calls the corresponding Covalent GoldRush client method and returns the JSON result as a string.

### Resources

We also provide “resources,” read via `resources/read` calls:

- `config://supported-chains`
- `config://quote-currencies`
- `status://all-chains`
- `status://chain/eth-mainnet`
- `status://chain/{chainName}`

Requests to these URIs yield JSON describing chain status or configuration, dynamically fetched from the Covalent API where appropriate.

## Development

1. **Code** – Modify or add tools in `src/index.ts`. This file sets up each Covalent endpoint as a new tool.
2. **Testing** – We use [Vitest](https://vitest.dev/) with test files in `test/`.
	- `npm run test` runs all tests
3. **Integration** – If you want to integrate with a different or custom LLM client, see the `@modelcontextprotocol/sdk` documentation.

## Deploying

You can run this server as a stand-alone process or as part of a bigger system. For a stand-alone microservice:

1. Deploy to a server environment (Heroku, AWS, etc.)
2. Start it with `npm run start`
3. If using a custom transport, adapt the code in `index.ts` to your needs (like SSE or HTTP).

## Updating

If Covalent changes its API or adds new methods, simply update `@covalenthq/client-sdk` or add new tools in `src/index.ts`. For advanced usage like customizing pagination, examine the Covalent docs and adapt.

## Example Flow

1. An LLM-based application starts.
2. It spawns or connects to this MCP server.
3. The LLM decides to call a tool like `getTransactionSummary` to gather data about a wallet.
4. The server calls the Covalent endpoint under the hood, returns JSON to the LLM, which then uses it in the conversation context.

For further questions, see the main README or open an issue in your repository.