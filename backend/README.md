# Career Document Hub — Backend

Spring Boot API for Career Document Hub.

**Phase 1:** foundation (config, CORS, exceptions, OpenAPI, health, security skeleton)  
**Phase 2:** authentication (register/login/me/logout + JWT)

## Requirements

- Java 21
- Maven 3.9+
- MongoDB for **running** the app (local or Atlas)
- `JWT_SECRET` (min 32 characters) when starting the app

Automated tests use **embedded MongoDB** (flapdoodle) and a test-only JWT secret.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | For run | Mongo connection URI (default: `mongodb://localhost:27017`) |
| `MONGODB_DATABASE` | No | Database name (default: `career_document_hub`) |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated frontend origins |
| `JWT_SECRET` | **Yes (run)** | HS256 signing secret, ≥32 UTF-8 bytes |
| `JWT_EXPIRATION_MINUTES` | No | Access token lifetime (default **60**) |
| `SERVER_PORT` | No | HTTP port (default: `8080`) |
| `SPRING_PROFILES_ACTIVE` | No | `local` loads gitignored `application-local.properties` |

Never commit real passwords, JWT secrets, or Atlas URIs.

## Run locally

```bash
cd backend
set MONGODB_URI=mongodb://localhost:27017
set MONGODB_DATABASE=career_document_hub
set JWT_SECRET=replace-with-a-long-random-secret-32chars-min
./mvnw spring-boot:run
```

Frontend API base (dev): `http://localhost:8080/api/v1`

## Auth API (Phase 2)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/api/v1/auth/register` | Public | `{ name, email, password }` → `{ userId, name, email, accessToken }` |
| `POST` | `/api/v1/auth/login` | Public | `{ email, password }` → same |
| `GET` | `/api/v1/auth/me` | Bearer | Current user from JWT (`userId`, `name`, `email`) |
| `POST` | `/api/v1/auth/logout` | Bearer | Client must discard token; **no server-side revocation** in Phase 2 |

Responses are wrapped in `ApiResponse` (`success`, `message`, `data`, `timestamp`).

Passwords: BCrypt. JWT: HS256, `sub` = user id, default expiry 60 minutes.

## Other URLs

| URL | Auth |
|-----|------|
| `GET /actuator/health` | Public |
| `GET /swagger-ui.html` | Public |
| `GET /v3/api-docs` | Public |
| Other `/api/v1/**` | Bearer required |

## Tests

```bash
./mvnw test
./mvnw package
```

## Deferred

Forgot/reset password, profile, vault, documents, certificates, expiry,
signatures, resume, dashboard, AI, refresh tokens, server-side token revocation.
