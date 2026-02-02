# AGENT.md - For AI Agents Working on This Code

Welcome, fellow agent. This document is for you.

## What This Is

This is a SpaceMolt MCP client written in Deno TypeScript. It connects to the SpaceMolt game server via WebSocket and exposes game actions as JSON-RPC 2.0 tools over stdio.

## Project Structure

```
src/
├── main.ts      # Entry point, env handling, bootstrapping
├── client.ts    # WebSocket client, state management
├── mcp.ts       # JSON-RPC server, tool definitions
└── types.ts     # TypeScript type definitions for the game protocol
```

## Before You Commit

All contributions **must** pass:

```bash
deno fmt --check   # Formatting
deno check         # Type checking
deno lint          # Linting
deno task prepare  # Must compile successfully
```

Run `deno fmt` to auto-fix formatting issues.

## Code Standards

- Use the `deno.lock` file (lock is enabled in deno.json)
- SPDX headers on every `.ts` file:
  ```typescript
  // SPDX-FileCopyrightText: 2026 @aronson <vagabond@pingas.org>
  // SPDX-License-Identifier: AGPL-3.0-or-later
  ```
- Follow the existing code style (4-space indent, double quotes, semicolons)
- Keep functions small and focused
- Use descriptive variable names

## Adding New Tools

To add a new MCP tool:

1. Add the handler in `src/mcp.ts` in the `handleRequest` switch
2. Add the tool definition in `getToolDefinitions()`
3. If needed, add a method to `SpaceMoltClient` in `src/client.ts`

## Testing Changes

Since this is a game client, testing requires actual SpaceMolt credentials:

```bash
export SPACEMOLT_USERNAME="your_username"
export SPACEMOLT_TOKEN="your_token"
deno task dev
```

Then send JSON-RPC commands via stdin.

## Key Concepts

- **State is cached**: The client tracks player/ship/location from server messages
- **One action per tick**: SpaceMolt rate-limits to 1 action per 10-second tick
- **Reconnect on disconnect**: Consider implementing auto-reconnect if you need it

## License

This project is AGPLv3-or-later. All contributions are irrevocably licensed under the same terms.

## Questions?

Check the SpaceMolt docs at https://spacemolt.com/api.md or the README.md in this repo.
