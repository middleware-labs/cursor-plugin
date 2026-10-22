# Middleware Cursor Plugin

Query your [Middleware](https://middleware.io/) observability data directly from Cursor using natural language. Ask about metrics, logs, traces, errors, RUM sessions, synthetic checks, dashboards, and more.

The plugin connects Cursor to the hosted [Middleware MCP Server](https://docs.middleware.io/opsai/mcp-server/overview) and adds a few agent commands for setup and configuration.

## What you need

- A [Middleware](https://middleware.io/) account with access to the project you want to query
- [Cursor](https://cursor.com/) IDE (v2.6.0+)

## Getting started

If you already added the Middleware MCP server to Cursor yourself (in `~/.cursor/mcp.json` or a project's `.cursor/mcp.json`), remove or disable it first to avoid duplicate tools.

1. Open the **Customize** tab by clicking the gear icon in the left sidebar, or by running the "Open Customize" action from the Command Palette.
2. Go to the **Plugins** section.
3. Install the **middleware** plugin.
4. Restart Cursor (or run the "Reload Window" action).
5. Authenticate the `middleware` MCP server when prompted. Your browser opens: sign in to Middleware, select the project you want to connect, and approve.

> If anything doesn't connect, run the `/mwsetup` command in an agent chat window. The agent will guide you through it.

## Using the plugin

Once connected, ask the agent anything about your Middleware data:

```
List my Middleware dashboards
```

```
Show me error-tracking incidents from the last hour
```

```
What was the p95 latency of the checkout service over the last 24 hours?
```

```
Which RUM sessions had frontend errors today? Include the replay links
```

```
Are any of my synthetic checks failing? Show their uptime for the last 7 days
```

## What the agent can do

| Area | Tools | Access |
| --- | --- | --- |
| Querying telemetry | `get_resources`, `get_metrics`, `query` for metrics, logs, traces and spans, and events | read |
| Error tracking | `list_errors`, `get_error_details` | read |
| RUM | `list_rum_applications`, `list_rum_sessions`, `get_rum_session`, `list_rum_errors` | read |
| Synthetics | uptime, check results, and test-run details; create, update, and delete checks and browser tests | read and write |
| Dashboards | list, get, create, update, delete, clone, and favorite dashboards | read and write |
| Widgets | list widgets and fetch their data; create, update, delete, and lay out widgets | read and write |

See [MCP Tools](https://docs.middleware.io/opsai/mcp-server/tools) for every tool's inputs and behavior.

## Can't connect?

**Never connected before?** Run the `/mwsetup` command in an agent chat window. It checks the connection and walks you through signing in.

**Was working before but stopped?** Run the `/mwconfig` command in an agent chat window. It checks the connection and helps you diagnose sign-in, project access, and network issues.

## Changing settings

The plugin provides commands you can run in the agent to manage configuration:

- `/mwconfig`: sign in again, or switch to a different Middleware project or account
- `/mwtools`: turn individual tools on or off, for example a read-only mode that disables every create, update, and delete tool

## Advanced usage

### Restricting tools by hand

`/mwtools` changes tool access by adding the server's `exclude_tools` query parameter to the URL in the plugin's `mcp.json`. You can make the same edit yourself, for example for a read-only connection:

```
https://mcp.middleware.io/mcp?exclude_tools=create_dashboard,update_dashboard,delete_dashboard,clone_dashboard,set_dashboard_favorite,create_widget,update_widget,delete_widget,update_widget_layouts,create_synthetic_check,create_browser_test,update_synthetic_check,update_browser_test,delete_synthetic_check
```

Excluded tools are hidden from Cursor and the server rejects calls to them. Tools that Middleware adds later are enabled automatically. Reload Cursor after editing. A plugin update may reset `mcp.json`; if it does, run `/mwtools` again.

## Good to know

- Authentication uses OAuth in your browser. The plugin contains no credentials, and you never paste a token or API key.
- Each sign-in connects one Middleware project, the one you select on the authorization screen.
- Your Middleware access token stays in Cursor and is sent only to the Middleware MCP server. Tool results (your observability data) go to the AI model you use in Cursor, like any other context the agent reads.

## Support

- [Middleware MCP Server documentation](https://docs.middleware.io/opsai/mcp-server/overview)
- [Setup and troubleshooting](https://docs.middleware.io/opsai/mcp-server/setup)
- [Report a bug or request a feature](https://github.com/middleware-labs/cursor-plugin/issues)

## Legal

See the [LICENSE](LICENSE) file included with this plugin.
