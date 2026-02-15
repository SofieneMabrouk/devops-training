# Exercise Management Rules

## Implemented By Skills

These skills implement the workflows governed by this rule:

- [`/review`](../skills/review/SKILL.md) — executes the after-submission workflow (validate, archive, create next)
- [`/lesson`](../skills/lesson/SKILL.md) — creates exercise templates following the template pattern
- [`/next`](../skills/next/SKILL.md) — creates next exercise template or transitions topics

## Related Rules

- [Teaching Methodology](teaching-methodology.md) — lesson structure, review feedback standards
- [State Management](state-management.md) — updating state files after archival

---

## File Organization

```
.github/workflows/exercises/
├── exercise-01-optimize-deploy-workflow.yml    # Clean template
├── exercise-02-matrix-and-artifacts.yml        # Clean template
├── exercise-05a-docker-build-basic.yml         # Clean template
├── exercise-05b-docker-build-tags.yml          # Clean template
└── solutions/
    ├── solution-01-optimize-deploy-workflow.yml # Completed
    ├── solution-02-matrix-and-artifacts.yml     # Completed
    └── solution-05a-docker-build-basic.yml      # Completed
```

### Rules

1. **Templates** live in `exercises/` root and are NEVER modified after creation
2. **Solutions** live in `exercises/solutions/` and are created after review approval
3. Both template AND solution must exist for every completed exercise

## Template Pattern

Every exercise template MUST follow this YAML comment structure:

```yaml
# Exercise XX: Title
#
# GOAL: Brief description of what the student will learn
#
# LEARNING OBJECTIVES:
# - Objective 1
# - Objective 2
#
# REQUIREMENTS:
# 1. First requirement
# 2. Second requirement
#
# HINTS:
# - Helpful hint 1
# - Helpful hint 2
#
# NEW SYNTAX EXPLAINED:
#
# ### `new_thing`
# - **What:** Description
# - **Example:** Usage example
# - **When to use:** Use case
#
# VERIFICATION:
# After running, you should see: [expected outcome]
#
# YOUR SOLUTION BELOW:
# ====================

name: Exercise XX - Title

on:
  push:
    branches: [test-workflows]

jobs:
  # TODO: Your implementation here
```

## Naming Conventions

- **Templates:** `exercise-XXa-description.yml` (e.g., `exercise-05a-docker-build-basic.yml`)
- **Solutions:** `solution-XXa-description.yml` (e.g., `solution-05a-docker-build-basic.yml`)
- **Numbering:** Two-digit topic number + lowercase letter for sequence (a, b, c, d)

## Workflow Trigger Management

- **Active exercise (being worked on):** `push` trigger on `test-workflows` branch
- **Completed solution:** `workflow_dispatch` trigger (manual only)
- When moving to a new exercise, the previous exercise's solution should already use `workflow_dispatch`
- This prevents multiple workflows from running simultaneously

```yaml
# Active (auto-runs for testing):
on:
  push:
    branches: [test-workflows]

# Completed (manual only):
on:
  workflow_dispatch:
```

**Note:** Files in `.github/workflows/exercises/` subfolder won't run automatically. GitHub only recognizes workflows in `.github/workflows/` root. To test, the student copies to root or pushes to `test-workflows` branch.

## After-Submission Workflow

When a student submits a solution for review ("Ready for review"):

### Step 1: Find the solution
- Check `.github/workflows/` root first (student may have copied there for testing)
- Then check `exercises/` folder

### Step 2: Review thoroughly
- Validate against ALL exercise requirements
- Check for correctness, best practices, production concerns
- Provide detailed feedback:
  - What works well
  - What could improve
  - Production considerations

### Step 3: If solution is CORRECT
1. Copy solution to `exercises/solutions/solution-XXx-name.yml`
2. Change the solution's name to "Solution XX - ..."
3. Change the solution's trigger to `workflow_dispatch`
4. Remove the file from `.github/workflows/` root (if it was there for testing)
5. Keep the clean template UNCHANGED in `exercises/` root
6. Update state files (`current-state.md` and `learning-progress.md`)

### Step 4: If solution NEEDS WORK
1. Provide specific hints and corrections
2. Explain WHY the correction matters
3. Do NOT give the full answer unless explicitly requested
4. Wait for resubmission

### Step 5: Create next exercise
- If more exercises remain in the topic: create next exercise template
- If all exercises in topic complete: provide consolidation, then prepare next topic

## Syntax Explanation Rule

**CRITICAL: Always explain new syntax when introducing it in exercise templates.**

Whenever a new syntax, pattern, or GitHub Action appears for the first time:

- Add a `NEW SYNTAX EXPLAINED` section in the exercise template comments
- Format each new concept with: **What**, **Example**, **When to use**
- This ensures the student can learn directly from the template without external docs

Example:
```yaml
# ### `${{ steps.<id>.outputs.<name> }}`
# - **What:** Reference outputs from previous steps
# - **Example:** ${{ steps.meta.outputs.tags }}
# - **When to use:** Pass data between steps (tags, versions, URLs)
```
