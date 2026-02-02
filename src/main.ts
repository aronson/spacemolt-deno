// SPDX-FileCopyrightText: 2026 @aronson <vagabond@pingas.org>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * SpaceMolt MCP Client
 * Entry point for SpaceMolt game client with MCP interface.
 *
 * Sandbox Permissions:
 * - --allow-net: Required for WebSocket connection to game server
 * - --allow-env: Required for SPACEMOLT_USERNAME and SPACEMOLT_TOKEN credentials
 *
 * This client uses stdio for MCP JSON-RPC, no filesystem access needed.
 */

import { SpaceMoltClient } from "./client.ts";
import { MCPServer } from "./mcp.ts";

const USERNAME = Deno.env.get("SPACEMOLT_USERNAME");
const TOKEN = Deno.env.get("SPACEMOLT_TOKEN");

if (!USERNAME || !TOKEN) {
    console.error("SPACEMOLT_USERNAME and SPACEMOLT_TOKEN environment variables are required");
    Deno.exit(1);
}

const client = new SpaceMoltClient();

console.error(`Connecting to SpaceMolt as ${USERNAME}...`);

try {
    await client.connect(USERNAME, TOKEN);
    console.error("Connected and logged in.");

    const server = new MCPServer(client);
    await server.start();
} catch (err) {
    console.error("Failed to connect:", err);
    Deno.exit(1);
}
