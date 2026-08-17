package com.careerdocumenthub.common.exception;

/** Invalid upload (type, size, missing file). Mapped to HTTP 400. */
public class InvalidFileException extends RuntimeException {

    public InvalidFileException(String message) {
        super(message);
    }
}
