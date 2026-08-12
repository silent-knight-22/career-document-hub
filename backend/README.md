# Career Document Hub — Backend

Spring Boot API for Career Document Hub. **Phase 1** provides foundation only
(config hygiene, security skeleton, CORS, OpenAPI, health, exception handling).
Business features (auth, documents, AI, …) come in later phases.

## Requirements

- Java 21
- Maven 3.9+
- MongoDB available for **running** the app (local or Atlas)

Automated tests use an **embedded MongoDB** (flapdoodle) so they do not need
Docker or Atlas credentials. Docker/Testcontainers can replace this later.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | For run | Mongo connection URI (default: `mongodb://localhost:27017`) |
| `MONGODB_DATABASE` | No | Database name (default: `career_document_hub`) |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated frontend origins (default: Vite localhost ports) |
| `JWT_SECRET` | Phase 2 | Prepared in config; **not used** in Phase 1 |
| `SERVER_PORT` | No | HTTP port (default: `8080`) |
| `SPRING_PROFILES_ACTIVE` | No | Set to `local` to load gitignored `application-local.properties` |

See also:

- [`.env.example`](.env.example)
- [`src/main/resources/application-example.properties`](src/main/resources/application-example.properties)

**Never commit** real passwords, JWT secrets, or Atlas URIs.
`src/main/resources/application-local.properties` is gitignored.

## Run locally

```bash
cd backend

# Option A — environment variables
set MONGODB_URI=mongodb://localhost:27017
set MONGODB_DATABASE=career_document_hub
./mvnw spring-boot:run

# Option B — local profile + application-local.properties
set SPRING_PROFILES_ACTIVE=local
./mvnw spring-boot:run
```

Frontend API base (dev): `http://localhost:8080/api/v1`

## Key URLs (Phase 1)

| URL | Auth | Purpose |
|-----|------|---------|
| `GET /actuator/health` | Public | Liveness/health (not under `/api/v1`; Mongo indicator disabled in Phase 1) |
| `GET /swagger-ui.html` | Public | Swagger UI |
| `GET /v3/api-docs` | Public | OpenAPI JSON |
| `/api/v1/**` | Required (401 until Phase 2) | Future business API |

Health stays at `/actuator/health` on purpose so ops probes are independent of the versioned API prefix.
In Phase 1, `management.health.mongo.enabled=false` so health reflects process liveness even before repositories are used. Re-enable (or add a readiness group) when the app depends on Mongo for business data.

## Security (Phase 1)

- Stateless SecurityFilterChain (no form login, no HTTP Basic, no default password).
- Public: health + Swagger/OpenAPI.
- `/api/v1/**` requires authentication → **401** until JWT lands in Phase 2.
- CORS origins from `CORS_ALLOWED_ORIGINS` / `app.cors.allowed-origins` (no `*`).
- `allowCredentials` is **false** (Bearer token via `Authorization` header).

## Tests

```bash
./mvnw test
./mvnw -DskipTests=false package
```

Test profile: `application-test.properties` + embedded Mongo.

## Intentionally deferred (Phase 2+)

Register/login, JWT filter, forgot/reset password, users, vault, documents,
certificates, expiry, signatures, resume, dashboard, AI.
