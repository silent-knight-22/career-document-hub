package com.careerdocumenthub.users;

import com.careerdocumenthub.auth.dto.LoginRequest;
import com.careerdocumenthub.auth.dto.RegisterRequest;
import com.careerdocumenthub.users.domain.User;
import com.careerdocumenthub.users.dto.UpdateProfileRequest;
import com.careerdocumenthub.users.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserProfileIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanUsers() {
        userRepository.deleteAll();
    }

    @Test
    void getProfileAuthenticatedReturnsSafeFields() throws Exception {
        JsonNode auth = register("alice@example.com", "password123", "Alice Wonder");
        String token = auth.path("accessToken").asText();

        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(auth.path("userId").asText()))
                .andExpect(jsonPath("$.data.name").value("Alice Wonder"))
                .andExpect(jsonPath("$.data.email").value("alice@example.com"))
                .andExpect(jsonPath("$.data.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.data.updatedAt").isNotEmpty())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    void getProfileUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getProfileInvalidJwtReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer not-a-valid-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getProfileWhenUserDeletedReturns401() throws Exception {
        // JwtAuthenticationFilter loads the user by JWT subject; a deleted account
        // leaves SecurityContext empty → 401 (not 404 from the controller).
        JsonNode auth = register("gone@example.com", "password123", "Gone User");
        String token = auth.path("accessToken").asText();
        userRepository.deleteById(auth.path("userId").asText());

        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProfileChangesNameAndUpdatedAt() throws Exception {
        JsonNode auth = register("bob@example.com", "password123", "Bob Builder");
        String token = auth.path("accessToken").asText();
        String userId = auth.path("userId").asText();

        User before = userRepository.findById(userId).orElseThrow();
        Instant previousUpdatedAt = before.getUpdatedAt();
        String previousHash = before.getPasswordHash();
        Instant previousCreatedAt = before.getCreatedAt();

        // Ensure updatedAt can move forward
        Thread.sleep(20);

        mockMvc.perform(put("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateProfileRequest("Robert Builder"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Robert Builder"))
                .andExpect(jsonPath("$.data.email").value("bob@example.com"))
                .andExpect(jsonPath("$.data.userId").value(userId))
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());

        User after = userRepository.findById(userId).orElseThrow();
        assertThat(after.getName()).isEqualTo("Robert Builder");
        assertThat(after.getEmail()).isEqualTo("bob@example.com");
        assertThat(after.getPasswordHash()).isEqualTo(previousHash);
        assertThat(after.getCreatedAt()).isEqualTo(previousCreatedAt);
        assertThat(after.getUpdatedAt()).isAfter(previousUpdatedAt);
        assertThat(after.getId()).isEqualTo(userId);
    }

    @Test
    void updateProfileUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(put("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateProfileRequest("Nope"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProfileBlankNameReturns400() throws Exception {
        JsonNode auth = register("val@example.com", "password123", "Valid Name");
        mockMvc.perform(put("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + auth.path("accessToken").asText())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateProfileRequest("   "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.name").exists());
    }

    @Test
    void updateProfileNameTooLongReturns400() throws Exception {
        JsonNode auth = register("long@example.com", "password123", "Valid Name");
        String tooLong = "x".repeat(81);
        mockMvc.perform(put("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + auth.path("accessToken").asText())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", tooLong))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.name").exists());
    }

    @Test
    void updateProfileIgnoresClientSuppliedImmutableFields() throws Exception {
        JsonNode auth = register("immut@example.com", "password123", "Original Name");
        String token = auth.path("accessToken").asText();
        String userId = auth.path("userId").asText();
        User before = userRepository.findById(userId).orElseThrow();

        // Attempt to smuggle id / email / passwordHash — DTO only binds name
        String body = """
                {
                  "name": "New Name",
                  "userId": "attacker-chosen-id",
                  "id": "attacker-chosen-id",
                  "email": "hacker@evil.com",
                  "passwordHash": "$2a$10$fakehashshouldnotapply",
                  "password": "hackedpass",
                  "createdAt": "2000-01-01T00:00:00Z"
                }
                """;

        mockMvc.perform(put("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("New Name"))
                .andExpect(jsonPath("$.data.userId").value(userId))
                .andExpect(jsonPath("$.data.email").value("immut@example.com"));

        User after = userRepository.findById(userId).orElseThrow();
        assertThat(after.getId()).isEqualTo(userId);
        assertThat(after.getEmail()).isEqualTo("immut@example.com");
        assertThat(after.getPasswordHash()).isEqualTo(before.getPasswordHash());
        assertThat(after.getCreatedAt()).isEqualTo(before.getCreatedAt());
        assertThat(after.getName()).isEqualTo("New Name");
    }

    @Test
    void idorUserACannotModifyUserBViaAnyClientIdentifier() throws Exception {
        JsonNode userA = register("a@example.com", "password123", "User A");
        JsonNode userB = register("b@example.com", "password123", "User B");
        String tokenA = userA.path("accessToken").asText();
        String idA = userA.path("userId").asText();
        String idB = userB.path("userId").asText();

        String body = """
                {
                  "name": "Hijacked Name",
                  "userId": "%s",
                  "id": "%s",
                  "email": "b@example.com"
                }
                """.formatted(idB, idB);

        mockMvc.perform(put("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(idA))
                .andExpect(jsonPath("$.data.name").value("Hijacked Name"))
                .andExpect(jsonPath("$.data.email").value("a@example.com"));

        User a = userRepository.findById(idA).orElseThrow();
        User b = userRepository.findById(idB).orElseThrow();
        assertThat(a.getName()).isEqualTo("Hijacked Name");
        assertThat(b.getName()).isEqualTo("User B");
        assertThat(b.getEmail()).isEqualTo("b@example.com");
    }

    @Test
    void idorUserACannotReadUserBProfile() throws Exception {
        JsonNode userA = register("read-a@example.com", "password123", "Reader A");
        JsonNode userB = register("read-b@example.com", "password123", "Reader B");

        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userA.path("accessToken").asText())
                        .param("userId", userB.path("userId").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(userA.path("userId").asText()))
                .andExpect(jsonPath("$.data.email").value("read-a@example.com"));
    }

    @Test
    void loginStillWorksAfterProfileUpdate() throws Exception {
        JsonNode auth = register("login-after@example.com", "password123", "Before");
        mockMvc.perform(put("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + auth.path("accessToken").asText())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateProfileRequest("After"))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("login-after@example.com", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("After"));
    }

    private JsonNode register(String email, String password, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest(name, email, password))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
    }
}
