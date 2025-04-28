#!/usr/bin/env node
import { createGoldRushClient, createServer, startServer } from "./server.js";

// Start the server
startServer().catch(console.error);

// Re-export for external usage
export { createGoldRushClient, createServer, startServer };
