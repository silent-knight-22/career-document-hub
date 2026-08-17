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

    public record Security(Jwt jwt) {
        /**
         * @param secret             HS256 signing key from {@code JWT_SECRET} (never commit real values)
         * @param expirationMinutes  access-token lifetime (default 60)
         */
        public record Jwt(String secret, long expirationMinutes) {
        }
    }
}
