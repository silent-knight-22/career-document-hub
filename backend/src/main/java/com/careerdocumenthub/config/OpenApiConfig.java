package com.careerdocumenthub.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI metadata including Bearer JWT scheme for protected endpoints.
 */
@Configuration
public class OpenApiConfig {

    public static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    OpenAPI careerDocumentHubOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Career Document Hub API")
                        .description("Backend REST API for Career Document Hub")
                        .version("v1")
                        .contact(new Contact().name("Career Document Hub")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description(
                                        "JWT access token from POST /api/v1/auth/login or /register. "
                                                + "Send as: Authorization: Bearer <token>. "
                                                + "Default lifetime: app.security.jwt.expiration-minutes (60).")));
    }
}
