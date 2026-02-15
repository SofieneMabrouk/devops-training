# Production Patterns Guide

> **Source**: Extracted from production workflows in `/reference` folder
>
> **Purpose**: Defines the coding standards, patterns, and conventions used in production-grade DevOps practices

---

## 1. GitHub Actions Workflow Patterns

### 1.1 Naming Conventions

**Workflow Names**:
- Use descriptive, action-oriented names with emojis for visual clarity
- Format: `Action + Component/Target + Optional Context`
- Examples:
  - `Lint, Build and Test the Web Component`
  - `Deploy 🛠️ Feature Environment (GCP + KAO)`
  - `🔄 Reusable Deployment Workflow`

**Job Names**:
- Use emojis to indicate action type: 🔍 (lint), 🏗️ (build), 🧪 (test), 📥 (checkout), 🐳 (Docker), ⚓ (Helm)
- Format: `emoji + action + component`
- Examples:
  - `🔍 Lint, 🏗️ Build and 🧪 Test the Web Component`
  - `web-lint-build-test`

**Step Names**:
- Start with verb, capitalize first word
- Include emoji at end for visual scanning
- Examples:
  - `Checkout 📥`
  - `Restore dependencies 🔄📦`
  - `Test 🧪`
  - `Login to DockerHub ReadOnly 🐳🔑`

### 1.2 Workflow Structure Standard

**Order of top-level keys**:
```yaml
name: <workflow-name>

concurrency:
  group: <concurrency-group>
  cancel-in-progress: true

on:
  <triggers>

jobs:
  <jobs>
```

**Concurrency Control**:
- Always include for production workflows
- Group by workflow + ref to prevent duplicate runs
- Enable `cancel-in-progress: true` for cost efficiency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 1.3 Trigger Patterns

**Standard Trigger Set for CI**:
```yaml
on:
  workflow_dispatch:  # Manual trigger (always first)
  pull_request:
    paths:
      - "components/<service>/**"
    branches:
      - main
  push:
    branches:
      - main
```

**Path Filters**:
- Use specific component paths to avoid unnecessary runs
- Format: `components/<service>/**`

**Feature Branch Patterns**:
```yaml
on:
  push:
    branches:
      - GP-*  # Project-specific prefix
```

### 1.4 Job Structure Patterns

**Container-based Jobs**:
```yaml
jobs:
  web-lint-build-test:
    name: 🔍 Lint, 🏗️ Build and 🧪 Test the Web Component
    runs-on: instadeep-ci-dind  # Custom self-hosted runner
    timeout-minutes: 20  # Always set timeout for safety
    container:
      image: node:22
      credentials:
        username: ${{ vars.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    env:
      PNPM_HOME: "/pnpm"
```

**Key Conventions**:
- Always set `timeout-minutes` for production workflows
- Use self-hosted runners when available (`instadeep-ci`, `instadeep-ci-dind`)
- Authenticate container pulls with DockerHub credentials
- Define environment variables at job level when shared across steps

### 1.5 Step Patterns

**Working Directory**:
- Prefer explicit `working-directory` over `cd` commands
- Format: `${{ github.workspace }}/components/<service>`

**Dependency Caching**:
- Always cache package managers (npm, pnpm, NuGet, pip)
- Use composite keys with lock files
- Include fallback restore keys

```yaml
- name: Cache pnpm Packages 🗃️
  id: pnpm-packages-cache
  uses: actions/cache@v4
  with:
    path: ${{ env.PNPM_HOME }}
    key: ${{ runner.os }}-pnpm-${{ hashFiles('components/web/**/package.json', 'components/web/**/pnpm-lock.yaml') }}
    restore-keys: ${{ runner.os }}-pnpm-
```

**Conditional Execution**:
- Use `if: always()` for reports that should run even on failure
- Combine with outcome checks: `steps.<id>.outcome != 'skipped'`

```yaml
- name: Create Code Coverage Report 📊
  if: always() && steps.test.outcome != 'skipped'
  uses: irongut/CodeCoverageSummary@v1.3.0
```

---

## 2. Docker Build Patterns

### 2.1 Multi-Service Build Strategy

**Parallel Builds**:
- Each service gets its own build job
- Jobs run in parallel for speed
- All inherit from reusable workflow

```yaml
build-api:
  needs: [setup]
  uses: instadeepai/mlops-reusable-ci/.github/workflows/docker-build.yaml@main

build-web:
  needs: [setup]
  uses: instadeepai/mlops-reusable-ci/.github/workflows/docker-build.yaml@main

build-core:
  needs: [setup]
  uses: instadeepai/mlops-reusable-ci/.github/workflows/docker-build.yaml@main
```

### 2.2 Docker Registry Conventions

**Image Naming**:
- Format: `<registry>/<project>/<service>`
- Example: `europe-west4-docker.pkg.dev/instadeep/genomics-product/api`

**Cache Images**:
- Separate cache image repository
- Format: `<base-image>/cache`
- Example: `europe-west4-docker.pkg.dev/instadeep/genomics-product/api/cache`

