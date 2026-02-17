---
name: review
description: Review a submitted exercise solution. Use when the student says "ready for review", submits an exercise, or asks for feedback on their implementation.
---

# Review a Submitted Exercise

The student has submitted an exercise solution for review.

## Connected Rules

Follow these rules strictly — they govern the review and archival workflow:

- [Exercise Management](../../rules/exercise-management.md) — validation, archival workflow, template preservation
- [Teaching Methodology](../../rules/teaching-methodology.md) — feedback quality, review standards
- [State Management](../../rules/state-management.md) — updating progress after completion

## Steps

### 1. Read state to identify active exercise

- Read `documentation/current-state.md` to know which exercise is active

### 2. Find the student's solution

- Check `.github/workflows/` root first (student may have copied there for testing)
- Then check `.github/workflows/exercises/` folder
- Look for the active exercise file

### 3. Read the exercise template for requirements

- Read the clean template from `.github/workflows/exercises/` to get the full REQUIREMENTS section
- This is the validation checklist

### 4. Validate against ALL requirements

- Check every requirement listed in the template
- Verify YAML syntax correctness
- Check for best practices
- Look for potential production issues
- Verify naming conventions, triggers, permissions

### 5. Provide detailed feedback

**If solution is CORRECT:**
- Highlight what works well (specific lines/patterns)
- Note any minor improvements (optional, not blocking)
- Mention production considerations
- Proceed to Step 6

**If solution NEEDS WORK:**
- Explain what's wrong and WHY it matters
- Provide specific hints (not full answers unless asked)
- Point to the specific requirement that isn't met
- Wait for resubmission — STOP here, do NOT proceed to Step 6

### 6. Archive the solution (only if correct)

Follow the after-submission workflow from [Exercise Management](../../rules/exercise-management.md):

a) Create `exercises/solutions/solution-XXx-name.yml` with the student's working solution
b) Change the solution's workflow name to "Solution XX - ..."
c) Change the solution's trigger to `workflow_dispatch`
d) Remove the file from `.github/workflows/` root if it was there for testing
e) **Keep the template in `exercises/` root UNCHANGED** — this is critical

### 7. Prepare next exercise or consolidation

- If **more exercises remain** in the topic: create next exercise template following [Exercise Management](../../rules/exercise-management.md) and present it
- If **all exercises in topic complete**: provide consolidation per [Teaching Methodology](../../rules/teaching-methodology.md) (summary, cheat sheet, key takeaways). Do NOT auto-start the next topic.

### 8. Update state files

Follow [State Management](../../rules/state-management.md):
- Update `documentation/current-state.md` — mark exercise complete, set next active exercise
- Update `documentation/learning-progress.md` — add to completed list, update percentage
