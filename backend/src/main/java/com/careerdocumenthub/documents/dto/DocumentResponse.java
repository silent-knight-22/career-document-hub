package com.careerdocumenthub.documents.dto;

import java.time.Instant;

/** Safe signable-document projection — no storage keys. */
public record DocumentResponse(
        String id,
        String name,
        String type,
        long size,
        boolean signed,
        Instant createdAt,
        Instant signedAt
) {
}
