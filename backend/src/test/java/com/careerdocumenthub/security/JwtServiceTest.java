package com.careerdocumenthub.security;

import com.careerdocumenthub.config.AppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        AppProperties props = new AppProperties(
                new AppProperties.Cors("http://localhost:5173"),
                new AppProperties.Security(
                        new AppProperties.Security.Jwt(
                                "unit-test-cdh-jwt-secret-key-32chars!!",
                                60L)));
        jwtService = new JwtService(props);
        jwtService.init();
    }

    @Test
    void generateAndValidateRoundTrip() {
        String token = jwtService.generateToken("user-123");
        assertThat(jwtService.isValid(token)).isTrue();
        assertThat(jwtService.extractUserId(token)).isEqualTo("user-123");
        assertThat(jwtService.isExpired(token)).isFalse();
        assertThat(jwtService.getExpirationMinutes()).isEqualTo(60L);
    }

    @Test
    void malformedTokenIsInvalid() {
        assertThat(jwtService.isValid("not.a.jwt")).isFalse();
    }

    @Test
    void blankSecretFailsFast() {
        AppProperties props = new AppProperties(
                new AppProperties.Cors("http://localhost:5173"),
                new AppProperties.Security(new AppProperties.Security.Jwt("", 60L)));
        JwtService svc = new JwtService(props);
        assertThatThrownBy(svc::init).isInstanceOf(IllegalStateException.class);
    }
}
