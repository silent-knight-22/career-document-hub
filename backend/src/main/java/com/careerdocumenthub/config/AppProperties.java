package com.careerdocumenthub.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application-owned configuration bound from environment / properties.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Cors cors,
        Security security
) {
    public record Cors(String allowedOrigins) {
    }

    /**
     * JWT fields are prepared for Phase 2 and are not used by Phase 1 security.
     */
    public record Security(Jwt jwt) {
        public record Jwt(String secret) {
        }
    }
}
