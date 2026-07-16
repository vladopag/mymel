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
9. **Strict Jira Alignment**: All work orders and branches MUST match exact Jira tickets (Epics, Stories, and Tasks). Do not combine multiple tasks if they have distinct Jira tickets.
10. **Implementation Notes**: You must add detailed implementation notes in the Jira ticket (as a comment) and in the GitHub PR description. This is where developers summarize exactly what they changed in the code, how to test it, and any specific quirks reviewers should look out for.
11. **Update Jira Status**: When you begin working on a task, you must immediately transition the corresponding Jira ticket to "In Progress" to accurately reflect active work.
12. **Jira-First Architecture**: ALL architectural plans, blueprints, and work orders must be placed directly into a Jira ticket (in the ticket description or comments). Do not rely on local IDE Markdown artifacts for presenting plans, as the user may not have access to the artifact viewer.
13. **Playwright Standard**: Automated E2E testing and visual regression testing must be implemented using Microsoft Playwright. Playwright tests should be configured to detect UI defects (e.g., elements out of place, overlapping elements, visual deviations from spec).
14. **Long-Running Task Updates**: For any command that runs asynchronously in the background (e.g., package installations, docker builds), the agent must schedule a 10-second one-shot timer using the `schedule` tool. When the timer fires, the agent must check the progress of the task, output a status update (including percentage estimation if possible), and reschedule the 10-second timer if the task is still running. This must repeat until the task completes.

