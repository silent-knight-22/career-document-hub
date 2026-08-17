package com.careerdocumenthub.documents.domain;

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
@Document(collection = "documents")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class SignableDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String name;

    /** Frontend contract: {@code pdf} or {@code image}. */
    private String type;

    private long size;

    @Builder.Default
    private boolean signed = false;

    private Instant createdAt;

    private Instant signedAt;

    private Instant updatedAt;

    /** Relative storage key for the original upload. */
    private String storageKey;

    private String contentType;

    /** Relative storage key for the client-merged signed artifact (nullable). */
    private String signedStorageKey;

    private String signedContentType;

    private Long signedSize;
}
