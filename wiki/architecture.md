# Architecture
_Last updated: 2026-09-06 | Source: docs/ARCHITECTURE.md (folded in, file deleted)_

## Summary
Component reference is CLAUDE.md §A; this page is the flows.

## Token-saver flow
```
SessionStart → hooks.json (timeout 15) → session-start.sh
  ├─ word-counts ~/.claude/CLAUDE.md + $CLAUDE_PROJECT_DIR/CLAUDE.md (-ef guard for claude.md alias)
  ├─ validates ~/.claude/settings.json (stderr warning only; skipped without python3)
  ├─ stdout (injected into context) → empty, or LTX rows @v1:file|words|tokens|level only for files over threshold
  └─ stderr → human warnings (thresholds: warn ≥600 words, critical ≥1000; tokens = words × 1.3)
statusline: JSON on stdin → statusline-command.sh → powerline line (fields \x1f-separated; copied to ~/.claude/ by install.sh, re-run after pulling)
  colours: green → yellow (ctx ≥50% / md ≥390t) → purple (≥75% / ≥780t) → red (≥90% / ≥1300t); rate-limit segment only ≥70%
```

## Related
- [[ltx-format]] · [[installation]]
