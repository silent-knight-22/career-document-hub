package com.careerdocumenthub.auth.dto;

/** Safe public user projection — never includes passwordHash. */
public record UserResponse(
        String userId,
        String name,
        String email
) {
}
