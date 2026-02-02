// SPDX-FileCopyrightText: 2026 @aronson <vagabond@pingas.org>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * MCP Server Implementation
 * JSON-RPC 2.0 over stdio for SpaceMolt game control.
 */

import { SpaceMoltClient } from "./client.ts";

interface JsonRpcRequest {
    jsonrpc: string;
    id: string | number | null;
    method: string;
    params?: Record<string, unknown>;
}

interface ToolDefinition {
    name: string;
    description: string;
    params?: Record<string, string>;
}

export class MCPServer {
    private client: SpaceMoltClient;

    constructor(client: SpaceMoltClient) {
        this.client = client;
    }

    async start(): Promise<void> {
        const decoder = new TextDecoder();
        for await (const chunk of Deno.stdin.readable) {
            const text = decoder.decode(chunk);
            const lines = text.split("\n");
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const request = JSON.parse(line) as JsonRpcRequest;
                    this.handleRequest(request);
                } catch {
                    this.sendError(null, -32700, "Parse error");
                }
            }
        }
    }

    private handleRequest(request: JsonRpcRequest): void {
        const { jsonrpc, id, method, params } = request;

        if (jsonrpc !== "2.0") {
            this.sendError(id, -32600, "Invalid Request");
            return;
        }

        switch (method) {
            case "get_status":
                this.sendResponse(id, this.client.getStatus());
                break;

            case "mine":
                this.executeCommand(id, "mine", {});
                break;

            case "dock":
                this.executeCommand(id, "dock", {});
                break;

            case "undock":
                this.executeCommand(id, "undock", {});
                break;

            case "travel":
                if (!params?.target_poi) {
                    this.sendError(id, -32602, "Invalid params: target_poi required");
                    break;
                }
                this.executeCommand(id, "travel", { target_poi: params.target_poi });
                break;

            case "sell":
                if (!params?.item_id || params?.quantity === undefined) {
                    this.sendError(id, -32602, "Invalid params: item_id and quantity required");
                    break;
                }
                this.executeCommand(id, "sell", {
                    item_id: params.item_id,
                    quantity: params.quantity,
                });
                break;

            case "send_command":
                if (!params?.type) {
                    this.sendError(id, -32602, "Invalid params: type required");
                    break;
                }
                this.executeCommand(id, params.type as string, (params.payload as Record<string, unknown>) || {});
                break;

            case "list_tools":
                this.sendResponse(id, this.getToolDefinitions());
                break;

            default:
                this.sendError(id, -32601, "Method not found");
        }
    }

    private executeCommand(id: string | number | null, type: string, payload: Record<string, unknown>): void {
        try {
            // deno-lint-ignore no-explicit-any
            this.client.send(type as any, payload);
            this.sendResponse(id, { status: "sent", command: type });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            this.sendError(id, -32000, message);
        }
    }

    private getToolDefinitions(): ToolDefinition[] {
        return [
            { name: "get_status", description: "Get current game status (credits, ship, location, cargo)" },
            { name: "mine", description: "Mine ore at current asteroid belt" },
            { name: "dock", description: "Dock at current POI's base" },
            { name: "undock", description: "Undock from base" },
            { name: "travel", description: "Travel to a POI within current system", params: { target_poi: "string" } },
            {
                name: "sell",
                description: "Sell items from cargo",
                params: { item_id: "string", quantity: "number" },
            },
            {
                name: "send_command",
                description: "Send a raw command to the server",
                params: { type: "string", payload: "object" },
            },
        ];
    }

    private sendResponse(id: string | number | null, result: unknown): void {
        console.log(JSON.stringify({ jsonrpc: "2.0", id, result }));
    }

    private sendError(id: string | number | null, code: number, message: string): void {
        console.error(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }));
    }
}
