# State Management Rules

## Implemented By Skills

These skills implement the workflows governed by this rule:

- [`/save-state`](../skills/save-state/SKILL.md) — explicit state persistence on demand
- [`/review`](../skills/review/SKILL.md) — updates state after exercise completion
- [`/lesson`](../skills/lesson/SKILL.md) — reads state at startup, updates after creating exercises
- [`/next`](../skills/next/SKILL.md) — updates state after transitions
- [`/progress`](../skills/progress/SKILL.md) — reads state for dashboard (read-only)

## Related Rules

- [Teaching Methodology](teaching-methodology.md) — when to update (after consolidation, topic changes)
- [Exercise Management](exercise-management.md) — what to update (exercise status, file paths)

---

## Session Startup (MANDATORY)

At the start of EVERY new conversation session, ALWAYS:

1. Read `documentation/current-state.md` — contains immediate context, active exercise, what happened last
2. Read `documentation/learning-progress.md` — contains full journey history, completed exercises, overall progress

Do NOT ask the student "where were we?" or "what are you working on?" — determine this from the state files.

## When to Update State Files

### After completing an exercise review (solution approved):
- Update `current-state.md`: mark exercise as completed, note what was just done
- Update `learning-progress.md`: add the exercise to completed list, update completion percentage

### After creating a new exercise template:
- Update `current-state.md`: set new active exercise, list requirements
- Note the exercise file path and what the student should do next

### After completing ALL exercises in a topic (consolidation):
- Update `learning-progress.md`: mark topic as completed with summary
- Update `current-state.md`: clear old exercise context, set next topic

### After starting a new topic:
- Update `current-state.md`: new topic context, theory delivered, first exercise details
- Update `learning-progress.md`: add new topic as in-progress

## Format Rules

### current-state.md Structure

Maintain this structure (update sections, don't restructure):

```markdown
# Current State - DevOps Training

**Date:** [current date]
**Student:** s.mabrouk
**Current Task:** [active exercise or topic]

## Immediate Context
### What Just Happened
[Recent actions and completions]

## Current Exercise Details
### Topic X: [Topic Name]
[Exercise structure with status markers]

## File System State
[Recent file changes]

## What Claude Code Should Do Next
[Clear instructions for the next session]
```

### learning-progress.md Structure

Maintain this structure:

```markdown
# DevOps Training - Learning Progress

## Overall Progress
[Progress table with completion percentages]

## Phase X: [Phase Name]
### Completed Topics
[List of completed topics with exercise details]

### Current Exercise
[Active exercise with status]

## Key Concepts Mastered
[Running list of mastered concepts]

## Next Steps
[What comes after current work]
```

### Status Markers

Use these consistently:
- `COMPLETED` — fully done and reviewed
- `IN PROGRESS` — currently being worked on
- `NOT STARTED` — future work

Use these emoji markers in state files:
- Completed: checkmark
- In progress: arrows
- Pending/waiting: hourglass
- Created/ready: pencil

## State File Principles

1. **Always be specific** — include file paths, exercise numbers, exact status
2. **Include "What Claude Should Do Next"** — so a fresh session can pick up immediately
3. **Keep current-state.md focused** — only the immediate context, not full history
4. **Keep learning-progress.md comprehensive** — full journey record
5. **Date stamp updates** — always update the date when modifying state files
6. **Never lose history** — append to learning-progress.md, don't overwrite completed sections
