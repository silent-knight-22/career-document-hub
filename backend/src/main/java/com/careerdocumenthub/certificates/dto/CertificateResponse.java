package com.careerdocumenthub.certificates.dto;

import java.time.Instant;

/** Safe certificate projection — no storage keys, paths, or dataUrl. */
public record CertificateResponse(
        String id,
        String name,
        String issuer,
        String issuedDate,
        String expiryDate,
        String credentialId,
        String credentialUrl,
        long size,
        String type,
        Instant createdAt,
        Instant updatedAt
) {
}
