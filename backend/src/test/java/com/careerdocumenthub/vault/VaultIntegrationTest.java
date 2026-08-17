package com.careerdocumenthub.vault;

import com.careerdocumenthub.auth.dto.RegisterRequest;
import com.careerdocumenthub.storage.TestFileFixtures;
import com.careerdocumenthub.users.repository.UserRepository;
import com.careerdocumenthub.vault.repository.VaultItemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VaultIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VaultItemRepository vaultItemRepository;

    @BeforeEach
    void clean() {
        vaultItemRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void uploadListGetUpdateDownloadDelete() throws Exception {
        String token = register("vault-a@example.com");

        MockMultipartFile file = new MockMultipartFile(
                "file", "offer.pdf", "application/pdf", TestFileFixtures.pdfBytes(200));
        MockMultipartFile category = textPart("category", "professional");
        MockMultipartFile tags = textPart("tags", "internship,urgent");
        MockMultipartFile note = textPart("note", "Campus offer letter");
        MockMultipartFile expiry = textPart("expiryDate", "2030-12-31");

        MvcResult created = mockMvc.perform(multipart("/api/v1/vault")
                        .file(file).file(category).file(tags).file(note).file(expiry)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.name").value("offer.pdf"))
                .andExpect(jsonPath("$.data.type").value("pdf"))
                .andExpect(jsonPath("$.data.category").value("professional"))
                .andExpect(jsonPath("$.data.tags[0]").value("internship"))
                .andExpect(jsonPath("$.data.note").value("Campus offer letter"))
                .andExpect(jsonPath("$.data.expiryDate").value("2030-12-31"))
                .andExpect(jsonPath("$.data.starred").value(false))
                .andExpect(jsonPath("$.data.storageKey").doesNotExist())
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asText();

        mockMvc.perform(get("/api/v1/vault").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/vault/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id));

        mockMvc.perform(patch("/api/v1/vault/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"note":"Updated note","starred":true,"expiryDate":"2031-01-15","category":"academic"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.note").value("Updated note"))
                .andExpect(jsonPath("$.data.starred").value(true))
                .andExpect(jsonPath("$.data.expiryDate").value("2031-01-15"))
                .andExpect(jsonPath("$.data.category").value("academic"));

        mockMvc.perform(patch("/api/v1/vault/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clearExpiryDate\":true}"))
                .andExpect(status().isOk());

        JsonNode afterClear = objectMapper.readTree(
                mockMvc.perform(get("/api/v1/vault/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString());
        assertThat(afterClear.path("data").path("expiryDate").isNull()).isTrue();

        mockMvc.perform(get("/api/v1/vault/" + id + "/file")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"));

        mockMvc.perform(delete("/api/v1/vault/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/vault/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticatedVaultAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/vault")).andExpect(status().isUnauthorized());
        mockMvc.perform(multipart("/api/v1/vault")
                        .file(new MockMultipartFile("file", "a.pdf", "application/pdf", TestFileFixtures.pdfBytes(20))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsUnsupportedAndOversized() throws Exception {
        String token = register("vault-val@example.com");

        mockMvc.perform(multipart("/api/v1/vault")
                        .file(new MockMultipartFile("file", "x.bin", "application/octet-stream", new byte[]{1, 2, 3}))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        byte[] huge = TestFileFixtures.pdfBytes((int) (5 * 1024 * 1024) + 100);
        mockMvc.perform(multipart("/api/v1/vault")
                        .file(new MockMultipartFile("file", "huge.pdf", "application/pdf", huge))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void idorUserBCannotAccessUserAVault() throws Exception {
        String tokenA = register("vault-owner@example.com");
        String tokenB = register("vault-other@example.com");

        MvcResult created = mockMvc.perform(multipart("/api/v1/vault")
                        .file(new MockMultipartFile("file", "secret.pdf", "application/pdf", TestFileFixtures.pdfBytes(40)))
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenA)))
                .andExpect(status().isCreated())
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asText();

        mockMvc.perform(get("/api/v1/vault/" + id).header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/vault/" + id + "/file").header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/api/v1/vault/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\":\"hack\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/v1/vault/" + id).header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/vault").header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    private String register(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("Vault User", email, "password123"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private static MockMultipartFile textPart(String name, String value) {
        return new MockMultipartFile(name, "", "text/plain", value.getBytes());
    }
}
