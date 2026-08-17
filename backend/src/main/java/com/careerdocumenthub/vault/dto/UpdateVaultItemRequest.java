package com.careerdocumenthub.vault.dto;

import java.util.List;

/**
 * Partial update for vault metadata. Null fields are left unchanged.
 * {@code clearExpiryDate=true} clears expiry even when {@code expiryDate} is null.
 */
public record UpdateVaultItemRequest(
        String note,
        Boolean starred,
        String expiryDate,
        Boolean clearExpiryDate,
        String category,
        List<String> tags
) {
}
