package com.careerdocumenthub.storage;

import com.careerdocumenthub.common.exception.ResourceNotFoundException;
import com.careerdocumenthub.common.exception.StorageException;
import com.careerdocumenthub.config.AppProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

/**
 * Local filesystem storage. Keys are relative paths under {@code app.storage.local-root}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LocalFileStorageService implements FileStorageService {

    private final AppProperties appProperties;
    private Path root;

    @PostConstruct
    void init() {
        String configured = appProperties.storage() != null && appProperties.storage().localRoot() != null
                ? appProperties.storage().localRoot().trim()
                : "./data/storage";
        if (configured.isBlank()) {
            configured = "./data/storage";
        }
        this.root = Paths.get(configured).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.root);
            log.info("Local file storage root ready");
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to create storage directory", ex);
        }
    }

    @Override
    public StoredObject store(String storageKey, byte[] content, String contentType, String originalFilename) {
        Path target = resolveSafe(storageKey);
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return new StoredObject(normalizeKey(storageKey), contentType, content.length, originalFilename);
        } catch (IOException ex) {
            throw new StorageException("Failed to store file");
        }
    }

    @Override
    public InputStream open(String storageKey) {
        Path target = resolveSafe(storageKey);
        if (!Files.isRegularFile(target)) {
            throw new ResourceNotFoundException("File not found");
        }
        try {
            return Files.newInputStream(target, StandardOpenOption.READ);
        } catch (IOException ex) {
            throw new StorageException("Failed to read file");
        }
    }

    @Override
    public boolean exists(String storageKey) {
        try {
            return Files.isRegularFile(resolveSafe(storageKey));
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    @Override
    public void delete(String storageKey) {
        Path target = resolveSafe(storageKey);
        try {
            if (!Files.deleteIfExists(target)) {
                throw new ResourceNotFoundException("File not found");
            }
        } catch (IOException ex) {
            throw new StorageException("Failed to delete file");
        }
    }

    @Override
    public void deleteQuietly(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(resolveSafe(storageKey));
        } catch (Exception ex) {
            log.debug("Quiet delete skipped: {}", ex.getClass().getSimpleName());
        }
    }

    private Path resolveSafe(String storageKey) {
        String key = normalizeKey(storageKey);
        if (key.isBlank() || key.contains("..")) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        Path resolved = root.resolve(key).normalize();
        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        return resolved;
    }

    private static String normalizeKey(String storageKey) {
        return storageKey == null ? "" : storageKey.replace('\\', '/').replaceAll("^/+", "");
    }
}
