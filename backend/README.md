# Career Document Hub — Backend

Spring Boot API for Career Document Hub.

**Phase 1:** foundation (config, CORS, exceptions, OpenAPI, health, security skeleton)  
**Phase 2:** authentication (register/login/me/logout + JWT)
**Phase 3:** user profile (`GET/PUT /users/me`)
**Phase 4:** Document Vault + Signable Documents (separate domains, local file storage)

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
| `STORAGE_LOCAL_ROOT` | No | Local file storage directory (default `./data/storage`) |
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

## Profile API (Phase 3)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/api/v1/users/me` | Bearer | `{ userId, name, email, createdAt, updatedAt }` |
| `PUT` | `/api/v1/users/me` | Bearer | Body `{ name }` only — email/password/id not editable |

Identity always comes from the JWT (`UserPrincipal`), never from a client-supplied `userId`.

## Vault API (Phase 4)

Separate from signable documents. Collection: `vault_items`.

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/api/v1/vault` | Bearer | multipart: `file` + optional `category`, `tags`, `note`, `expiryDate` → **201** |
| `GET` | `/api/v1/vault` | Bearer | List current user's items |
| `GET` | `/api/v1/vault/{id}` | Bearer | Metadata only (no storage keys) |
| `PATCH` | `/api/v1/vault/{id}` | Bearer | `note`, `starred`, `expiryDate`, `clearExpiryDate`, `category`, `tags` |
| `DELETE` | `/api/v1/vault/{id}` | Bearer | **204** — removes metadata + file |
| `GET` | `/api/v1/vault/{id}/file` | Bearer | Binary download |

Limits: PDF/PNG/JPEG, **5 MB**, magic-byte validated. Categories: `personal|academic|professional|financial|medical|other`.

## Documents API (Phase 4)

Signable documents. Collection: `documents`. Signature merging stays **client-side**.

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/api/v1/documents` | Bearer | multipart `file` — PDF/PNG/JPEG, **3 MB** → **201** |
| `GET` | `/api/v1/documents` | Bearer | List |
| `GET` | `/api/v1/documents/{id}` | Bearer | Metadata |
| `DELETE` | `/api/v1/documents/{id}` | Bearer | **204** |
| `GET` | `/api/v1/documents/{id}/file` | Bearer | `?variant=original\|signed` |
| `POST` | `/api/v1/documents/{id}/sign` | Bearer | multipart client-merged signed file (up to **10 MB**) |

## Storage architecture

- Interface: `FileStorageService` (`store` / `open` / `exists` / `delete`)
- Implementation: `LocalFileStorageService` under `STORAGE_LOCAL_ROOT`
- MongoDB stores relative **storage keys** only (never absolute paths / dataUrls)
- Future S3 implementation can replace the local bean without changing vault/document services

Ownership: every query uses `findByIdAndUserId` / `findAllByUserId`. Cross-user access returns **404**.

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

Forgot/reset password, account deletion, password change, certificates, expiry aggregation,
signature library, resume, dashboard aggregation, AI, refresh tokens, server-side signature rendering,
object-storage (S3) provider.
