# Database Design — Career Document Hub

This document details how our domain model maps to **MongoDB collections**, indexing strategies, and database-level rules.

---

## 1. MongoDB Collections

We define 5 top-level collections. All documents will have an auto-generated `_id` of type `ObjectId` (mapped to `String` in Spring Data).

### A. Collection: `users`
Stores user authentication details, usage quotas, and account status.
```json
{
  "_id": {"$oid": "60c72b2f9b1d8b2bad000001"},
  "name": "Preeti Tewatia",
  "email": "preeti@example.com",
  "passwordHash": "$2a$10$vI8Y...",
  "role": "USER",
  "accountStatus": "ACTIVE",
  "storageQuota": 2147483648,
  "storageUsed": 367001600,
  "emailVerified": true,
  "lastLogin": {"$date": "2026-07-14T10:00:00Z"},
  "createdAt": {"$date": "2026-07-14T07:45:00Z"},
  "updatedAt": {"$date": "2026-07-14T10:00:00Z"}
}
```
*   **Indexes**:
    *   `email`: Unique Index (fast login, prevents duplicate accounts)

---

### B. Collection: `resumes`
Stores resume content and metadata. 
```json
{
  "_id": {"$oid": "60c72b2f9b1d8b2bad000002"},
  "userId": "60c72b2f9b1d8b2bad000001",
  "title": "Java Spring Boot Resume",
  "category": "Backend",
  "skills": ["Java", "Spring Boot", "MongoDB", "REST APIs"],
  "folderId": "60c72b2f9b1d8b2bad000005",
  "tags": ["LTS", "Backend", "REST"],
  "content": {
    "summary": "Experienced backend developer specializing in Java systems.",
    "experience": [
      {
        "company": "Company A",
        "role": "Software Engineer",
        "startDate": "2024-01-01",
        "endDate": null,
        "description": "Building microservices using Spring Boot."
      }
    ],
    "education": [],
    "projects": []
  },
  "createdAt": {"$date": "2026-07-14T07:50:00Z"},
  "updatedAt": {"$date": "2026-07-14T08:10:00Z"}
}
```
*   **Indexes**:
    *   `userId`: Single field index (find all resumes for a user)
    *   `tags`: Multikey index (fast filtering by tag)

---

### C. Collection: `documents`
Stores metadata and location details of uploaded files.
```json
{
  "_id": {"$oid": "60c72b2f9b1d8b2bad000003"},
  "userId": "60c72b2f9b1d8b2bad000001",
  "title": "OfferLetter_Amazon.pdf",
  "type": "EMPLOYMENT",
  "fileUrl": "https://storage.careerdocumenthub.com/docs/60c72b2f9b1d8b2bad000003.pdf",
  "fileSize": 1048576,
  "folderId": "60c72b2f9b1d8b2bad000006",
  "tags": ["Job Offer", "Amazon"],
  "signaturesApplied": [
    {
      "signatureId": "60c72b2f9b1d8b2bad000004",
      "appliedAt": {"$date": "2026-07-14T09:00:00Z"},
      "posX": 120.5,
      "posY": 350.2,
      "pageNumber": 3
    }
  ],
  "createdAt": {"$date": "2026-07-14T08:30:00Z"},
  "updatedAt": {"$date": "2026-07-14T09:00:00Z"}
}
```
*   **Indexes**:
    *   `userId`: Single field index (find all documents for a user)
    *   `folderId`: Single field index (find all documents in a folder)

---

### D. Collection: `folders`
User directories to organize resumes and documents.
```json
{
  "_id": {"$oid": "60c72b2f9b1d8b2bad000005"},
  "userId": "60c72b2f9b1d8b2bad000001",
  "name": "Dream Companies",
  "type": "MIXED",
  "createdAt": {"$date": "2026-07-14T07:48:00Z"}
}
```
*   **Indexes**:
    *   `userId`: Single field index

---

### E. Collection: `signatures`
Saved digital signatures.
```json
{
  "_id": {"$oid": "60c72b2f9b1d8b2bad000004"},
  "userId": "60c72b2f9b1d8b2bad000001",
  "title": "Official E-Signature",
  "imageUrl": "https://storage.careerdocumenthub.com/sigs/60c72b2f9b1d8b2bad000004.png",
  "isTransparent": true,
  "createdAt": {"$date": "2026-07-14T08:50:00Z"}
}
```
*   **Indexes**:
    *   `userId`: Single field index

---

## 2. Design Strategy: Reference vs. Embed

MongoDB is a document database, meaning we can nest documents inside other documents (embedding) or link them via ID strings (referencing). We apply these rules:

1.  **Embed if: "Contains" relationship and bounded size**
    *   *AppliedSignatures inside Documents*: A document will only have a handful of applied signatures (usually 1 or 2, max 5). It is bounded and highly dependent on the document. Embedding it avoids a costly JOIN operation when fetching document history.
2.  **Reference if: "Contains" relationship but unbounded growth**
    *   *Resumes/Documents inside User*: A user can upload dozens or hundreds of files. If we embedded these arrays inside the user document, it could exceed MongoDB's **16MB document size limit** and cause slow database reads. We store them separately and reference the `userId`.
3.  **Reference if: Reused across multiple entities**
    *   *Folder and Signature*: A signature image is stored once and can be referenced by multiple signed documents. A folder document is referenced by multiple resumes and documents.
