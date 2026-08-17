package com.careerdocumenthub.auth.dto;

/**
 * Matches the frontend session contract ({@code userId}, {@code name}, {@code email})
 * plus {@code accessToken} for the API client Bearer header.
 */
public record AuthResponse(
        String userId,
        String name,
        String email,
        String accessToken
) {
}
