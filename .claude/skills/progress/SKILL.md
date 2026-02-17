---
name: progress
description: Show current DevOps training progress dashboard. Use when the student asks about progress, completion status, what they've done, or what's remaining in the curriculum.
---

# Show Training Progress

Display the student's current training progress dashboard.

## Connected Rules

- [State Management](../../rules/state-management.md) — how to read and interpret state files

## Steps

### 1. Read both state files

- Read `documentation/current-state.md` — current position and active exercise
- Read `documentation/learning-progress.md` — full journey history

### 2. Display progress dashboard

Format a clean, readable dashboard with these sections:

**Overall Curriculum Progress:**
| Phase | Topic | Status | Completion |
|-------|-------|--------|------------|
Show all 5 phases with status markers and percentages.

**Current Position:**
- Current phase and topic
- Active exercise name and description
- What the student needs to do next

**Phase 3 Breakdown (current phase):**
- List completed topics with exercise counts
- Show current topic with exercise progress (e.g., "Exercise 5C of 5D")
- List remaining topics

**Recent Completions:**
- Last 3-5 completed exercises with what was learned

**What's Next:**
- Next exercise after current one
- Next topic after current topic
- Preview of next phase

### 3. Read-only

This skill does NOT modify any files. It only reads and displays information.

## Format Guidelines

- Use tables for structured data
- Use status markers consistently (COMPLETED, IN PROGRESS, NOT STARTED)
- Keep it scannable — the student should get a clear picture at a glance
