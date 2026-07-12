# Universal Coding Guidelines

These rules apply to all agents writing code in this repository.

1. **Context Limits**: Keep PRs and commits small. If a task is too large, break it down. We use Gemini 3.5 Flash Medium for coding, so avoid outputting huge files all at once.
2. **Read-Only Architect**: The software architect only plans and writes documentation. YOU (the coding agent) must implement the actual code based on the provided work orders.
3. **Test-Driven**: Write tests for all new features. Put E2E/high-level tests in `/tests/`. Unit tests belong in `/frontend/` or `/backend/`.
4. **Documentation**: Update the `docs/` folder whenever a new significant component is added.
5. **GitOps & ChatOps Workflow (2026 Standard)**:
   - **Step 1: Planning (Jira)**: All work starts as a Jira ticket (Epic/Story/Task). The ticket contains requirements and acceptance criteria.
   - **Step 2: Syncing (Git)**: Create a branch for the ticket (e.g., `feature/JIRA-123-new-api`). Commits and PRs MUST reference the ticket number to automatically move it to "In Progress".
   - **Step 3: CI/CD (GitHub Actions)**: PRs trigger GitHub Actions (tests, linting, Docker scans). ChatOps (Slack) notifies reviewers.
   - **Step 4: Deployment (GitOps/ArgoCD)**: After approval, merge to `main`. ArgoCD detects the change and automatically pulls the desired state to live.
   - **Step 5: Observability**: Prometheus and Grafana monitor telemetry, alerting Slack if issues arise.
6. **Docker First**: All applications must be containerized. Ensure `Dockerfile` and `docker-compose.yml` are maintained.
7. **WSL Isolation**: Never go out of the WSL file system. Do not make any changes to the outside Windows system unless specifically requested or approved by the user.
8. **PR Approval**: Do NOT merge Pull Requests automatically. You must always wait for the User to review and explicitly approve the PR before merging.
