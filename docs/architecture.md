# Architecture Document

## Tech Stack
- **Backend**: Java Spring Boot, Spring Data JPA
- **Database**: PostgreSQL
- **Frontend**: React, Vite, TypeScript
- **State Management**: React Query

## DevOps & Workflow
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Issue Tracking**: Jira (commits & PRs must reference Jira tickets)

## Deployment Architecture
- The application will be deployed as Docker containers.
- We will have at least 3 containers: `frontend`, `backend`, and `db`.
