package com.careerdocumenthub.storage;

import com.careerdocumenthub.common.exception.InvalidFileException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;

/**
 * Validates uploads by size and magic bytes (not Content-Type / extension alone).
 */
@Component
public class UploadValidator {

    private static final byte[] PDF = {0x25, 0x50, 0x44, 0x46}; // %PDF
    private static final byte[] PNG = {(byte) 0x89, 0x50, 0x4e, 0x47};
    private static final byte[] JPEG = {(byte) 0xff, (byte) 0xd8, (byte) 0xff};

    public ValidatedUpload validate(MultipartFile file, long maxBytes) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("No file selected.");
        }
        if (file.getSize() <= 0) {
            throw new InvalidFileException("The selected file is empty.");
        }
        if (file.getSize() > maxBytes) {
            throw new InvalidFileException(
                    "File too large. Maximum is " + formatMb(maxBytes) + ".");
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException ex) {
            throw new InvalidFileException("Failed to read uploaded file.");
        }

        Detected detected = detect(content);
        if (detected == null) {
            throw new InvalidFileException("Unrecognized file type. Only PDF, PNG, and JPEG are allowed.");
        }

        String original = sanitizeFilename(file.getOriginalFilename());
        return new ValidatedUpload(
                detected.type(),
                detected.contentType(),
                detected.extension(),
                content,
                original,
                content.length
        );
    }

    private static Detected detect(byte[] bytes) {
        if (startsWith(bytes, PDF)) {
            return new Detected("pdf", "application/pdf", "pdf");
        }
        if (startsWith(bytes, PNG)) {
            return new Detected("image", "image/png", "png");
        }
        if (startsWith(bytes, JPEG)) {
            return new Detected("image", "image/jpeg", "jpg");
        }
        return null;
    }

    private static boolean startsWith(byte[] bytes, byte[] magic) {
        if (bytes.length < magic.length) {
            return false;
        }
        for (int i = 0; i < magic.length; i++) {
            if (bytes[i] != magic[i]) {
                return false;
            }
        }
        return true;
    }

    public static String sanitizeFilename(String name) {
        if (name == null || name.isBlank()) {
            return "document";
        }
        String cleaned = name.replaceAll("[\\\\/\\x00]", "_").trim();
        if (cleaned.isBlank()) {
            return "document";
        }
        return cleaned.length() > 120 ? cleaned.substring(0, 120) : cleaned;
    }

    private static String formatMb(long bytes) {
        long mb = bytes / (1024 * 1024);
        return mb + " MB";
    }

    private record Detected(String type, String contentType, String extension) {
    }
}
