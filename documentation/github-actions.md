# GitHub Actions - Complete Reference

This document contains all GitHub Actions concepts covered in the DevOps training, organized for easy reference.

**Note:** The training follows a deep-learning approach with:
- Comprehensive theory before exercises
- Multiple exercises (2-4) per topic for retention
- Progressive difficulty: Basic → Reinforcement → Integration → Challenge
- Thorough review and consolidation before moving forward

---

## Table of Contents

1. [Fundamentals](#fundamentals)
2. [Core Patterns](#core-patterns)
3. [Advanced Patterns](#advanced-patterns)
4. [Docker Integration](#docker-integration)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Fundamentals

### What is CI/CD?

**Continuous Integration (CI):**
- Automatically build and test code on every push
- Catch bugs early
- Ensure code quality

**Continuous Delivery/Deployment (CD):**
- Automatically deploy tested code to environments
- Reduce manual deployment errors
- Ship faster and more reliably

### GitHub Actions Architecture

```
Workflow (YAML file)
  ├── Event Trigger (push, pull_request, workflow_dispatch)
  ├── Job 1
  │   ├── Runner (ubuntu-latest, windows-latest, macos-latest)
  │   └── Steps
  │       ├── Step 1 (uses: actions/checkout@v4)
  │       ├── Step 2 (run: npm install)
  │       └── Step 3 (run: npm test)
  └── Job 2 (depends on Job 1)
      └── Steps...
```

### Workflow File Structure

```yaml
name: Workflow Name

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - name: Step Name
        uses: actions/checkout@v4
      
      - name: Run Command
        run: echo "Hello World"
```

**File Location:** `.github/workflows/*.yml`

---

## Core Patterns

### 1. Job Dependencies

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building..."
  
  test:
    needs: build  # Runs after 'build' completes
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing..."
  
  deploy:
    needs: [build, test]  # Runs after both complete
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying..."
```

### 2. Environment Variables

```yaml
# Workflow-level
env:
  NODE_VERSION: "22"

jobs:
  # Job-level
  build:
    env:
      BUILD_DIR: ./dist
    steps:
      # Step-level
      - name: Build
        env:
          API_URL: https://api.example.com
        run: npm run build
```

**Access:** `${{ env.VARIABLE_NAME }}`

### 3. Secrets Management

```yaml
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # Auto-provided
    run: ./deploy.sh
```

**Setting Secrets:** Repository Settings → Secrets and variables → Actions

### 4. Conditional Execution

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'  # Only on main branch
    steps:
      - name: Production Deploy
        if: success()  # Only if previous steps succeeded
        run: ./deploy.sh
      
      - name: Notify on Failure
        if: failure()  # Only if previous steps failed
        run: ./notify-slack.sh
```

**Common Conditions:**
- `success()` - Previous steps succeeded
- `failure()` - Previous steps failed
- `always()` - Always run
- `cancelled()` - Workflow was cancelled
- `github.ref == 'refs/heads/main'` - Specific branch

### 5. Working Directory Defaults

```yaml
jobs:
  build:
    defaults:
      run:
        working-directory: ./components/web
    steps:
      - run: npm install  # Runs in ./components/web
      - run: npm test     # Runs in ./components/web
```

### 6. Caching Dependencies

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'
    cache-dependency-path: './components/web/package-lock.json'
```

**Cache Hit:** Subsequent runs are ~70% faster

### 7. Artifacts

**Upload:**
```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: dist
    path: ./dist
    retention-days: 7
```

**Download:**
```yaml
- name: Download build artifacts
  uses: actions/download-artifact@v4
  with:
    name: dist
    path: ./dist
```

---

## Advanced Patterns

### 1. Matrix Strategies

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

**Result:** 6 parallel jobs (3 Node versions × 2 OS)

### 2. Reusable Workflows

**Reusable Workflow** (`.github/workflows/reusable-build.yml`):
```yaml
name: Reusable Build

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      working-directory:
        required: true
        type: string
    outputs:
      cache-hit:
        description: "Whether cache was hit"
        value: ${{ jobs.build.outputs.cache-hit }}
    secrets:
      NPM_TOKEN:
        required: false

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      cache-hit: ${{ steps.setup-node.outputs.cache-hit }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        id: setup-node
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

**Caller Workflow:**
```yaml
jobs:
  build-web:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '22'
      working-directory: './components/web'
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 3. Composite Actions

**Composite Action** (`.github/actions/setup-node-project/action.yml`):
```yaml
name: Setup Node Project
description: Checkout code, setup Node, and install dependencies

inputs:
  node-version:
    description: Node.js version
    required: true
    default: '22'
  working-directory:
    description: Working directory
    required: true
    default: '.'

outputs:
  cache-hit:
    description: Whether npm cache was hit
    value: ${{ steps.setup-node.outputs.cache-hit }}

runs:
  using: 'composite'
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node
      id: setup-node
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
        cache-dependency-path: ${{ inputs.working-directory }}/package-lock.json
    
    - name: Install dependencies
      shell: bash  # REQUIRED for composite actions
      run: npm ci
      working-directory: ${{ inputs.working-directory }}
```

**Usage:**
```yaml
steps:
  - name: Setup Project
    id: setup
    uses: ./.github/actions/setup-node-project
    with:
      node-version: '22'
      working-directory: './components/web'
  
  - name: Check cache
    run: echo "Cache hit: ${{ steps.setup.outputs.cache-hit }}"
```

**Key Differences:**
| Feature | Reusable Workflow | Composite Action |
|---------|-------------------|------------------|
| Level | Job level | Step level |
| Location | `.github/workflows/` | `.github/actions/` |
| Trigger | `workflow_call` | `uses:` in steps |
| Shell | Automatic | Must specify `shell: bash` |
| Outputs | Job outputs | Step outputs |

---

## Docker Integration

### 1. Building and Pushing to GHCR

```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write  # Required for GHCR
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository_owner }}/my-app
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}
      
      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: ./components/web
          file: ./components/web/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 2. Key Docker Actions

**`docker/setup-buildx-action@v3`:**
- Advanced build engine
- Multi-platform builds
- Layer caching

**`docker/login-action@v3`:**
- Authenticate with registries
- Supports GHCR, Docker Hub, ECR, etc.

**`docker/metadata-action@v5`:**
- Auto-generate tags and labels
- Semantic versioning support
- OCI-compliant metadata

**`docker/build-push-action@v6`:**
- Build Docker images
- Push to registries
- GitHub Actions cache integration

### 3. Image Tagging Strategies

```yaml
tags: |
  type=ref,event=branch           # Branch name: main
  type=ref,event=pr               # PR number: pr-123
  type=sha,prefix={{branch}}-     # Commit SHA: main-abc1234
  type=semver,pattern={{version}} # Semantic: v1.2.3
  type=semver,pattern={{major}}.{{minor}}  # Major.minor: 1.2
  type=raw,value=latest,enable={{is_default_branch}}  # latest on main
```

### 4. GHCR Permissions

```yaml
jobs:
  build:
    permissions:
      contents: read    # Read repository code
      packages: write   # Write to GitHub Packages (GHCR)
```

**Without `packages: write`:** Authentication fails when pushing images

---

## Best Practices

### 1. DRY Principle

**Bad:**
```yaml
jobs:
  build-web:
    defaults:
      run:
        working-directory: ./components/web
    steps:
      - uses: ./.github/actions/setup-node-project
        with:
          working-directory: ./components/web
```

**Good:**
```yaml
jobs:
  build-web:
    env:
      WORKING_DIR: ./components/web
    defaults:
      run:
        working-directory: ${{ env.WORKING_DIR }}
    steps:
      - uses: ./.github/actions/setup-node-project
        with:
          working-directory: ${{ env.WORKING_DIR }}
```

### 2. Fail Fast with Matrix

```yaml
strategy:
  fail-fast: true  # Stop all jobs if one fails
  matrix:
    node-version: [18, 20, 22]
```

### 3. Conditional Builds with Path Filters

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'components/web/**'
      - '.github/workflows/build-web.yml'
```

**Result:** Workflow only runs when web component changes

### 4. Separate Jobs for Each Service

```yaml
jobs:
  build-web:
    # ... build web
  
  build-api:
    # ... build api
  
  build-core:
    # ... build core
```

**Benefits:**
- Parallel execution
- Independent failures
- Selective rebuilds

### 5. Use GitHub Actions Cache for Docker

```yaml
- uses: docker/build-push-action@v6
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Speed Improvement:** ~70% faster builds on cache hit

### 6. Version Pin Important Actions

```yaml
# Good: Pinned to specific version
- uses: actions/checkout@v4

# Better: Pinned to commit SHA (most secure)
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

---

## Troubleshooting

### Common Issues

**1. Permission Denied When Pushing to GHCR**
```yaml
# Solution: Add packages: write permission
permissions:
  packages: write
```

**2. Cache Not Working**
```yaml
# Ensure cache-dependency-path is correct
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: './path/to/package-lock.json'
```

**3. Composite Action Shell Error**
```yaml
# Always specify shell in composite actions
runs:
  using: 'composite'
  steps:
    - run: npm ci
      shell: bash  # REQUIRED
```

**4. Workflow Not Triggering**
- Check file location: Must be in `.github/workflows/` root
- Check YAML syntax: Use YAML validator
- Check branch filters: Ensure branch matches trigger

**5. Secrets Not Available**
```yaml
# Secrets must be passed explicitly to reusable workflows
jobs:
  call-workflow:
    uses: ./.github/workflows/reusable.yml
    secrets:
      MY_SECRET: ${{ secrets.MY_SECRET }}
```

---

## Context Variables Reference

### GitHub Context

```yaml
${{ github.actor }}              # User who triggered workflow
${{ github.repository }}         # owner/repo-name
${{ github.repository_owner }}   # owner
${{ github.ref }}                # refs/heads/branch-name
${{ github.sha }}                # Commit SHA
${{ github.event_name }}         # push, pull_request, etc.
${{ github.workspace }}          # /home/runner/work/repo/repo
```

### Job Context

```yaml
${{ job.status }}                # success, failure, cancelled
```

### Steps Context

```yaml
${{ steps.step-id.outputs.output-name }}
${{ steps.step-id.outcome }}     # success, failure, cancelled, skipped
${{ steps.step-id.conclusion }}  # success, failure, cancelled, skipped
```

### Runner Context

```yaml
${{ runner.os }}                 # Linux, Windows, macOS
${{ runner.temp }}               # Temp directory
```

---

## Exercise Organization Pattern

### Structure
```
.github/workflows/exercises/
├── exercise-01-name.yml           # Clean template (never modified)
├── exercise-02-name.yml
├── exercise-03-name.yml
└── solutions/
    ├── solution-01-name.yml       # Completed work
    ├── solution-02-name.yml
    └── solution-03-name.yml
```

### Template Pattern
```yaml
# Exercise X: Title
#
# GOAL: Brief description
#
# Requirements:
# 1. First requirement
# 2. Second requirement
#
# HINTS:
# - Helpful hint 1
# - Helpful hint 2
#
# YOUR SOLUTION BELOW:
# ====================

name: Exercise Name
on:
  push:
    branches: [test-workflows]

jobs:
  # TODO: Your solution here
```

### Workflow Lifecycle
1. **Active Exercise:** `on: push: branches: [test-workflows]`
2. **After Completion:** Move to `solutions/`, change to `on: workflow_dispatch`
3. **Template:** Remains clean in `exercises/` root

---

## Additional Resources

### Official Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Docker Actions](https://github.com/docker/build-push-action)

### Marketplace
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Last Updated:** January 7, 2026  
**Phase:** GitHub Actions (In Progress)
