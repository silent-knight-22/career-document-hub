package com.careerdocumenthub.storage;

import com.careerdocumenthub.common.exception.ResourceNotFoundException;
import com.careerdocumenthub.config.AppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileStorageService storage;

    @BeforeEach
    void setUp() {
        AppProperties props = new AppProperties(
                new AppProperties.Cors("http://localhost:5173"),
                new AppProperties.Security(new AppProperties.Security.Jwt(
                        "unit-test-cdh-jwt-secret-key-32chars!!", 60L)),
                new AppProperties.Storage(tempDir.toString()));
        storage = new LocalFileStorageService(props);
        storage.init();
    }

    @Test
    void storeLoadDeleteRoundTrip() throws Exception {
        byte[] content = "hello-file".getBytes(StandardCharsets.UTF_8);
        StoredObject stored = storage.store("user1/vault/a.pdf", content, "application/pdf", "a.pdf");
        assertThat(stored.storageKey()).isEqualTo("user1/vault/a.pdf");
        assertThat(storage.exists("user1/vault/a.pdf")).isTrue();

        try (InputStream in = storage.open("user1/vault/a.pdf")) {
            assertThat(in.readAllBytes()).isEqualTo(content);
        }

        storage.delete("user1/vault/a.pdf");
        assertThat(storage.exists("user1/vault/a.pdf")).isFalse();
    }

    @Test
    void openMissingThrowsNotFound() {
        assertThatThrownBy(() -> storage.open("missing/key.pdf"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rejectsPathTraversal() {
        assertThatThrownBy(() -> storage.store("../escape.pdf", new byte[]{1}, "application/pdf", "x.pdf"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deleteQuietlyIgnoresMissing() {
        storage.deleteQuietly("no/such/file.pdf");
    }
}
