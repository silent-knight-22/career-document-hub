package com.careerdocumenthub.users.dto;

import java.time.Instant;

/**
 * Safe profile projection for the authenticated user.
 * Matches frontend Profile display needs ({@code userId}, name, email, createdAt).
 * Never includes {@code passwordHash}.
 */
public record UserProfileResponse(
        String userId,
        String name,
        String email,
        Instant createdAt,
        Instant updatedAt
) {
}
