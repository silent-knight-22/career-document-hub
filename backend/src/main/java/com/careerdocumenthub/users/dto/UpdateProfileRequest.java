package com.careerdocumenthub.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Profile update body. Frontend currently edits name only; email is not editable.
 */
public record UpdateProfileRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 80, message = "Name must be at most 80 characters")
        String name
) {
    public UpdateProfileRequest {
        name = name == null ? null : name.trim();
    }
}
