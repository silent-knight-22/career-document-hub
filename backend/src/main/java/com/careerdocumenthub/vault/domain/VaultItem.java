package com.careerdocumenthub.vault.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vault_items")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class VaultItem {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String name;

    /** Frontend contract: {@code pdf} or {@code image}. */
    private String type;

    private long size;

    private String category;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Builder.Default
    private String note = "";

    /** ISO date {@code YYYY-MM-DD}, or null. */
    private String expiryDate;

    @Builder.Default
    private boolean starred = false;

    /** Relative storage key — never exposed to clients. */
    private String storageKey;

    private String contentType;

    private Instant createdAt;

    private Instant updatedAt;
}
