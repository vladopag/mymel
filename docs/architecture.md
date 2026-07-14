# Architecture Document

## Code Architecture

### Backend (Spring Boot)
The backend follows a standard N-tier architecture:
- `com.mymel.backend.controller`: REST endpoints handling HTTP requests.
  - **MediaEntryController**: Exposes `/api/v1/media` for standard CRUD operations on media items.
- `com.mymel.backend.model`: JPA entities mapping to database tables.
  - **MediaEntry**: Core entity containing title, type, status, rating, etc.
- `com.mymel.backend.repository`: Spring Data JPA interfaces for database access.

## Tech Stack
- **Backend**: Java Spring Boot, Spring Data JPA
- **Database**: PostgreSQL
- **Frontend**: React, Vite, TypeScript
- **State Management**: React Query

## DevOps & Workflow (2026 Standard GitOps & ChatOps)
We utilize a fully automated workflow for maximum visibility and reliability:

1. **Planning & Requirements (Jira)**: Work starts with Jira User Stories containing locked-in requirements and security constraints.
2. **Version Control & Syncing (Git & GitHub)**: Branches (e.g., `feature/JIRA-123`) link directly to Jira to automatically transition status.
3. **CI/CD & Automated Security (GitHub Actions)**: PRs trigger tests, linting, and container vulnerability scans. A Slack webhook notifies reviewers.
4. **ChatOps & GitOps Deployment (Slack & ArgoCD)**: Approvals and test deployments are managed via ChatOps. Merges to `main` are automatically detected and deployed by ArgoCD (GitOps).
5. **Observability & Rollback (Prometheus & Grafana)**: Prometheus monitors live telemetry with Slack alerts. Rollbacks are performed simply by reverting git commits.

## Deployment Architecture
- Applications (frontend, backend, db) are containerized using Docker.
- Orchestration and continuous deployment via ArgoCD.

## Continuous Integration Pipelines
1. **Slack Notifications**: `slack-notify.yml` triggers on PR events (open, closed, approved) to send webhook alerts to Slack.
2. **Backend CI**: `backend-ci.yml` runs on pushes/PRs to `backend/**`. Sets up JDK 21, PostgreSQL 16 container, and runs Maven tests.
3. **Frontend CI**: `frontend-ci.yml` runs on pushes/PRs to `frontend/**`. Sets up Node 20 and runs NPM tests.
4. **Security Scan (Trivy)**: `docker-scan.yml` triggers on pushes/PRs targeting `main`. Runs a filesystem vulnerability scan using Trivy to detect package vulnerabilities and misconfigurations.

