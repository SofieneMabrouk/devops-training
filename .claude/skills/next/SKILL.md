---
name: next
description: Move to the next exercise or topic in the DevOps training curriculum. Use when the student wants to advance, move on after review, or transition between topics or phases.
---

# Move to Next Exercise or Topic

The student wants to advance to the next exercise or topic.

## Connected Rules

Follow these rules strictly — they govern transitions and content delivery:

- [Teaching Methodology](../../rules/teaching-methodology.md) — theory delivery, consolidation, topic completion checklist
- [Exercise Management](../../rules/exercise-management.md) — template creation, naming, trigger management
- [State Management](../../rules/state-management.md) — updating state after transitions

## Steps

### 1. Read state to determine current position

- Read `documentation/current-state.md`
- Read `documentation/learning-progress.md`

### 2. Determine what "next" means and act accordingly

#### Case A: More exercises remain in current topic

- Create the next exercise template in `.github/workflows/exercises/`
- Follow [Exercise Management](../../rules/exercise-management.md) template pattern (GOAL, REQUIREMENTS, HINTS, NEW SYNTAX EXPLAINED, VERIFICATION, TODOs)
- Present the exercise with a brief intro connecting to the previous exercise
- Update `documentation/current-state.md` with new active exercise

#### Case B: All exercises in current topic are complete

First, provide **consolidation** per [Teaching Methodology](../../rules/teaching-methodology.md):
- Summary of key concepts learned in this topic
- Cheat sheet or comparison table
- Connection to upcoming topics
- Verify topic completion checklist is satisfied
- **Update the lesson file** in `documentation/lessons/` — append the cheat sheet and consolidation summary to the existing lesson file

Then prepare the next topic:
- Identify next topic in the curriculum roadmap (from `CLAUDE.md`)
- **Generate a new lesson file** in `documentation/lessons/` with Mermaid diagrams (see [Teaching Methodology](../../rules/teaching-methodology.md) Lesson File Format and Diagram Standards)
- Deliver full theory deep dive (5-10 paragraphs) referencing the lesson file
- Show 2-3 demonstrations
- Create Exercise A template per [Exercise Management](../../rules/exercise-management.md)
- Link the exercise in the lesson file
- Update both state files

#### Case C: Current phase is complete

- Celebrate the milestone
- Provide phase summary (all topics and exercises completed)
- Preview the next phase from the curriculum roadmap
- Update `documentation/learning-progress.md` with phase completion
- Update `documentation/current-state.md` with next phase context

### 3. Update state files

Follow [State Management](../../rules/state-management.md) — always update after any transition.

## Important

- Never skip consolidation when finishing a topic
- Always explain new syntax in exercise templates
- If unsure whether the current exercise is truly complete, verify before advancing
- Follow the curriculum roadmap order strictly — no jumping ahead
