package com.careerdocumenthub.vault.dto;

import java.time.Instant;
import java.util.List;

/** Safe vault item projection — no storage keys or absolute paths. */
public record VaultItemResponse(
        String id,
        String name,
        String type,
        long size,
        String category,
        List<String> tags,
        String note,
        String expiryDate,
        boolean starred,
        Instant createdAt,
        Instant updatedAt
) {
}
