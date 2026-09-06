#!/usr/bin/env bash
# session-start.sh: Warn when CLAUDE.md exceeds token budget thresholds.
# Runs on SessionStart. stdout is injected into Claude's context, so it stays
# EMPTY unless a file exceeds a threshold — then one LTX header + row per file.
set -euo pipefail

# LTX emitters: schema header + pipe-delimited rows to stdout, human notes to stderr
ltx_header() { echo "@v1:${1}"; }
ltx_row()    { local IFS='|'; echo "$*"; }
ltx_human()  { echo "$1" >&2; }

readonly WARN_WORDS=600
readonly CRIT_WORDS=1000

header_done=0
emit_row() { [ "$header_done" = 1 ] || { ltx_header "file|words|tokens|level"; header_done=1; }; ltx_row "$@"; }

check_claudemd_size() {
  local file_path="$1"
  local label="$2"

  if [ ! -f "$file_path" ]; then
    return 0
  fi

  local word_count token_estimate level
  # $((...)) strips the leading whitespace macOS wc emits
  word_count=$(( $(wc -w < "$file_path") ))
  token_estimate=$(( word_count * 13 / 10 ))   # ponytail: words × 1.3 estimate, not a tokenizer; good enough for a threshold

  if [ "$word_count" -ge "$CRIT_WORDS" ]; then
    level="critical"
    ltx_human "⚠ TOKEN SAVER [CRITICAL]: $label is ${word_count} words (~${token_estimate} tokens). Run /context-forge:optimize-claudemd"
  elif [ "$word_count" -ge "$WARN_WORDS" ]; then
    level="warn"
    ltx_human "⚠ TOKEN SAVER [WARNING]: $label is ${word_count} words (~${token_estimate} tokens). Consider /context-forge:optimize-claudemd."
  else
    return 0   # ok → nothing on stdout; silence is the token-cheap default
  fi

  emit_row "$file_path" "$word_count" "$token_estimate" "$level"
}

# Human warning only — settings.json has no words/tokens to report in the LTX schema.
validate_settings_json() {
  local settings_path="$HOME/.claude/settings.json"
  [ -f "$settings_path" ] && command -v python3 >/dev/null 2>&1 || return 0
  python3 -c "import json, sys; json.load(open(sys.argv[1]))" "$settings_path" 2>/dev/null \
    || ltx_human "⚠ TOKEN SAVER: settings.json has invalid JSON. Run /context-forge:debug-hooks"
}

# -ef guard: on case-insensitive filesystems (macOS default) CLAUDE.md and
# claude.md are the same file — without it the file is reported twice.
# shellcheck disable=SC2088  # second arg is a display label, not a path
check_claudemd_size "$HOME/.claude/CLAUDE.md" "~/.claude/CLAUDE.md"
if ! [ "$HOME/.claude/claude.md" -ef "$HOME/.claude/CLAUDE.md" ]; then
  # shellcheck disable=SC2088
  check_claudemd_size "$HOME/.claude/claude.md" "~/.claude/claude.md"
fi

if [ -n "${CLAUDE_PROJECT_DIR:-}" ]; then
  check_claudemd_size "$CLAUDE_PROJECT_DIR/CLAUDE.md" "CLAUDE.md (project)"
  if ! [ "$CLAUDE_PROJECT_DIR/claude.md" -ef "$CLAUDE_PROJECT_DIR/CLAUDE.md" ]; then
    check_claudemd_size "$CLAUDE_PROJECT_DIR/claude.md" "claude.md (project)"
  fi
fi

validate_settings_json
