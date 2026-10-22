# Contributing

Thanks for taking the time to contribute. This document covers basic guidelines for contributing to this repository.

## Submitting issues

- For feature requests, open a [GitHub issue](../../issues/new) describing the use case and proposed behavior.
- For bug reports, include reproduction steps, expected vs. actual behavior, and your environment (OS, Cursor version, plugin version).

## Repository layout

| Path | Purpose |
| --- | --- |
| `.cursor-plugin/plugin.json` | Plugin manifest (name, version, description, logo) |
| `mcp.json` | Registers the hosted Middleware MCP server |
| `skills/mwsetup/` | `/mwsetup`: first-time connection and routing of Middleware questions to the MCP server |
| `skills/mwconfig/` | `/mwconfig`: troubleshooting and switching project or account |
| `skills/mwtools/` | `/mwtools`: turning tools on or off through `exclude_tools` |
| `skills/*/references/mcp-settings.md` | Shared instructions. The three copies must stay identical. |
| `scripts/validate.mjs` | Structural checks, run in CI |

Skills can only read files inside their own directory, which is why the shared reference is copied into each skill. Edit one copy, then copy it over the other two.

## Testing locally

1. Copy the repository into Cursor's local plugin folder (symlinks only load when they resolve inside that folder):

   ```bash
   mkdir -p ~/.cursor/plugins/local
   rm -rf ~/.cursor/plugins/local/middleware
   cp -R . ~/.cursor/plugins/local/middleware
   ```

2. Disable the marketplace version of the plugin, if installed, then run the "Reload Window" action.
3. Run `/mwsetup`, `/mwconfig`, and `/mwtools` in an agent chat, and ask a few questions about your Middleware data.

## Validating

Requires Node.js 20 or later. No dependencies.

```bash
node scripts/validate.mjs
```

## Pull requests

1. Fork the repository and create your branch from `main`.
2. Make focused changes with clear commit messages.
3. Run `node scripts/validate.mjs` and test the plugin locally.
4. Bump `version` in `.cursor-plugin/plugin.json` for any user-facing change. Cursor reviews every update before it is published.
5. Open a pull request describing what changed and why.

## License

By contributing, you agree that your contributions will be licensed under the repository's [LICENSE](LICENSE) file.
