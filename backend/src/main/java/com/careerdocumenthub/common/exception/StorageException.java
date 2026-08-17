package com.careerdocumenthub.common.exception;

/** Storage I/O failure. Mapped to HTTP 500 without exposing paths. */
public class StorageException extends RuntimeException {

    public StorageException(String message) {
        super(message);
    }
}
