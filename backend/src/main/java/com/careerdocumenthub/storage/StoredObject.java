package com.careerdocumenthub.storage;

/**
 * Relative storage key and content metadata for a persisted file.
 * Never expose the underlying filesystem path to API clients.
 */
public record StoredObject(
        String storageKey,
        String contentType,
        long sizeBytes,
        String originalFilename
) {
}
