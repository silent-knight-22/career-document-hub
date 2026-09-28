package com.careerdocumenthub.certificates.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "certificates")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class Certificate {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String name;

    private String issuer;

    /** ISO date {@code YYYY-MM-DD}, or empty string when unset. */
    @Builder.Default
    private String issuedDate = "";

    /** ISO date {@code YYYY-MM-DD}, or null when unset. */
    private String expiryDate;

    @Builder.Default
    private String credentialId = "";

    @Builder.Default
    private String credentialUrl = "";

    @Builder.Default
    private long size = 0L;

    /** Frontend-aligned kind: {@code pdf} or {@code image}, or null when no file. */
    private String type;

    private String contentType;

    /** Relative storage key — never exposed to clients. Null when no file. */
    private String storageKey;

    private Instant createdAt;

    private Instant updatedAt;
}
