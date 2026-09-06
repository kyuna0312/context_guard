# Install through the plugin marketplace, not a symlink

Early versions of `scripts/install.sh` symlinked the repo under `~/.claude/plugins/`. Current Claude Code does not discover plugins that way; the symlink was silently ignored and users reported the hooks "not running".

## Decision

`install.sh` registers the clone as a local marketplace (`claude plugin marketplace add <repo>`), installs `context-forge@context-forge`, and runs `plugin update` unconditionally so re-running after a `git pull` refreshes the snapshot. `.claude-plugin/marketplace.json` makes the repo its own single-plugin marketplace. The plugin name is kebab-case because the Claude.ai marketplace sync rejects underscores (`claude plugin validate . --strict`).

## Consequences

- The install is a snapshot: updates are version-driven, so `.claude-plugin/*.json` versions must be bumped for local changes to propagate.
- `install.sh` and `uninstall.sh` remove the legacy symlink and the pre-0.3.0 `context_forge` registration if present.
- `claude --plugin-dir <repo>` stays the development route; nothing in the repo may depend on being installed.
