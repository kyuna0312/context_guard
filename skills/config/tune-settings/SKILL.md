---
name: tune-settings
description: Claude Code only. Review and apply documented token-saving settings.json keys (auto memory, bundled skills, MCP servers, auto-compaction) with a diff and backup before every write.
disable-model-invocation: true
---

# Tune Settings

Read and optimize `settings.json` (or `settings.local.json`) for minimal token usage. Diff and backup before writing. User-invoked only (`/context-forge:tune-settings`): a skill that writes user config must never fire on a fuzzy phrase match.

## Step 1: Find Settings Files

Check in order:
1. `./.claude/settings.json` (project)
2. `./.claude/settings.local.json` (project local)
3. `~/.claude/settings.json` (global)
4. `~/.claude/settings.local.json` (global local)

Read all found files.

## Step 2: Analyze Current Settings

Identify token-costly configuration. Only these keys are real — **never
propose a key you cannot find in the official settings reference; a
fabricated key is silently ignored and the "optimization" is a placebo:**

| Setting | Cost | Recommendation |
|---------|------|----------------|
| `autoMemoryEnabled: true` (default) | Medium | `false` if auto memory isn't used |
| `disableBundledSkills` unset | Medium | `true` to skip bundled skills at startup |
| Unused MCP servers in `.mcp.json` | Medium | Add to `disabledMcpjsonServers` |
| `autoCompactWindow` unset | Low | Tune via `/autocompact` if compaction fires too late |
| Hook scripts that read files | Medium | Audit hooks |
| Unused plugins | Low–Medium | `claude plugin uninstall <name>` (not a settings key) |

Note: skill *bodies* lazy-load — only frontmatter descriptions cost tokens
every session. The biggest constant cost is usually CLAUDE.md itself; check
that first (`estimate-tokens`) before touching settings.

## Step 3: Apply Token-Saving Config

Recommended low-token `settings.json` (real keys only):

```json
{
  "autoMemoryEnabled": false,
  "disableBundledSkills": true,
  "autoCompactEnabled": true,
  "disabledMcpjsonServers": ["unused-server-name"]
}
```

Key settings explained:
- `autoMemoryEnabled: false` — Disables auto memory loading each session
- `disableBundledSkills: true` — Skips Claude Code's bundled skills at startup
- `autoCompactEnabled: true` — Auto-compact instead of erroring at context limit (default, keep it)
- `disabledMcpjsonServers` — Rejects listed `.mcp.json` servers so their tool schemas never load

## Step 3b: Auto-compaction

Auto-compaction is **on by default** (`autoCompactEnabled: true`); only check whether it was explicitly disabled. `autoCompactWindow` (100,000–1,000,000 tokens) sets when it fires; the `/autocompact` command configures it interactively — prefer that over hand-editing. Manual: `/compact`. A `PreCompact` hook can run custom logic first (`references/compact-strategies.md`; use a real path like `~/.claude/hooks/pre-compact.sh`, never `$CLAUDE_PLUGIN_ROOT`, in a user's settings).

## Step 4: Show Diff and Confirm

One diff per file, minimal — never touch keys unrelated to the stated goal:

```
SETTINGS DIFF — ~/.claude/settings.json
  "autoMemoryEnabled": true → false
  + "disableBundledSkills": true
Impact: auto memory off; bundled skills skipped at startup. Reversible: yes.
Apply? (yes/no)
```

Ask user to confirm scope: project settings or global settings. Never write without an explicit yes.

## Step 5: Backup, then Write

```bash
cp ~/.claude/settings.json ~/.claude/settings.json.backup.$(date +%Y%m%d-%H%M%S)
```

Then write the updated file and print the backup path. **Warning:** global settings affect every Claude Code session.

## LTX Schema

Emit structured output as LTX rows when reporting settings analysis results.

```
@v1:setting|current|recommended|action
```

| Field | Description |
|-------|-------------|
| `setting` | Settings key (e.g. `autoMemoryEnabled`) |
| `current` | Current value or `missing` if not set |
| `recommended` | Recommended value for token savings |
| `action` | `change`, `keep`, `add` |

Example:
```
@v1:setting|current|recommended|action
autoMemoryEnabled|true|false|change
disableBundledSkills|missing|true|add
autoCompactEnabled|true|true|keep
```

## Additional Resources

- **`references/settings-reference.md`** — Full settings.json reference with token impact ratings
- **`references/diff-safety.md`** — backup/restore convention, multi-file diffs
- **`references/compact-strategies.md`** — PreCompact hook examples and compaction strategies
