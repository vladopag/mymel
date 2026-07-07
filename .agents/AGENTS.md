# Universal Coding Guidelines

These rules apply to all agents writing code in this repository.

1. **Context Limits**: Keep PRs and commits small. If a task is too large, break it down. We use Gemini 3.5 Flash Medium for coding, so avoid outputting huge files all at once.
2. **Read-Only Architect**: The software architect only plans and writes documentation. YOU (the coding agent) must implement the actual code based on the provided work orders.
3. **Test-Driven**: Write tests for all new features. Put E2E/high-level tests in `/tests/`. Unit tests belong in `/frontend/` or `/backend/`.
4. **Documentation**: Update the `docs/` folder whenever a new significant component is added.
5. **Docker First**: All applications (Frontend, Backend, DB) must be containerized. Ensure `Dockerfile` and `docker-compose.yml` are maintained.
6. **CI/CD**: We use GitHub Actions for our pipeline. Ensure code passes the linting and testing actions.
7. **Issue Tracking**: We use Jira. Prefix commit messages and PR titles with the Jira ticket number (e.g., `PROJ-123: add sorting`).
