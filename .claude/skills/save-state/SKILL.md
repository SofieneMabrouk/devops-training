---
name: save-state
description: Persist current session state to markdown files for seamless session resumption. Use when the student is ending a session, taking a break, clearing context, or wants to ensure progress is saved.
---

# Save Current Session State

Persist the current session state so a fresh session can resume seamlessly.

## Connected Rules

Follow these rules strictly — they define the state file format and update protocol:

- [State Management](../../rules/state-management.md) — file structure, format rules, update triggers

## Steps

### 1. Analyze current conversation context

Determine from the conversation:
- What topic/exercise is currently active?
- What was just completed or discussed?
- What should happen next session?
- Any important context or decisions from this session?

### 2. Read current state files to preserve structure

- Read `documentation/current-state.md`
- Read `documentation/learning-progress.md`

Preserve the existing structure defined in [State Management](../../rules/state-management.md).

### 3. Update `documentation/current-state.md`

Update these sections per [State Management](../../rules/state-management.md) format:
- **Date:** Set to today's date
- **Current Task:** Active exercise or topic
- **What Just Happened:** Summary of this session's key actions
- **Current Exercise Details:** File paths, requirements, status of each exercise
- **File System State:** Any files created, modified, or moved
- **What Claude Code Should Do Next:** Clear, actionable instructions for the next session

### 4. Update `documentation/learning-progress.md`

Update these sections:
- **Overall Progress table:** Update completion percentages
- **Completed Exercises:** Add any newly completed exercises with what was learned
- **Current Exercise:** Update status and details
- **Key Concepts Mastered:** Add any new concepts from this session

### 5. Confirm the save

Show the student:
- What was updated in each file (brief diff summary)
- Current position summary (phase, topic, exercise)
- Confirmation that a fresh session will pick up correctly

## When to Suggest This Skill

Proactively suggest `/save-state` if the conversation is getting long or if the student mentions:
- Starting a new session
- Clearing context
- Taking a break
- "I'll continue later"
- Any sign of wrapping up

## Important

- Never lose historical data — append to progress, never overwrite completed sections
- Always include clear "next action" instructions for the resuming session
- Be specific with file paths and exercise numbers
