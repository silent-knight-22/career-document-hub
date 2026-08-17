package com.careerdocumenthub.documents;

import com.careerdocumenthub.auth.dto.RegisterRequest;
import com.careerdocumenthub.documents.domain.SignableDocument;
import com.careerdocumenthub.documents.repository.SignableDocumentRepository;
import com.careerdocumenthub.storage.TestFileFixtures;
import com.careerdocumenthub.users.repository.UserRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DocumentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SignableDocumentRepository documentRepository;

    @BeforeEach
    void clean() {
        documentRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void uploadListGetSignDownloadDelete() throws Exception {
        String token = register("docs-a@example.com");

        MvcResult created = mockMvc.perform(multipart("/api/v1/documents")
                        .file(new MockMultipartFile(
                                "file", "contract.pdf", "application/pdf", TestFileFixtures.pdfBytes(120)))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.signed").value(false))
                .andExpect(jsonPath("$.data.signedAt").doesNotExist())
                .andExpect(jsonPath("$.data.storageKey").doesNotExist())
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asText();

        mockMvc.perform(get("/api/v1/documents").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/documents/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id));

        mockMvc.perform(get("/api/v1/documents/" + id + "/file")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"));

        mockMvc.perform(multipart("/api/v1/documents/" + id + "/sign")
                        .file(new MockMultipartFile(
                                "file", "signed.png", "image/png", TestFileFixtures.pngBytes(80)))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.signed").value(true))
                .andExpect(jsonPath("$.data.signedAt").isNotEmpty());

        SignableDocument stored = documentRepository.findById(id).orElseThrow();
        assertThat(stored.isSigned()).isTrue();
        assertThat(stored.getSignedAt()).isNotNull();
        assertThat(stored.getStorageKey()).isNotBlank();
        assertThat(stored.getSignedStorageKey()).isNotBlank();
        assertThat(stored.getSignedStorageKey()).isNotEqualTo(stored.getStorageKey());

        // Original still available
        mockMvc.perform(get("/api/v1/documents/" + id + "/file")
                        .param("variant", "original")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"));

        mockMvc.perform(get("/api/v1/documents/" + id + "/file")
                        .param("variant", "signed")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "image/png"));

        mockMvc.perform(delete("/api/v1/documents/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/documents/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticatedDocumentsReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/documents")).andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsInvalidAndOversizedOriginal() throws Exception {
        String token = register("docs-val@example.com");

        mockMvc.perform(multipart("/api/v1/documents")
                        .file(new MockMultipartFile("file", "x.txt", "text/plain", new byte[]{9, 9, 9}))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        byte[] huge = TestFileFixtures.pdfBytes((int) (3 * 1024 * 1024) + 50);
        mockMvc.perform(multipart("/api/v1/documents")
                        .file(new MockMultipartFile("file", "huge.pdf", "application/pdf", huge))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void idorUserBCannotAccessUserADocuments() throws Exception {
        String tokenA = register("docs-owner@example.com");
        String tokenB = register("docs-other@example.com");

        MvcResult created = mockMvc.perform(multipart("/api/v1/documents")
                        .file(new MockMultipartFile(
                                "file", "private.pdf", "application/pdf", TestFileFixtures.pdfBytes(40)))
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenA)))
                .andExpect(status().isCreated())
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asText();

        mockMvc.perform(get("/api/v1/documents/" + id).header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/documents/" + id + "/file").header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());
        mockMvc.perform(multipart("/api/v1/documents/" + id + "/sign")
                        .file(new MockMultipartFile("file", "s.png", "image/png", TestFileFixtures.pngBytes(20)))
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/v1/documents/" + id).header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/documents").header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    private String register(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("Docs User", email, "password123"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }
}
