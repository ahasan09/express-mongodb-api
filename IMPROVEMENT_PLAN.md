# Improvement Plan: nodejs-mongodb

## Overview
Express + MongoDB REST API with JWT auth. No API documentation, no input validation library, limited error handling, and no containerization.

## Improvements

### Security (High Priority)
- Upgrade `helmet` (currently v3) to the latest major for current security headers (XSS, HSTS, CSP, etc.)
- Add `express-rate-limit` on auth endpoints to prevent brute-force attacks
- Wire up the existing `joi` dependency (or `express-validator`) to validate and sanitize all route inputs — currently unused
- Store JWT secret in environment variables only (not in code); rotate if it's been committed
- Add CORS configuration with an explicit origin allowlist

### Dependency Upgrades
- Bump deeply outdated deps: `express ^4.16` → v5, `mongoose ^5.4` → v8, `bcrypt ^3` → v5, `jsonwebtoken ^8.5` → v9
- Bump Node engine from `10.15` to an active LTS (22)

### API Documentation
- Add Swagger/OpenAPI documentation using `swagger-ui-express` + `swagger-jsdoc`
- Document all route parameters, request bodies, and response shapes

### Testing
- Add Jest + Supertest unit and integration tests for all routes
- Use MongoDB Memory Server (`mongodb-memory-server`) to run tests without a real DB
- Add GitHub Actions CI to run tests on every PR

### Code Quality
- Add TypeScript (or at minimum JSDoc type annotations) for all models and route handlers
- Add ESLint + Prettier
- Centralize error handling with a single Express error middleware instead of per-route try/catch

### DevOps
- Add a `Dockerfile` and `docker-compose.yml` (app + MongoDB)
- Add environment variable validation on startup (fail fast if required vars are missing)
- Add GitHub Actions CI: lint + test + build Docker image