### 2.3 Build Arguments Pattern

**Versioning Build Args**:
```yaml
build-args: |
  APP_VERSION=${{ needs.setup.outputs.app_version }}
  RELEASE_DATE=${{ needs.setup.outputs.release_date }}
  NEXT_PUBLIC_BASE_PATH=${{ needs.setup.outputs.next_public_base_path }}
```

**Build Secrets** (never in build-args):
```yaml
build-secrets: |
  ID_GITHUB_USER=${{ github.actor }}
  ID_GITHUB_TOKEN=${{ secrets.GH_PKG_PULL_TOKEN }}
  DEPRECATED_GH_PKG_PULL_TOKEN=${{ secrets.GH_PKG_PULL_TOKEN }}
```

---

## 3. Reusable Workflows

### 3.1 Input Design Patterns

**Required vs Optional**:
- Mark truly required inputs as `required: true`
- Provide sensible defaults for optional inputs
- Use `default:` to avoid undefined behavior

```yaml
inputs:
  environment:
    description: "Environment identifier (dev, preprod, prod, beta, kao-dev, etc.)"
    required: true
    type: string

  branch_name:
    description: "Branch name for feature branches"
    required: false
    type: string
    default: "default"
```

**Boolean Flags**:
```yaml
is_feature_branch:
  description: "Whether the branch is a feature branch"
  required: false
  type: boolean
  default: false
```

### 3.2 Secret Handling

**Required Secrets Pattern**:
```yaml
secrets:
  GCP_SERVICE_ACCOUNT_GENOMICS:
    required: false  # Environment-specific
  GCP_SERVICE_ACCOUNT_GENOMICS_GAR:
    required: true   # Always needed
  DOCKERHUB_TOKEN:
    required: true
```

**Convention**: Use `required: false` for environment-specific secrets

---

## 4. Custom Composite Actions

### 4.1 Action Structure

**Metadata**:
```yaml
name: '⚓ Helm Deploy'
description: 'Deploy application using Helm'
```

**Input Definitions**:
- Always provide descriptions
- Set sensible defaults
- Mark required appropriately

```yaml
inputs:
  chart_path:
    description: 'Path to the Helm chart'
    required: true
    default: './charts/genomicsproduct'
```

**Composite Action Pattern**:
```yaml
runs:
  using: 'composite'
  steps:
    - name: Step Name
      shell: bash  # Always specify shell
      run: |
        <commands>
```

---

## 5. Shell Scripting Patterns

### 5.1 Shell Script Style

**Variable Assignment**:
```bash
# Use lowercase for local variables
coverage=$(grep '^**Summary**' code-coverage-results.md | grep -oP '\*\*\K\d+%(?=\*\*)')

# Use UPPERCASE for environment variables
COVERAGE=$(grep '^**Summary**' code-coverage-results.md)
```

**GITHUB_OUTPUT Pattern**:
```bash
COVERAGE=$(command)
echo "Extracted coverage: $COVERAGE"  # Log for debugging
echo "coverage=$COVERAGE" >> $GITHUB_OUTPUT  # Export
```

**Multi-line Commands**:
```bash
yq ea '. as $i ireduce ({}; . * $i) | { "genomics-workflows": ."genomics-workflows", "global": ."global" }' \
  "${{ inputs.chart_path }}/values.yaml" \
  "${{ inputs.values_file }}" \
  > ./values_merged.yaml
```
- Use `\` for line continuation
- Align continued lines for readability

### 5.2 Tool Usage Conventions

**yq (YAML processor)**:
- Use for in-place YAML modifications: `yq -i`
- Use for YAML queries: `yq eval`
- Always quote complex expressions

**gomplate (Template processor)**:
- Use for dynamic template rendering
- Format: `gomplate -d <datasource> -f <input> -o <output>`

**kubectl**:
- Always specify namespace: `--namespace <ns>`
- Use kustomize with `-k` flag: `kubectl apply -k <path>`

---

## 6. Helm Deployment Patterns

### 6.1 Helm Command Structure

**Standard Upgrade Pattern**:
```bash
helm upgrade --install ${{ inputs.release_name }} ${{ inputs.chart_path }} \
  --namespace ${{ inputs.namespace }} --create-namespace \
  --values ${{ inputs.values_file }} \
  --values ${{ inputs.chart_path }}/genomics-workflow-template-generated.yaml \
  --set api.image.tag="${{ inputs.image_tag }}" \
  --set web.image.tag="${{ inputs.image_tag }}" \
  --set global.featureBranch="${{ inputs.is_feature_branch }}" \
  --set global.featureBranchName="${{ inputs.branch_name }}"
```

**Conventions**:
- Use `--install` flag for idempotency
- Always use `--create-namespace`
- Pass multiple `--values` files (base, then overrides)
- Use `--set` for dynamic values (image tags, branch info)

### 6.2 Values File Organization

**Global Section**:
```yaml
global:
  featureBranchName: "default"
  environment: "dev"
  featureBranch: false
  baseHost: "dev.genomics.deepchain.bio"
