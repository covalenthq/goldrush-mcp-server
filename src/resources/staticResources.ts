import { validQuoteValues } from "../utils/constants.js";
import { ChainName } from "@covalenthq/client-sdk";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Adds static resources for configuration data.
 *
 * @param {McpServer} server - The MCP server instance
 * @remarks
 * This function creates static resources:
 * - "config://supported-chains" - List of supported chain names
 * - "config://quote-currencies" - List of supported quote currencies
 */
export function addStaticResources(server: McpServer) {
    /**
     * Provide a static resource listing the supported Covalent chain names.
     */
    server.resource(
        "supported-chains",
        "config://supported-chains",
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify(Object.values(ChainName), null, 2),
                },
            ],
        })
    );

    /**
     * Provide a static resource listing the supported Covalent quote currencies.
     */
    server.resource(
        "quote-currencies",
        "config://quote-currencies",
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify(
                        Object.values(validQuoteValues),
                        null,
                        2
                    ),
                },
            ],
        })
    );
}
