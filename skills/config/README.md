# Config

Skills that change or diagnose `settings.json` and hooks. **Claude Code only.** The two that write config are user-invoked (`disable-model-invocation: true`): they never fire on a phrase match, only when you type them.

- **[tune-settings](./tune-settings/SKILL.md)** (user-invoked): Documented token-saving keys (auto memory, bundled skills, MCP servers, auto-compaction); diff + backup before every write.
- **[project-isolation](./project-isolation/SKILL.md)** (user-invoked): Scopes a session to the current project via a CLAUDE.md scope block and settings.local.json.
- **[debug-hooks](./debug-hooks/SKILL.md)**: Diagnoses broken hook configs; ships `scripts/validate-hooks.sh` and hands multi-step repair to the `hook-error-fixer` agent.
