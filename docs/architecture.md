# Architecture Document

## Code Architecture

### Backend (Spring Boot)
The backend follows a standard N-tier architecture:
- `com.mymel.backend.controller`: REST endpoints handling HTTP requests.
  - **MediaEntryController**: Exposes `/api/v1/media` for standard CRUD operations on media items.
- `com.mymel.backend.model`: JPA entities mapping to database tables.
  - **MediaEntry**: Core entity containing title, type, status, rating, etc.
- `com.mymel.backend.repository`: Spring Data JPA interfaces for database access.

### Frontend (React)
The frontend implements a component-based routing architecture:
- `frontend/src/api`: Network configuration layer.
  - **axiosClient.ts**: Handles HTTP requests with predefined base URL (`/api/v1`) and interceptors.
- `frontend/src/App.tsx`: Manages core routing (Home, Library, About) and leverages React Query to fetch and synchronize database entities.
- `frontend/src/index.css`: Defines the global typography and "Tropical" variables using pure Vanilla CSS.

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

## Authentication & Security
MyMEL implements a secure stateless JWT authentication architecture:
1. **User Identity & BCrypt**: User accounts are defined by the `User` entity containing `username`, `email`, and a BCrypt-encoded `passwordHash`.
2. **HTTP-only Cookies (XSS Protection)**: Upon successful login/registration, the backend generates a signed JSON Web Token (JWT) using HMAC-SHA-256 and transmits it to the client inside an `HttpOnly` and `Secure` cookie named `mymel_token`. This prevents cross-site scripting (XSS) attacks from reading the token.
3. **Spring Security Integration**: All endpoints under `/api/v1/media/**` are protected by a stateless `JwtAuthenticationFilter` that intercepts requests, extracts the token from the cookie, validates it, and establishes the authenticated security context.
4. **Data Scoping (Privacy)**: Media entries are private and mapped to specific user accounts via a `@ManyToOne` relationship. The backend restricts CRUD operations on media items to only those belonging to the currently authenticated user.
5. **Deployment Note (Secure Cookie)**: The JWT cookie is currently set to `secure(false)` for local HTTP development. Before deploying to staging or production, this MUST be externalized (e.g., via `application.properties`) and set to `true` to ensure the cookie is only transmitted over HTTPS.


