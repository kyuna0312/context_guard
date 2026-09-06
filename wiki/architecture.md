# Architecture
_Last updated: 2026-09-06 | Source: docs/ARCHITECTURE.md (folded in, file deleted)_

## Summary
How the two halves fit end to end. Component reference is CLAUDE.md §A; this page is the flows.

## Token-saver flow
```
SessionStart → hooks.json (timeout 15) → session-start.sh
  ├─ word-counts ~/.claude/CLAUDE.md + $CLAUDE_PROJECT_DIR/CLAUDE.md (-ef guard for claude.md alias)
  ├─ validates ~/.claude/settings.json (stderr warning only; skipped without python3)
  ├─ stdout → LTX rows @v1:file|words|tokens|level
  └─ stderr → human warnings (thresholds: warn ≥600 words, critical ≥1000; tokens = words × 1.3)
statusline: JSON on stdin → statusline-command.sh → one ANSI line (fields \x1f-separated; copied to ~/.claude/ by install.sh, re-run after pulling)
```

## Forge loop
```
/scaffold ──────────► project files + register_project
     Write/Edit ────► record-change hook ────► changelogs   (no URL / no node_modules → silent no-op BY DESIGN)
/sync-template ─────► compute_suggestions ──► pending suggestions
     user confirms ─► apply_suggestion ─────► template_deps
```
- Scaffold: `list_templates` (only source of names, only id→name map) → `get_template` (verbatim; only `{{project_name}}`/`{{year}}` substituted) → write under new dir (refuse non-empty target, reject absolute/`..` paths) → exact deps + install + template `typecheck`/`build` → `register_project`.
- record-change: pg.Client 3s connect timeout; project = latest row whose `root_path` prefixes the file; any error → exit 0.
- Back-mapping: `compute_suggestions` aggregates `dep_added` rows per template (skipping deps already present), upserts pending suggestions (`min_occurrences` 2). `apply_suggestion` inserts `ON CONFLICT DO NOTHING` (`dep_inserted: false` = already there, existing pin kept).

## Failure modes
| Condition | Behavior |
|-----------|----------|
| `FORGE_DATABASE_URL` unset | MCP tools error with an explicit message; record-change is a no-op |
| DB host unreachable | Tool errors after 5s (pool) / hook gives up after 3s |
| Idle connection dropped | Pool logs to stderr; server keeps running |
| Zero rows | "nothing recorded" — never fabricated data |

## Data model
```
templates ─┬─< template_files  ├─< template_deps  └─< template_suggestions (pending | applied)
projects ──┬─ template_id → templates  └─< changelogs (append-only; project_name denormalised fallback)
```
Seed gotcha: file contents in `seed-example.sql` must be dollar-quoted — `'\n'` in a plain literal stores backslash+n.

## Related
- [[forge-setup]] · [[ltx-format]]
