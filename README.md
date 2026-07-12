# MyMel (My Media List)

**MyMel** is a modern media tracking application designed to help users track, rate, and organize their favorite media (movies, TV shows, anime, etc.).

## 🏗️ Architecture & Components

The application is built on a modern, containerized stack:

- **Frontend (`frontend/`)**: A dynamic, responsive user interface built with React, Vite, and TypeScript. State and data fetching are managed via React Query.
- **Backend (`backend/`)**: A robust RESTful API powered by Java Spring Boot and Spring Data JPA.
- **Database**: PostgreSQL (containerized) for persistent, reliable data storage.

*For detailed architectural decisions, see the [Architecture Document](docs/architecture.md).*

## 🚀 DevOps & Development Workflow

This project strictly adheres to a **2026 GitOps & ChatOps Standard**:

1. **Jira First**: All work orders, epics, and tasks are rigorously tracked in Jira. Tickets must be moved to "In Progress" when work begins.
2. **Automated CI/CD**: Pull Requests automatically trigger GitHub Actions to run tests, linting, and Trivy container vulnerability scans.
3. **ChatOps**: Real-time Slack webhooks notify the team of PR events, build statuses, and critical production alerts.
4. **GitOps Deployment**: All deployments are fully declarative and managed by ArgoCD. Merging to the `main` branch automatically syncs the live environment to the desired state.

*For rules regarding AI Agents and coding standards, please review the [Agent Rules](.agents/AGENTS.md).*
