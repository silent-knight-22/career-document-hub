package com.careerdocumenthub.users.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Registered account. Passwords are stored only as {@code passwordHash} (BCrypt).
 * Extensible for Phase 3 profile fields (avatar, preferences, etc.).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    /** Normalized lowercase email; unique index enforced in MongoDB. */
    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private Instant createdAt;

    private Instant updatedAt;
}
