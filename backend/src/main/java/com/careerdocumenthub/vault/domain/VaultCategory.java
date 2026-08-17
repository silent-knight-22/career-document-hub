package com.careerdocumenthub.vault.domain;

import java.util.Locale;
import java.util.Set;

public enum VaultCategory {
    personal,
    academic,
    professional,
    financial,
    medical,
    other;

    private static final Set<String> IDS = Set.of(
            "personal", "academic", "professional", "financial", "medical", "other"
    );

    public static VaultCategory from(String raw) {
        if (raw == null || raw.isBlank()) {
            return other;
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT);
        if (!IDS.contains(normalized)) {
            throw new IllegalArgumentException("Invalid category. Allowed: personal, academic, professional, financial, medical, other");
        }
        return VaultCategory.valueOf(normalized);
    }
}
