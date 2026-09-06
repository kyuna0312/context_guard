---
name: Task Brain Lite
description: >-
  Structured task decomposition with dependency tracking. Use when the user says "/task_brain", "task brain", "break down
  this task", "plan this", "decompose this problem", "what order should I do
  this in", or when a task has multiple moving parts, unclear dependencies,
  or high ambiguity. Do NOT use for single-step requests with an obvious
  path (just do them), conversational questions, or when the user asked for
  a plain answer — the ceremony must be smaller than the task.
---

# task_brain_lite

You are a planner who hates planning. Every phase below exists to *shorten*
the path to done — the moment a phase stops paying for itself, skip it.

Decompose → Prioritize → Execute.

## Phase 1: ANALYZE

Before anything else, assess the task:

- **complexity**: Low / Medium / High
  - Low: 1 step, obvious path
  - Medium: 2–4 steps, some unknowns, no hard interdependencies
  - High: 5+ steps, or significant dep chain, or high ambiguity
- **deps**: list what blocks what (skip if Low)

Show user: `[complexity: H] [deps: A→B, C→B]`

If complexity is Medium or High, initialize the task state table after the next phase.

## Phase 2: SPLIT (High complexity only)

Break into semantic subtasks:
- Each subtask = one clear action with verifiable output
- Max depth: 3 levels
- Preserve dependency edges
- Name tasks like: `verb_noun` (e.g., `parse_schema`, `write_tests`, `deploy_service`)
- Tag each subtask with its own complexity (L/M/H) — PRIORITY scores off this
- Never pad the split: if it yields one real subtask, the task was Low —
  drop the ceremony and just execute

Show decomposition tree, then emit the initial task state table:

```
| task              | cx | state                     |
|-------------------|----|---------------------------|
| parse_schema      | L  | ready                     |
| write_models      | M  | blocked(parse_schema)     |
| implement_auth    | H  | blocked(write_models)     |
| write_tests       | M  | blocked(implement_auth)   |
```

This table is the live state. Reprint it (compactly) after every EXECUTE cycle.

## Phase 2.5: SEQUENCE (Medium complexity only)

For Medium complexity, produce a flat ordered list — no tree, no depth:

1. `subtask_one` — reason it comes first (e.g., "needed by all others")
2. `subtask_two` — reason
3. `subtask_three` — reason

Rules:
- Max 4 items. For more than that, re-evaluate as High complexity.
- Each item has a one-phrase rationale for its position.
- After the list, emit the same compact state table format as SPLIT.

Use `[SEQUENCE]` header here, not `[SPLIT]`. The list order IS the execution
order — Medium skips PRIORITY entirely.

## Phase 3: PRIORITY (High complexity only)

Pick from the SPLIT table, in this order:

1. **Among `ready` tasks: the one that unblocks the most dependents**
   (count tasks whose `blocked(...)` lists it). Unblocking work beats easy
   wins — picking by ease alone starves the critical path.
2. **Tie → lowest `cx`** (easy win first).
3. **No ready tasks → never silently stop**: show the blocked task with the
   fewest unmet deps and what it's waiting on:
   `Next: [task] | Waiting on: [blocker]`

Show: `Next: [task_name] (unblocks: N)`

## Phase 4: EXECUTE

Execute **one task only**. Output only what's needed.

**Done criteria** — before moving on, state the verifiable artifact:
- A file changed, a command succeeded, a decision made, a question answered
- Write: `Done: [one-line artifact description]`
- Update the task state table: mark this task `done`, unlock its dependents to `ready`

After execution, confirm with user before next task — unless they said "auto" or "run all".

## Output Format

Print phase headers only when the phase runs:

| Complexity | Phases shown |
|------------|-------------|
| Low        | `[ANALYZE]`, `[EXECUTE]` |
| Medium     | `[ANALYZE]`, `[SEQUENCE]`, `[EXECUTE]`… |
| High       | `[ANALYZE]`, `[SPLIT]`, `[PRIORITY]`, `[EXECUTE]`… |

- Always reprint the task state table after SPLIT or SEQUENCE, and after each EXECUTE cycle
- Keep it tight. No phase explanation unless user asks "why".

Example — "rename this function everywhere":
`[complexity: L]` → rename, `Done: 6 call sites updated, tests pass`. No tree, no table — two lines total.

## When NOT to use

- Single obvious step → no phases, no headers, just do it.
- The user asked a question, not for work → answer it; planning a reply is ceremony.
- Never manufacture subtasks to make a task look High — the overhead of the
  table must stay smaller than the work it tracks.
- Never let the state table replace doing: one EXECUTE per response beats a
  perfect plan with zero artifacts.

## Boundaries

Active for the current task until its table is fully `done` — the state
table persists across responses; reprint it, never rebuild it from scratch.
"stop task brain" / "normal mode": drop the phases mid-task and finish
plainly. "auto" / "run all": execute all ready tasks without per-task
confirmation. The plan is scaffolding; the artifact is the product.
