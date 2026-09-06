# context_forge

[![test](https://github.com/kyuna0312/context_forge/actions/workflows/test.yml/badge.svg)](https://github.com/kyuna0312/context_forge/actions/workflows/test.yml)
[![site](https://img.shields.io/badge/site-kyuna0312.github.io%2Fcontext__forge-2bbcd5?style=flat)](https://kyuna0312.github.io/context_forge/)
[![version](https://img.shields.io/github/v/tag/kyuna0312/context_forge?label=version&color=49d575&style=flat)](https://github.com/kyuna0312/context_forge/blob/main/CHANGELOG.md)

**→ [kyuna0312.github.io/context_forge](https://kyuna0312.github.io/context_forge/)** — the one-page version of this README: what the status line shows, the hook flow, thresholds, install in two lines.

Two shell scripts that keep Claude Code's context small, plus 11 skills (prompt files) for trimming it further.

1. **Status line** — live context-window bar, CLAUDE.md token estimate, rate-limit warning, in your tmux palette.
2. **Session-start hook** — warns when a CLAUDE.md is over 600 words; prints nothing otherwise, so it costs no context itself.
3. **Skills** — `optimize-claudemd`, `estimate-tokens`, `low-token-mode`, `reset-context`, `tune-settings` and six more. The portable ones also run on **Codex** and **Gemini CLI**.

**Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) (PR-only `main`, CI on Ubuntu + macOS) · **Wiki:** generated from this README by `scripts/sync-wiki.sh`

**Docs:** domain glossary → [CONTEXT.md](CONTEXT.md) · decisions → [.agents/adr/](.agents/adr/) · changes → [CHANGELOG.md](CHANGELOG.md) · backlog → [docs/ROADMAP.md](docs/ROADMAP.md) · agent rules → [CLAUDE.md](CLAUDE.md)

---

## Status line

```
 context_forge   main  Fable 5  ctx ███████░░░ 72%  md ~952t 
```

Powerline segments in the tmux "Night City" palette (needs a Nerd Font for the `` separators): directory, branch, model, context bar, CLAUDE.md token estimate (words × 1.3), and a rate-limit segment that appears only from 70%.

**Step 1 — Copy script to permanent location:**

```bash
cp <repo>/scripts/statusline-command.sh ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh
```

**Step 2 — Add to `~/.claude/settings.json`:**

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/statusline-command.sh",
    "refreshInterval": 30
  }
}
```

**Step 3 — Restart Claude Code.**

**Test before wiring up:**

```bash
echo '{"context_window":{"used_percentage":72},"workspace":{"current_dir":"'"$PWD"'"},"model":{"display_name":"Fable 5"}}' \
  | bash ~/.claude/statusline-command.sh
```

Expected output ends with `Fable 5  ctx ███████░░░ 72%  md ~Nt` — the model name must render whole; a truncated name means the installed copy is outdated (re-run `install.sh`).

**Colour thresholds** (same palette for both segments):

| Colour | Context | CLAUDE.md tokens |
|--------|---------|------------------|
| Green (`#49d575`) | < 50% | < 390 |
| Yellow (`#f2c74b`) | ≥ 50% | ≥ 390 |
| Purple (`#be59d6`) | ≥ 75% | ≥ 780 |
| Red | ≥ 90% | ≥ 1300 |

---

## Session-start hook

```
SessionStart → hooks.json (timeout 15) → hooks/scripts/session-start.sh
  ├─ word-counts ~/.claude/CLAUDE.md + <project>/CLAUDE.md (-ef guard: CLAUDE.md/claude.md are one file on macOS)
  ├─ validates ~/.claude/settings.json (stderr warning only; skipped without python3)
  ├─ stdout → EMPTY, or LTX rows only for files over threshold (stdout is injected into Claude's context)
  └─ stderr → human warning: ⚠ TOKEN SAVER [WARNING]: CLAUDE.md is 753 words (~978 tokens) …
```

Thresholds: warn ≥ 600 words, critical ≥ 1000; tokens = words × 1.3.

To customize thresholds, edit `hooks/scripts/session-start.sh`:

```bash
readonly WARN_WORDS=600    # yellow warning
readonly CRIT_WORDS=1000   # red critical
```

---

## Skills

Grouped into buckets under `skills/`; each bucket has a `README.md` listing its skills. Invoke as `/context-forge:<skill>` (Claude Code), `$<skill>` (Codex), or just describe what you want. Skills marked **CC** act on Claude Code's `settings.json`, hooks or status line and are Claude Code only; everything else is portable. Skills marked **user-invoked** write your config and never auto-trigger.

**[context](skills/context/README.md)** — shrink what the agent loads or emits

| Skill | What it does |
|-------|-------------|
| [`optimize-claudemd`](skills/context/optimize-claudemd/SKILL.md) | Rewrites a bloated CLAUDE.md under 300 words without dropping constraints |
| [`estimate-tokens`](skills/context/estimate-tokens/SKILL.md) | Per-source token estimate with instruction-file size thresholds |
| [`low-token-mode`](skills/context/low-token-mode/SKILL.md) | Terse response discipline for the rest of the session |
| [`reset-context`](skills/context/reset-context/SKILL.md) | Safely resets context window when near full — prevents hard stops |
| [`manage-skills`](skills/context/manage-skills/SKILL.md) **CC** | Audits loaded skills, disables unused ones — reduces session overhead |
| [`token-statusline`](skills/context/token-statusline/SKILL.md) **CC, user-invoked** | Adds live context bar to Claude Code status line |

**[config](skills/config/README.md)** — settings.json and hooks, documented keys only (**CC**, all three)

| Skill | What it does |
|-------|-------------|
| [`tune-settings`](skills/config/tune-settings/SKILL.md) **user-invoked** | Diffs, backs up and applies token-saving settings (`autoMemoryEnabled`, `disableBundledSkills`, `disabledMcpjsonServers`, `autoCompactWindow`) |
| [`project-isolation`](skills/config/project-isolation/SKILL.md) **user-invoked** | Scopes skills and hooks to current project only |
| [`debug-hooks`](skills/config/debug-hooks/SKILL.md) | Diagnoses broken hook configurations with detailed validation output |

**[productivity](skills/productivity/README.md)** — workflow

| Skill | What it does |
|-------|-------------|
| [`task-brain-lite`](skills/productivity/task-brain-lite/SKILL.md) | Decomposes complex tasks into prioritized, dependency-aware subtasks |
| [`llm-wiki`](skills/productivity/llm-wiki/SKILL.md) | Builds a persistent wiki the agent reads instead of re-ingesting raw docs each session |

**Agent:** `hook-error-fixer` — diagnoses and auto-fixes broken hook configurations (backs up every file it edits).

---

## Installation

```bash
claude plugin marketplace add kyuna0312/context_forge
claude plugin install context-forge@context-forge
```

Then set up the status line once (next section). Plugins install through the
marketplace only — a bare clone or symlink under `~/.claude/plugins` is **not**
discovered. Update with `claude plugin update context-forge@context-forge`.

### From a clone (contributors)

```bash
git clone https://github.com/kyuna0312/context_forge.git ~/context_forge
bash ~/context_forge/scripts/install.sh      # marketplace add + install + status line copy
claude --plugin-dir ~/context_forge          # or: load in place without installing
```

`install.sh` also copies the status line script to `~/.claude/` (backing up a
modified copy first). The install is a snapshot: re-run after pulling, and
bump the versions in `.claude-plugin/*.json` for local changes to propagate.

### Uninstall

```bash
bash scripts/uninstall.sh
```

Or, without a clone: `claude plugin uninstall context-forge@context-forge`. The script additionally removes the marketplace registration and the installed statusline script (only if unmodified).

---

## Other agents (Codex, Gemini CLI)

The `SKILL.md` format is shared by Claude Code, Codex and Gemini CLI. Install the skills you want with [skills.sh](https://skills.sh) (it lists them and asks which agents to install to):

```bash
npx skills@latest add kyuna0312/context_forge            # interactive: pick skills + agents
npx skills@latest add kyuna0312/context_forge -a codex -s task-brain-lite -s llm-wiki -y
```

Skip the **CC** skills there; they only make sense inside Claude Code.

| Component | Claude Code | Codex | Gemini CLI |
|-----------|-------------|-------|------------|
| 6 portable skills (context, productivity) | plugin | skills.sh | skills.sh |
| 5 **CC** skills (settings, hooks, status line) | plugin | — | — |
| Session-start hook, status line, `hook-error-fixer` agent | plugin | — | — |

---

## Requirements

- Claude Code v2.1.97 or later (for `refreshInterval` support)
- `python3` — used by the token status line script and hook validation
- `node` ≥ 18 — only for running the test suite

---

## Tests

Zero-dependency validation suite using Node's built-in test runner:

```bash
node --test
```

Validates every JSON file, hook config and event names, skill/agent frontmatter, shell syntax, skill registration, and file paths referenced in SKILL.md, then runs the hook + statusline against sample input. Runs in CI on Ubuntu and macOS (bash 3.2, BSD coreutils) plus shellcheck (`.github/workflows/test.yml`).

**Smoke-test one-liners:**

```bash
CLAUDE_PLUGIN_ROOT=$(pwd) CLAUDE_PROJECT_DIR=$(pwd) bash hooks/scripts/session-start.sh   # empty stdout = all files under threshold
echo '{"context_window":{"used_percentage":72},"workspace":{"current_dir":"'"$PWD"'"},"model":{"display_name":"Fable 5"}}' | bash scripts/statusline-command.sh
CLAUDE_PLUGIN_ROOT=$(pwd) bash skills/config/debug-hooks/scripts/validate-hooks.sh hooks/hooks.json
claude plugin validate . --strict
```

---

## LTX Output Format

Skills and hooks emit structured data in **LTX (Low Token eXchange Format)** — a schema-based, pipe-delimited format that minimizes token overhead compared to JSON.

### Format

```
@v1:field1|field2|field3
value|value|value
value|value|value
```

- Header line: `@v1:<schema>` — defines field names
- Data rows: pipe-delimited values, one per line

### Example — session-start hook output

Hook stdout is injected into Claude's context, so the hook prints **nothing** while every file is under threshold. Over threshold:

**stdout (LTX, one row per offending file):**
```
@v1:file|words|tokens|level
~/.claude/CLAUDE.md|850|1105|warn
```

**stderr (human-readable):**
```
⚠ TOKEN SAVER [WARNING]: ~/.claude/CLAUDE.md is 850 words (~1105 tokens). Consider /context-forge:optimize-claudemd.
```

### Skill Schemas

| Skill | LTX Schema |
|-------|------------|
| `estimate-tokens` | `@v1:source\|words\|tokens\|status` |
| `debug-hooks` | `@v1:hook\|status\|error\|fix` |
| `tune-settings` | `@v1:setting\|current\|recommended\|action` |

Each skill's `SKILL.md` contains a `## LTX Schema` section with field definitions and examples.

---

## Project Structure

```
context_forge/
├── .agents/adr/                 # Design decisions (ADRs)
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest — `skills` lists the shipped set explicitly
│   └── marketplace.json         # Makes the repo its own single-plugin marketplace
├── .github/workflows/test.yml   # CI: node --test on every push/PR
├── CONTEXT.md                   # Domain glossary — the words this repo uses
├── CHANGELOG.md
├── agents/
│   └── hook-error-fixer.md      # Auto-diagnoses broken hooks
├── CONTRIBUTING.md              # Branch → PR → main; how to add a skill
├── docs/
│   ├── index.html               # The site (GitHub Pages, served from /docs)
│   └── ROADMAP.md               # Backlog + deliberate ceilings with upgrade paths
├── hooks/
│   ├── hooks.json               # SessionStart hook config
│   └── scripts/session-start.sh # CLAUDE.md size warning on startup
├── scripts/
│   ├── install.sh               # Registers local marketplace + installs plugin
│   ├── uninstall.sh             # Uninstalls plugin, marketplace + statusline copy
│   ├── list-skills.sh           # Prints <bucket>/<skill> for every SKILL.md
│   ├── sync-wiki.sh             # Regenerates the GitHub wiki from README + CONTRIBUTING
│   └── statusline-command.sh    # Status line renderer (copy to ~/.claude/)
├── skills/                      # One bucket per folder, README.md in each
│   ├── context/                 # 6 skills — instruction-file size, token estimates, reset, status line
│   ├── config/                  # 3 skills — settings.json, hooks (debug-hooks ships validate-hooks.sh)
│   └── productivity/            # 2 skills — task-brain-lite, llm-wiki
└── tests/
    └── repo.test.mjs            # Zero-dep validation suite (node --test)
```

---

## License

MIT
