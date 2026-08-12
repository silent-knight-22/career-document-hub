package com.careerdocumenthub.common.exception;

/**
 * Thrown when a requested resource does not exist (or is not visible to the caller).
 * Mapped to HTTP 404 by {@link com.careerdocumenthub.common.exception.GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
