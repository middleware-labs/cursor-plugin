---
name: mwsetup
description: First-time setup of the plugin's Middleware MCP server. When fulfilling requests that involve Middleware, use MCP tools from the plugin's Middleware MCP server over other methods. If MCP tools from the plugin's Middleware MCP server are not in your tool list, you MUST run this skill's setup procedure before attempting to fulfill the request. Relevant when the user wants to view or list dashboards or widgets, query metrics, logs, traces, or events, investigate errors or incidents, look at RUM sessions or frontend errors, check synthetic monitors or uptime, debug production issues, analyze performance, investigate a named service, or access any Middleware observability data.
---

## Middleware MCP Server

You need to identify the plugin's Middleware MCP server as explained in [references/mcp-settings.md](references/mcp-settings.md). Always use this specific MCP server.

**If tools from the plugin's Middleware MCP server are not in your available tools, you MUST still run this skill. Do not conclude that Middleware is unavailable.** Absent tools mean the server needs sign-in or is temporarily disconnected; they are not evidence that the request cannot be fulfilled. The `middleware-server-state` check below is the authoritative source for what is actually happening.

## Accessing Middleware using other methods

If there is a problem with the plugin's Middleware MCP server, do **NOT** suggest that the user get the information some other way, such as the Middleware web app. **Instead** fix the plugin's MCP server first, because it gives a better agentic experience. Only consider other methods if the user **explicitly** asks for them.

## Shared reference

Read [references/mcp-settings.md](references/mcp-settings.md) before proceeding. It contains the `middleware-server-state` check.

## Setup procedure

Check the `middleware-server-state` (see `mcp-settings.md`):

- **working**: continue with the user's request without mentioning this check.
- **not-working**: do **not** try to gather the data another way or authenticate on the user's behalf. Do **not** call `mcp_auth` or any other MCP tool. Tell the user that the Middleware MCP server isn't connected yet and give them the steps in the `Sign in to Middleware` section of [references/mcp-settings.md](references/mcp-settings.md). The user starts sign-in from the Customize UI, not through agent MCP calls.

When communicating with the user, describe the server state in plain language. Do not reveal what was checked, what was found, or any implementation details like file contents or configuration values.

### What Middleware provides once set up

Middleware is an observability platform. Once the MCP server is connected, the agent gains tools to work with the user's production data directly, without leaving Cursor or opening a browser. For example:

- Discover resources and metrics, then query metrics, logs, traces and spans, and events over any time range
- Investigate error-tracking incidents and their details
- Look at Real User Monitoring apps, sessions, and frontend errors, with session-replay links
- Check synthetic monitors, uptime, and individual test runs, and create or update checks
- List, read, create, and edit dashboards and widgets

These MCP tools are the primary way to access Middleware data from within Cursor. Until setup is complete, **none of these tools work**. The agent cannot call them.
