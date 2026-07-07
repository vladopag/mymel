# Test Documentation

This directory is reserved for high-level End-to-End (E2E) tests.
Unit tests and integration tests for the backend and frontend should reside within their respective directories (`/backend/src/test` and `/frontend/src/__tests__` or similar).

## Strategy
- Use tools like Cypress or Playwright for E2E tests against the fully dockerized environment.
- Tests will be executed via GitHub Actions.
