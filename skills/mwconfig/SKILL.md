---
name: mwconfig
description: Configures or troubleshoots the plugin's Middleware MCP server. Use when the user wants to switch to a different Middleware project or account, sign in again, or when the server was set up before but is no longer responding.
---

## Middleware MCP Server

You need to identify the plugin's Middleware MCP server as explained in [references/mcp-settings.md](references/mcp-settings.md). Always use this specific MCP server.

## Shared reference

Read [references/mcp-settings.md](references/mcp-settings.md) before proceeding. It contains the `middleware-server-state` check.

## Entry flow

Check the `middleware-server-state` (see `mcp-settings.md`). Do not output anything until the `middleware-server-state` is known, then proceed based on the result:

- **working**: without any preamble, tell the user the Middleware MCP server is connected and working. Then let the user choose between [switching to a different project or account](#project-flow) or [changing which Middleware tools are available](#tool-access-flow).
- **not-working**: without any preamble, tell the user the server is set up but not working, and go to the [Troubleshooting Flow](#troubleshooting-flow).

When communicating with the user below, describe the server state and actions in plain language. Do not reveal what was checked, what was found, or any implementation details like file contents or configuration values.

## Troubleshooting Flow

The server is set up but not responding. Present the user with the likely causes. Do not follow these sequentially; show them all and use judgment:

- **Sign-in expired or never completed.** The user needs to sign in again by following the `Sign in to Middleware` section of [references/mcp-settings.md](references/mcp-settings.md).

- **Server turned off in Cursor.** The `middleware` MCP server may be disabled. The same `Sign in to Middleware` steps cover turning it back on.

- **Project access.** The connected project may no longer exist, or the user's Middleware account may have lost access to it. Use the [Project Flow](#project-flow) to connect a project they can access, or ask their Middleware admin for access.

- **Network or proxy.** The user's network may block outbound HTTPS to `mcp.middleware.io` or `app.middleware.io`, or a proxy may strip the `Authorization` header. These two host names are the only configuration details you may share.

## Project Flow

Switches to a different Middleware project or account. The agent cannot do this automatically; the user must pick the target project in the browser.

Give the user the steps in the `Switch project or account` section of [references/mcp-settings.md](references/mcp-settings.md).

## Tool Access Flow

Changing which tools are available is handled by the `mwtools` skill. Follow that skill's instructions.
