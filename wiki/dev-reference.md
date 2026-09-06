# Dev Reference — smoke-test one-liners
_Last updated: 2026-08-07 | Source: CLAUDE.md verify table (moved here during optimization)_

## Summary
Verbose verify commands moved out of CLAUDE.md. The short ones (`node --test`, `python3 -m json.tool`, `bash -n`, `node --check`) stay in CLAUDE.md.

## Key Points
- **Run session-start hook**: `CLAUDE_PLUGIN_ROOT=$(pwd) bash hooks/scripts/session-start.sh`
- **Test status line**: `echo '{"context_window":{"used_percentage":72},"workspace":{"current_dir":"'"$PWD"'"},"model":{"display_name":"Fable 5"}}' | bash scripts/statusline-command.sh` — the model name must render whole; truncated = outdated installed copy.

## Related
- [[architecture]]
