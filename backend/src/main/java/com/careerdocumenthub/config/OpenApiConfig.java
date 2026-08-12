package com.careerdocumenthub.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI metadata. Bearer JWT is documented for Phase 2; Phase 1 does not validate tokens.
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
                                        "JWT Bearer authentication (Phase 2). "
                                                + "Phase 1 does not issue or validate tokens.")));
    }
}
