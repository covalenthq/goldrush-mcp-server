# Changelog for GoldRush MCP Server

All notable changes to this project will be documented in this file.

## [0.0.4] - 2025-07-30

### Changed
- Updated @covalenthq/client-sdk from 2.2.6 to 2.3.2
  - Better error response standardization
  - Executable pagination functions
  - Various performance and stability improvements

## [0.0.3] - 2025-07-02

### Added
- Multi-transport support for MCP server
  - Added HTTP transport option alongside existing STDIO transport
  - New CLI commands: `npm run start:stdio` and `npm run start:http`
  - Command-line arguments: `--transport`, `--port`, `--api-key`, `--help`
  - HTTP transport supports Bearer token authentication
  - Configurable port for HTTP transport (default: 3000)
- Enhanced CLI interface with comprehensive argument parsing
- Graceful server shutdown handling for both transport types
- Enhanced resource metadata with title, description, and mimeType
- Improved parameter documentation across all service tools

### Changed
- Refactored server architecture to support multiple transport types
- Updated server implementation to use streamable HTTP transport
- Enhanced authorization header validation for HTTP transport
- Improved error handling with proper exception throwing instead of console.error
- Updated dependencies:
  - @modelcontextprotocol/sdk from 1.12.0 to 1.13.1
  - Various other dependency updates for performance and security
- Enhanced request ID extraction with try-catch for robustness
- Improved .gitignore for better project management

### Removed
- Removed unused server-stdio.ts file

## [0.0.2] - 2025-04-30

### Added
- Added `pool_spot_prices` tool to PricingService
  - Gets spot token pair prices for specified pool contract addresses
  - Supports pools on Uniswap V2, V3 and their forks
  - Returns detailed pool information with token metadata

### Changed
- Updated package version to 0.0.2 in package.json
- Updated @covalenthq/client-sdk dependency to version 2.2.6
- Updated example wallet address in code samples from "demo.eth" to "0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de" since the ENS domain had expired
- Updated README to include documentation for the new `pool_spot_prices` tool
- Added new example for `pool_spot_prices` in example-client.ts
- Updated tests to cover new functionality

## [0.0.1] - 2025-04-28

### Added
- Initial release of GoldRush MCP Server for interacting with Covalent GoldRush API
- Added MCP server implementation with 20+ tools for blockchain data access
- Integration with Covalent's client-sdk
- Added comprehensive documentation in README
- Added support for the following services:
  - AllChainsService (multichain_address_activity, multichain_balances, multichain_transactions)
  - BalanceService (erc20_token_transfers, historical_portfolio_value, historical_token_balances, native_token_balance, token_balances, token_holders)
  - BaseService (format_wallet_address, gas_prices, supported_chains)
  - BitcoinService (bitcoin_block, bitcoin_transaction)
  - NftService (nft_check_ownership, nft_for_address)
  - PricingService (historical_token_prices)
  - SecurityService (token_approvals)
  - TransactionService (transaction, transaction_summary, transactions_for_address, transactions_for_block)
- Added static and dynamic resources (chains, protocols, quote_currencies)
- Added comprehensive test suite for all services and resources
- Added example client implementation
- Added binary entry point for CLI usage with `npx @covalenthq/goldrush-mcp-server` 

### Changed
- Import version from package.json and update the MCP server version to reflect the current package version
- Changed package name for better clarity
- Refactored server structure by separating server logic into src/server.ts
- Updated main entry point in src/index.ts to export modules

