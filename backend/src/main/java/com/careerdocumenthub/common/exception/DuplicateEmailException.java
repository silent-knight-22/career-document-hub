package com.careerdocumenthub.common.exception;

/** Registration conflict — email already registered. Mapped to HTTP 409. */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException() {
        super("An account with this email already exists.");
    }
}
