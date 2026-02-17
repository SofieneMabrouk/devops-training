# Current State - DevOps Training

**Date:** February 8, 2026
**Student:** s.mabrouk
**Current Task:** Exercise 5C - Multi-Service Docker Builds

---

## Immediate Context

### What Just Happened

1. Completed Exercise 5A: Basic Docker Build & Push to GHCR
   - Built single service (web), pushed to GHCR with branch tag
   - Solution: `.github/workflows/exercises/solutions/solution-05a-docker-build-basic.yml`

2. Completed Exercise 5B: Advanced Tagging Strategies
   - Implemented docker/metadata-action with branch, SHA, and latest tags
   - Solution: `.github/workflows/exercises/solutions/solution-05b-docker-build-tags.yml`

3. Exercise 5C template created and ready
   - File: `.github/workflows/exercise-05c-docker-multi-service.yml` (in root for testing)
   - Also: `.github/workflows/exercises/exercise-05c-docker-multi-service.yml` (clean template)

4. Migrated to Claude Code infrastructure
   - Created `CLAUDE.md`, `.claude/rules/`, `.claude/commands/`
   - Replaced Cursor-based `.cursor/rules/devops-teaching-agent.mdc`

---

## Current Exercise Details

### Topic 5: Building and Pushing Docker Images to GHCR

**Exercise 5A: Basic Docker Build & Push (Foundation)** COMPLETED
- File: `.github/workflows/exercises/solutions/solution-05a-docker-build-basic.yml`
- Template: `.github/workflows/exercises/exercise-05a-docker-build-basic.yml`

**Exercise 5B: Tagging Strategies (Reinforcement)** COMPLETED
- File: `.github/workflows/exercises/solutions/solution-05b-docker-build-tags.yml`
- Template: `.github/workflows/exercises/exercise-05b-docker-build-tags.yml`

**Exercise 5C: Multi-Service Builds (Integration)** IN PROGRESS
- File: `.github/workflows/exercise-05c-docker-multi-service.yml` (root, for testing)
- Template: `.github/workflows/exercises/exercise-05c-docker-multi-service.yml`
- Goals: Build all three services (web, api, core) in parallel
- Concepts: Separate parallel jobs, service-specific image names, consistent tagging
- Status: Template created, waiting for student implementation
- Requirements:
  1. Three separate jobs: build-api, build-core, build-web
  2. Each job builds and pushes its service's Docker image
  3. All jobs run in parallel (no dependencies between them)
  4. Service-specific image names: devops-training-api, devops-training-core, devops-training-web
  5. All use same tagging strategy from Exercise 5B (branch, SHA, latest)
  6. Each service builds from its own context (./components/api, ./components/core, ./components/web)

**Exercise 5D: Production Patterns (Challenge)** PENDING
- Create after 5C completion
- Concepts: Build args, build secrets, conditional builds, reusable workflows

---

## File System State

### Active Files
```
Current Exercise (in root for testing):
  .github/workflows/exercise-05c-docker-multi-service.yml

Exercise Templates (clean, never modified):
  .github/workflows/exercises/exercise-05a-docker-build-basic.yml
  .github/workflows/exercises/exercise-05b-docker-build-tags.yml
  .github/workflows/exercises/exercise-05c-docker-multi-service.yml

Completed Solutions:
  .github/workflows/exercises/solutions/solution-01-optimize-deploy-workflow.yml
  .github/workflows/exercises/solutions/solution-02-matrix-and-artifacts.yml
  .github/workflows/exercises/solutions/solution-03-caller.yml
  .github/workflows/exercises/solutions/solution-04-composite-action.yml
  .github/workflows/exercises/solutions/solution-05a-docker-build-basic.yml
  .github/workflows/exercises/solutions/solution-05b-docker-build-tags.yml
  .github/workflows/exercises/solutions/reusable-build.yml

Claude Code Infrastructure:
  CLAUDE.md
  .claude/rules/teaching-methodology.md
  .claude/rules/exercise-management.md
  .claude/rules/state-management.md
  .claude/skills/lesson/SKILL.md
  .claude/skills/review/SKILL.md
  .claude/skills/progress/SKILL.md
  .claude/skills/next/SKILL.md
  .claude/skills/save-state/SKILL.md
```

---

## What Claude Code Should Do Next

### If Student Says: "Ready for review"
1. Read `.github/workflows/exercise-05c-docker-multi-service.yml` (root first, then exercises folder)
2. Validate: 3 separate jobs, parallel execution, correct image names, correct contexts, consistent tagging
3. Provide detailed feedback
4. If correct: move to solutions, create Exercise 5D template

### If Student Says: "Need help" or "Stuck"
1. Ask what specific part is blocking them
2. Provide hints, not full answers
3. Remind them of the 5B pattern they need to replicate 3 times

### If Student Says: "Let's move on" or "/next"
1. Verify Exercise 5C is truly complete
2. If all exercises done: provide consolidation for Topic 5
3. If not: create next exercise

---

## Key Context

- **Image naming:** `devops-training` is the base name (matches repo name)
  - Service-specific: `devops-training-api`, `devops-training-core`, `devops-training-web`
- **Registry:** GHCR at `ghcr.io`
- **Testing branch:** `test-workflows`
- **Lowercase conversion:** Use `tr '[:upper:]' '[:lower:]'` for GHCR compatibility
