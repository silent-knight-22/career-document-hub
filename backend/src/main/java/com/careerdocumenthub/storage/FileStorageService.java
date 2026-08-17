package com.careerdocumenthub.storage;

import java.io.InputStream;

/**
 * File storage port. Implementations must not know about JWT, users, or HTTP.
 */
public interface FileStorageService {

    /**
     * Persist bytes under a relative storage key.
     *
     * @param storageKey relative key (no absolute paths)
     * @param content    file bytes
     * @param contentType MIME type
     * @param originalFilename original client filename (metadata only)
     */
    StoredObject store(String storageKey, byte[] content, String contentType, String originalFilename);

    /**
     * Open a stream for the given storage key.
     *
     * @throws com.careerdocumenthub.common.exception.ResourceNotFoundException if missing
     */
    InputStream open(String storageKey);

    boolean exists(String storageKey);

    void delete(String storageKey);

    /** Best-effort delete; ignores missing keys. */
    void deleteQuietly(String storageKey);
}
