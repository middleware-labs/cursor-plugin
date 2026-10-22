---
name: mwtools
description: Manages which tools the plugin's Middleware MCP server exposes. Use when the user wants to view, enable, or disable Middleware MCP tools, turn on read-only mode, block write or delete actions, or reset to all tools.
---

## Middleware MCP Server

You need to identify the plugin's Middleware MCP server as explained in [references/mcp-settings.md](references/mcp-settings.md). Always use this specific MCP server.

## Shared reference

Read [references/mcp-settings.md](references/mcp-settings.md) before proceeding. It contains the `middleware-server-state` check.

## Entry flow

Check the `middleware-server-state` (see `mcp-settings.md`). Do not output anything until the `middleware-server-state` is known, then proceed based on the result:

- **working**: without any preamble, go to the [Tools Flow](#tools-flow).
- **not-working**: without any preamble, still go to the [Tools Flow](#tools-flow). Tool access is stored in the plugin, not on the server, so the user can change it while disconnected (for example, to turn tools back on). At the confirm step, also tell the user the Middleware MCP server isn't connected and that they should run `/mwsetup` after reloading.

When communicating with the user below, describe the state and actions in plain language. Do not reveal what was checked, what was found, or any implementation details like file contents or configuration values.

## Registration file

The plugin's MCP registration file is `mcp.json` at the root of this plugin, two directories above this skill's `SKILL.md`. Its `mcpServers.middleware.url` value is the Middleware MCP server URL. Tools are turned off with the server's `exclude_tools` query parameter, a comma-separated list of tool names:

```
https://mcp.middleware.io/mcp
https://mcp.middleware.io/mcp?exclude_tools=delete_dashboard,delete_synthetic_check
```

The server hides excluded tools from Cursor and rejects calls to them. The plugin lists only the tools that are turned **off**. Any tool Middleware adds to the server later is enabled automatically, so never rewrite this as an allow-list.

### Editing rule

- Change **only** the `exclude_tools` query parameter of the `url` value. Keep the scheme, host, path, every other key in the file, and the JSON formatting intact.
- When nothing is excluded, remove the parameter entirely, leaving no empty `exclude_tools=` and no trailing `?`.
- Write tool names separated by commas with no spaces. Order does not matter; compare lists as sets.

Examples:

```
https://mcp.middleware.io/mcp                                   →  https://mcp.middleware.io/mcp?exclude_tools=delete_dashboard
https://mcp.middleware.io/mcp?exclude_tools=delete_dashboard    →  https://mcp.middleware.io/mcp
```

## Tools Flow

### 1. Gather tool information

- **Full catalog.** Fetch the server's public protected-resource metadata (no sign-in needed). Build its URL from the registration file's server URL as `https://<host>/.well-known/oauth-protected-resource<path>`; for the default server that is `https://mcp.middleware.io/.well-known/oauth-protected-resource/mcp`. Its `scope_categories` array lists every category (`category`) and its tools (`tools[]` with `name`, `access` of `read` or `write`, and `description`).
- **Fallback.** If the metadata can't be fetched, the full catalog is the tools the server currently lists plus the names in `exclude_tools`. Treat tools whose names start with `create_`, `update_`, `delete_`, `clone_`, or `set_` as `write`, and the rest as `read`.
- **Current state.** Read the current `exclude_tools` list from the registration file. If there is none, every tool is enabled.

Any name in `exclude_tools` that is not in the catalog is unknown. Ignore it when presenting to the user, and silently drop it when writing the updated list.

Present every tool to the user, grouped by category. **Do not** summarize, and **do** choose the best format for the client (table, grouped list, etc.). Make it easy to see which tools are enabled or disabled and which ones only read data versus change or delete it.

### 2. Understand the user's intent

The user may want to:

- **Disable** specific tools or whole categories
- **Enable** tools that are currently disabled
- Turn on **read-only mode**, which disables every `write` tool
- Turn off **destructive actions** only, which disables every tool whose name starts with `delete_`
- **Reset**, which enables every tool

Understand the user's intent from their response. Ask for clarification if it is ambiguous.

### 3. Compute the new exclusion list

Apply the user's changes to the current exclusion list:

- If the user wants to reset, or nothing remains excluded → remove the `exclude_tools` parameter.
- If every tool would be excluded → do not apply the change. Tell the user at least one tool must stay enabled, and suggest read-only mode instead.
- If the result excludes `query`, `get_resources`, or `get_metrics` → warn the user before applying. These tools are how the agent discovers and queries metrics, logs, and traces, so most investigations depend on them. Only proceed if the user explicitly confirms.
- Otherwise → use the resulting comma-separated list.

### 4. Apply the change

Edit the `url` value in the registration file following the [editing rule](#editing-rule).

### 5. Confirm

Tell the user which tools are now disabled (or that all tools are enabled), and that they need to follow these steps:

1. Reload Cursor:
   - Open the Command Palette (⌘⇧P on Mac or Ctrl+Shift+P on Windows/Linux; show the correct shortcut for the current operating system)
   - Run the "Reload Window" action
2. After the reload, it may be necessary to re-authenticate the `middleware` MCP Server:
   - Open the Command Palette and run the "Open Customize" action
   - Authenticate the `middleware` MCP Server
