# Middleware Plugin General Instructions

## Stay on script

Describe state and actions in plain language ("the Middleware MCP server isn't connected yet", "tool access has been updated"). Never reveal, at any step:

- File paths, file names, or directory layout.
- The MCP server URL, its query parameters, or any other raw configuration value.
- Access tokens, API keys, or credentials of any kind. The Middleware MCP server signs in with OAuth in the browser; never ask the user to paste a token or key.

Beyond that, emit only what the current step instructs. Do not add setup tips, follow-ups, or "helpful" notes from your general knowledge of the AI client. When the user needs to reload, sign in again, or take any other follow-up action, the skill emits that instruction at the correct step. Preempting or paraphrasing it is a bug.

## Resolve the plugin's Middleware MCP server

Before using the MCP server, you MUST determine which server is the plugin's Middleware MCP server (there may be other Middleware MCP servers available):

1. Look at the MCP servers available to you (from your tool descriptors or MCP file-system listing).
2. Select the server whose name contains both `middleware` and `plugin` (case-insensitive). Known examples include `plugin-middleware-middleware` and other variants. Do not assume a specific name.
3. If exactly one server matches, use that server for all Middleware MCP calls in this skill.
4. If multiple servers match, ask the user which one is the plugin's Middleware MCP server (list the matching names). These skills target the server installed by this plugin; the README already warns users to remove any separately registered Middleware MCP server to avoid duplicate tools.
5. If no server matches, select a server whose name contains `middleware`, then repeat steps 3 and 4 above. If there is still no matching server, suggest that the user reinstall the plugin (or contact Middleware support) and then STOP.

Use the resolved server in all subsequent Middleware MCP calls.

## Determine `middleware-server-state`

Silently determine the `middleware-server-state` of the plugin's Middleware MCP server using **only** the steps below (do NOT use any other Middleware MCP server). Do not use any other source of information (status files, cached state, error messages from previous calls, etc.):

1. Call the `get_resources` tool on the plugin's Middleware MCP server. It takes no arguments and only reads data. If `get_resources` has been turned off for this connection, call another listed read-only tool that needs no required arguments instead, such as `get_synthetic_summary` or `list_dashboards` with `limit` set to `1`.
2. If the call returns real Middleware data (for example a list of resource types) → `middleware-server-state` is **working**.
3. If the tool is not available, the call fails, or it returns an error result (for example unauthorized, forbidden, or an expired session) → `middleware-server-state` is **not-working**.

A server whose tools are listed is not necessarily working: an expired sign-in still lists every tool and only fails when a tool is called. That is why this check calls a tool.

Do not tell the user which `middleware-server-state` was determined, what was checked, or what was found. Just follow the skill's instructions for that state.

## Sign in to Middleware

The user must do this; the agent cannot sign in on their behalf. Give the user these steps:

1. Open the Command Palette (⌘⇧P on Mac or Ctrl+Shift+P on Windows/Linux; show the correct shortcut for the current operating system).
2. Run the "Open Customize" action.
3. Find the `middleware` MCP server provided by the Middleware plugin, make sure it is enabled, and authenticate it.
4. A browser window opens. Sign in to Middleware, select the project to connect on the authorization screen, and approve.
5. Come back to Cursor and ask the question again.

If the `middleware` MCP server does not appear in the Customize tab at all, the user needs to reload Cursor first: open the Command Palette, run the "Reload Window" action, then repeat the steps above.

## Switch project or account

Each sign-in connects exactly one Middleware project, picked on the authorization screen. The agent cannot switch projects. To change it, the user reauthenticates:

1. Open the Command Palette and run the "Open Customize" action.
2. Reauthenticate the `middleware` MCP Server.
3. On the authorization screen, select the other project and approve. To use a different Middleware account, sign out of Middleware in the browser first, then sign in with the other account.
