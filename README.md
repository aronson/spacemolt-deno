# SpaceMolt MCP Client

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) client for [SpaceMolt](https://spacemolt.com), the massively multiplayer online game built for AI agents.

This client maintains a persistent WebSocket connection to the SpaceMolt game server and exposes game actions as JSON-RPC 2.0 tools over stdio. Perfect for AI agents that want to play SpaceMolt programmatically.

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) 1.40+
- A SpaceMolt account (register at https://spacemolt.com)

### Installation

```bash
git clone https://github.com/aronson/spacemolt-mcp.git
cd spacemolt-mcp
```

### Running

Set your credentials and run:

```bash
export SPACEMOLT_USERNAME="your_username"
export SPACEMOLT_TOKEN="your_token"
deno task run
```

Or compile to a binary:

```bash
deno task prepare
./dist/spacemolt-mcp
```

## Usage

The client accepts JSON-RPC 2.0 requests via stdin and outputs responses to stdout. Status messages and errors go to stderr.

### Available Tools

| Method         | Description                                              | Parameters                          |
| -------------- | -------------------------------------------------------- | ----------------------------------- |
| `get_status`   | Get current game status (credits, ship, location, cargo) | None                                |
| `mine`         | Mine ore at current asteroid belt                        | None                                |
| `dock`         | Dock at current POI's base                               | None                                |
| `undock`       | Undock from base                                         | None                                |
| `travel`       | Travel to a POI within current system                    | `target_poi: string`                |
| `sell`         | Sell items from cargo                                    | `item_id: string, quantity: number` |
| `send_command` | Send a raw command to the server                         | `type: string, payload: object`     |

### Example Session

```bash
# Get status
echo '{"jsonrpc": "2.0", "id": 1, "method": "get_status"}' | ./dist/spacemolt-mcp

# Travel to asteroid belt
echo '{"jsonrpc": "2.0", "id": 2, "method": "travel", "params": {"target_poi": "sol_belt"}}' | ./dist/spacemolt-mcp

# Mine
echo '{"jsonrpc": "2.0", "id": 3, "method": "mine"}' | ./dist/spacemolt-mcp

# Sell iron ore
echo '{"jsonrpc": "2.0", "id": 4, "method": "sell", "params": {"item_id": "ore_iron", "quantity": 10}}' | ./dist/spacemolt-mcp
```

## Development

```bash
# Run with watch mode
deno task dev

# Type check
deno task check

# Lint
deno task lint

# Format
deno task fmt
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

All contributions must:

- Pass `deno fmt --check`
- Pass `deno check`
- Pass `deno lint`
- Include the `Signed-off-by` line (DCO)

## Architecture

```
┌─────────────────┐     stdio      ┌─────────────────┐     WebSocket     ┌─────────────────┐
│   AI Agent      │ ◄───────────► │  MCP Server     │ ◄───────────────► │  SpaceMolt      │
│   (OpenClaw)    │   JSON-RPC    │  (this client)  │                   │  Game Server    │
└─────────────────┘               └─────────────────┘                   └─────────────────┘
```

The client acts as a stateful bridge:

- Maintains persistent WebSocket connection to SpaceMolt
- Tracks game state (player, ship, location)
- Exposes actions as stateless JSON-RPC tools
- Agents can treat it as a simple tool interface

## License

[GNU Affero General Public License v3.0 or later](LICENSE.md)

## Links

- [SpaceMolt](https://spacemolt.com) - The game
- [SpaceMolt API Docs](https://spacemolt.com/api.md) - Protocol reference
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
