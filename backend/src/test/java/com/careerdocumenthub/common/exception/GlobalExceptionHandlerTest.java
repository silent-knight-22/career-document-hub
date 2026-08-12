package com.careerdocumenthub.common.exception;

import com.careerdocumenthub.common.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercises exception / validation infrastructure via a test-only controller
 * (not a product feature). Paths are prefixed with /api/v1 by WebConfig.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(GlobalExceptionHandlerTest.ProbeControllers.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void validationErrorsReturnFieldMap() throws Exception {
        String body = objectMapper.writeValueAsString(new ProbeRequest("", "not-an-email"));

        mockMvc.perform(post("/api/v1/__foundation/probe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.name").exists())
                .andExpect(jsonPath("$.data.email").exists());
    }

    @Test
    @WithMockUser
    void malformedJsonReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/__foundation/probe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Malformed request body"));
    }

    @Test
    @WithMockUser
    void resourceNotFoundReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/__foundation/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Probe resource not found"));
    }

    @Test
    @WithMockUser
    void illegalArgumentReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/__foundation/illegal"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Illegal probe argument"));
    }

    @TestConfiguration
    static class ProbeControllers {

        @Bean
        FoundationProbeController foundationProbeController() {
            return new FoundationProbeController();
        }
    }

    @RestController
    static class FoundationProbeController {

        @PostMapping("/__foundation/probe")
        ResponseEntity<ApiResponse<String>> probe(@Valid @RequestBody ProbeRequest request) {
            return ResponseEntity.ok(ApiResponse.success(request.name()));
        }

        @GetMapping("/__foundation/missing")
        ResponseEntity<ApiResponse<Void>> missing() {
            throw new ResourceNotFoundException("Probe resource not found");
        }

        @GetMapping("/__foundation/illegal")
        ResponseEntity<ApiResponse<Void>> illegal() {
            throw new IllegalArgumentException("Illegal probe argument");
        }
    }

    record ProbeRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid") String email
    ) {
    }
}