```

**Service-Specific Sections**:
```yaml
api:
  replicaCount: 1
  image:
    repository: <registry>/<project>/api
    pullPolicy: Always
    tag: latest
    containerName: genomics-product-api
  env:
    visible:
      KEY: value
    secret: null
  ingress:
    enabled: true
    ingressClassName: nginx
```

---

## 7. Docker Compose Patterns

### 7.1 Compose File Structure

**Main Compose File**:
```yaml
name: deepchain

networks:
  default:
    name: deepchain-net
    driver: bridge

include:
  - compose.infrastructure.yaml
  - compose.monitoring.yaml
  - components/api/compose.yaml
  - components/web/compose.yaml
  - components/core/compose.yaml
```

**Convention**: Use `include:` for modular compose files

---

## 8. Security Best Practices

### 8.1 Credential Handling

**DockerHub Authentication**:
- Use read-only tokens: `DOCKERHUB_TOKEN`
- Store username as variable: `vars.DOCKERHUB_USERNAME`
- Store password as secret: `secrets.DOCKERHUB_TOKEN`

**GitHub Package Registry**:
- Use `GITHUB_TOKEN` for GHCR in workflows
- Use PAT for external registries: `secrets.DEPRECATED_GH_PKG_PULL_TOKEN`

**Naming Convention**:
- Deprecated secrets: Prefix with `DEPRECATED_`
- Service accounts: Suffix with `_SA`
- Base64 encoded: Suffix with `_B64`

### 8.2 Secret Management with 1Password

**1Password Operator Pattern**:
```yaml
onePassword:
  sharedSecrets: false
  vaultName: "Genomics Splicing"
  vaultItem: "genomicsproduct-dev"
  vaultItemPull: "genomics-images-sa"
```

---

## 9. Testing and Quality Gates

### 9.1 Code Coverage

**Coverage Report Pattern**:
```yaml
- name: Create Code Coverage Report 📊
  if: always() && steps.test.outcome != 'skipped'
  uses: irongut/CodeCoverageSummary@v1.3.0
  with:
    filename: components/api/merged.cobertura.xml
    badge: true
    fail_below_min: true
    format: markdown
    hide_branch_rate: true
    hide_complexity: false
    indicators: true
    output: both
    thresholds: "40 80"
```

**Thresholds**: `"40 80"` = minimum 40%, target 80%

### 9.2 Test Results Publishing

**PR Comments + Checks**:
```yaml
- name: Add API test results summary PR Comment & Checks📝
  uses: EnricoMi/publish-unit-test-result-action@v2
  if: always() && steps.test.outcome != 'skipped' && github.event_name == 'pull_request'
  with:
    comment_title: api-test-results
    check_name: api-test-results
    files: |
      ${{ github.workspace }}/components/api/**/*/tests-results.xml
```

---

## 10. Infrastructure as Code Patterns

### 10.1 Kubernetes Manifests

**Deployment Pattern**:
- Use Helm charts, not raw YAML
- Store charts in `/charts/<project>` directory
- Use templating with `_helpers.tpl`

### 10.2 Environment-Specific Values

**Values File Naming**:
- Format: `values-<provider>-<environment>.yaml`
- Examples:
  - `values-gcp-dev.yaml`
  - `values-kao-beta.yaml`
  - `values-preprod.yaml`
  - `values-prod.yaml`

---

## 11. Monitoring and Observability

### 11.1 OpenTelemetry Integration

**OTel Collector Configuration**:
```yaml
otelcollector:
  enabled: true
  mode: deployment
  image:
    repository: otel/opentelemetry-collector-contrib
    tag: latest
  extraEnvs:
    - name: SERVICE_PREFIX
      value: "deepchain"
    - name: OTLP_TARGET_URL
      value: "http://opentelemetry-collector.monitoring.svc.cluster.local:4318"
```

**Application Integration**:
```yaml
env:
  visible:
    OTEL_ENABLED: true
    OTEL_EXPORTER_ENDPOINT: http://genomicsproduct-otelcollector:4317
    OTEL_EXPORTER_INTERVAL: 5000
```

---

## 12. Summary: Key Takeaways

### Must-Have Patterns:
1. ✅ Concurrency control on all workflows
2. ✅ Timeouts on all jobs
3. ✅ Emojis in job/step names for visual clarity
4. ✅ Explicit working directories (no `cd`)
5. ✅ Caching for all package managers
6. ✅ Conditional reporting with `if: always()`
7. ✅ Parallel builds for multi-service projects
8. ✅ Separate cache images for Docker builds
9. ✅ Build secrets (never build-args) for credentials
10. ✅ Environment-specific values files for Helm

### Avoid:
1. ❌ Hardcoded secrets in YAML
2. ❌ Missing timeouts on long-running jobs
3. ❌ Using `cd` instead of `working-directory`
4. ❌ Rebuilding without caching
5. ❌ Single job for all services (no parallelization)
6. ❌ Generic workflow/job names without context

---

**Document Version**: 1.0
**Last Updated**: 2026-01-12
**Maintained By**: DevOps Training Program