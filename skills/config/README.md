# Config

Skills that change or diagnose `settings.json` and hooks. Only documented settings keys, always a diff before a write. **Claude Code only**: these act on Claude Code's `settings.json` and hook format.

- **[tune-settings](./tune-settings/SKILL.md)**: Proposes token-saving settings (`autoMemoryEnabled`, `disableBundledSkills`, `disabledMcpjsonServers`).
- **[settings-diff](./settings-diff/SKILL.md)**: Before/after diff of any settings change; run before every write.
- **[project-isolation](./project-isolation/SKILL.md)**: Scopes skills and hooks to the current project only.
- **[debug-hooks](./debug-hooks/SKILL.md)**: Diagnoses broken hook configs; ships `scripts/validate-hooks.sh` and hands multi-step repair to the `hook-error-fixer` agent.
