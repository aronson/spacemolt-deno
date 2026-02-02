// SPDX-FileCopyrightText: 2026 @aronson <vagabond@pingas.org>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * SpaceMolt WebSocket Client
 * Maintains persistent connection to the SpaceMolt game server.
 */

import { Message, MessageType, Player, POI, Ship, System } from "./types.ts";

export interface GameState {
    player: Player | null;
    ship: Ship | null;
    system: System | null;
    poi: POI | null;
    connected: boolean;
}

export class SpaceMoltClient {
    private ws: WebSocket | null = null;
    private url: string;

    public state: GameState = {
        player: null,
        ship: null,
        system: null,
        poi: null,
        connected: false,
    };

    constructor(url = "wss://game.spacemolt.com/ws") {
        this.url = url;
    }

    connect(username: string, token: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    this.state.connected = true;
                    this.login(username, token);
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    const msg = JSON.parse(event.data) as Message;
                    this.handleMessage(msg);
                };

                this.ws.onclose = () => {
                    this.state.connected = false;
                    console.error("WebSocket closed");
                };

                this.ws.onerror = (err) => {
                    console.error("WebSocket error:", err);
                    reject(err);
                };
            } catch (err) {
                reject(err);
            }
        });
    }

    private handleMessage(msg: Message): void {
        // Log all incoming server messages for introspection
        console.error(`[Server -> Client] ${msg.type}:`, JSON.stringify(msg.payload));

        switch (msg.type) {
            case "logged_in": {
                // deno-lint-ignore no-explicit-any
                const payload = msg.payload as any;
                this.state.player = payload.player;
                this.state.ship = payload.ship;
                this.state.system = payload.system;
                this.state.poi = payload.poi;
                break;
            }
            case "state_update": {
                // deno-lint-ignore no-explicit-any
                const payload = msg.payload as any;
                this.state.player = payload.player;
                this.state.ship = payload.ship;
                break;
            }
            case "ok": {
                // deno-lint-ignore no-explicit-any
                const payload = msg.payload as any;
                if (payload?.player) this.state.player = payload.player;
                if (payload?.ship) this.state.ship = payload.ship;
                if (payload?.system) this.state.system = payload.system;
                if (payload?.poi) this.state.poi = payload.poi;
                console.error("OK:", JSON.stringify(msg.payload));
                break;
            }
            case "error": {
                // deno-lint-ignore no-explicit-any
                const payload = msg.payload as any;
                console.error("Game Error:", payload.message);
                break;
            }
        }
    }

    private login(username: string, token: string): void {
        this.send("login", { username, token });
    }

    public send(type: MessageType, payload: Record<string, unknown> = {}): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("Not connected");
        }

        const msg: Message = {
            type,
            payload,
            timestamp: Date.now(),
        };

        this.ws.send(JSON.stringify(msg));
    }

    public getStatus(): Record<string, unknown> {
        return {
            connected: this.state.connected,
            player: this.state.player
                ? {
                    username: this.state.player.username,
                    credits: this.state.player.credits,
                    empire: this.state.player.empire,
                    docked: !!this.state.player.docked_at_base,
                }
                : null,
            ship: this.state.ship
                ? {
                    name: this.state.ship.name,
                    hull: this.state.ship.hull,
                    max_hull: this.state.ship.max_hull,
                    shield: this.state.ship.shield,
                    max_shield: this.state.ship.max_shield,
                    fuel: this.state.ship.fuel,
                    max_fuel: this.state.ship.max_fuel,
                    cargo: this.state.ship.cargo,
                    cargo_used: this.state.ship.cargo_used,
                    cargo_capacity: this.state.ship.cargo_capacity,
                }
                : null,
            location: {
                system: this.state.system?.name,
                poi: this.state.poi?.name,
            },
        };
    }
}
