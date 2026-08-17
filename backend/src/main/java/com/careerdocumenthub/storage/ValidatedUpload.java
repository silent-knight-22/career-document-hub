package com.careerdocumenthub.storage;

/**
 * Magic-byte file validation result aligned with the frontend {@code type}: {@code pdf} | {@code image}.
 */
public record ValidatedUpload(
        String type,
        String contentType,
        String extension,
        byte[] content,
        String originalFilename,
        long size
) {
}
