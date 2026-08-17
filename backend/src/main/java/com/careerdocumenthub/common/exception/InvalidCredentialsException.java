package com.careerdocumenthub.common.exception;

/**
 * Login failure with a generic message (avoids account enumeration).
 * Mapped to HTTP 401.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}
