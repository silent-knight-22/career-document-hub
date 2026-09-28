package com.careerdocumenthub.certificates;

import com.careerdocumenthub.auth.dto.RegisterRequest;
import com.careerdocumenthub.certificates.domain.Certificate;
import com.careerdocumenthub.certificates.repository.CertificateRepository;
import com.careerdocumenthub.storage.FileStorageService;
import com.careerdocumenthub.storage.TestFileFixtures;
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
class CertificateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @BeforeEach
    void clean() {
        certificateRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createWithFileListGetPatchDownloadDelete() throws Exception {
        String token = register("cert-a@example.com");

        MvcResult created = mockMvc.perform(multipart("/api/v1/certificates")
                        .file(new MockMultipartFile(
                                "file", "aws.pdf", "application/pdf", TestFileFixtures.pdfBytes(180)))
                        .file(textPart("name", "AWS Solutions Architect"))
                        .file(textPart("issuer", "Amazon Web Services"))
                        .file(textPart("issuedDate", "2024-06-01"))
                        .file(textPart("expiryDate", "2027-06-01"))
                        .file(textPart("credentialId", "AWS-12345"))
                        .file(textPart("credentialUrl", "https://aws.amazon.com/verification"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Certificate created"))
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.name").value("AWS Solutions Architect"))
                .andExpect(jsonPath("$.data.issuer").value("Amazon Web Services"))
                .andExpect(jsonPath("$.data.issuedDate").value("2024-06-01"))
                .andExpect(jsonPath("$.data.expiryDate").value("2027-06-01"))
                .andExpect(jsonPath("$.data.credentialId").value("AWS-12345"))
                .andExpect(jsonPath("$.data.size").value(180))
                .andExpect(jsonPath("$.data.type").value("pdf"))
                .andExpect(jsonPath("$.data.storageKey").doesNotExist())
                .andExpect(jsonPath("$.data.userId").doesNotExist())
                .andReturn();

        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asText();

        Certificate stored = certificateRepository.findById(id).orElseThrow();
        assertThat(stored.getStorageKey()).isNotBlank();
        assertThat(fileStorageService.exists(stored.getStorageKey())).isTrue();

        mockMvc.perform(get("/api/v1/certificates").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/certificates/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id));

        mockMvc.perform(patch("/api/v1/certificates/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expiryDate\":\"2028-01-15\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.expiryDate").value("2028-01-15"));

        mockMvc.perform(patch("/api/v1/certificates/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clearExpiryDate\":true}"))
                .andExpect(status().isOk());

        JsonNode afterClear = objectMapper.readTree(
                mockMvc.perform(get("/api/v1/certificates/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString());
        assertThat(afterClear.path("data").path("expiryDate").isNull()).isTrue();

        mockMvc.perform(get("/api/v1/certificates/" + id + "/file")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"));

        String storageKey = stored.getStorageKey();
        mockMvc.perform(delete("/api/v1/certificates/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNoContent());

        assertThat(certificateRepository.findById(id)).isEmpty();
        assertThat(fileStorageService.exists(storageKey)).isFalse();

        mockMvc.perform(get("/api/v1/certificates/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void createWithoutFileSucceedsAndDownloadReturns404() throws Exception {
        String token = register("cert-nofile@example.com");

        MvcResult created = mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "NPTEL Course"))
                        .file(textPart("issuer", "NPTEL"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.size").value(0))
                .andExpect(jsonPath("$.data.issuedDate").value(""))
                .andExpect(jsonPath("$.data.credentialId").value(""))
                .andExpect(jsonPath("$.data.credentialUrl").value(""))
                .andReturn();

        JsonNode data = objectMapper.readTree(created.getResponse().getContentAsString()).path("data");
        assertThat(data.path("expiryDate").isNull()).isTrue();
        assertThat(data.path("type").isNull()).isTrue();

        String id = data.path("id").asText();
        Certificate stored = certificateRepository.findById(id).orElseThrow();
        assertThat(stored.getStorageKey()).isNull();

        mockMvc.perform(get("/api/v1/certificates/" + id + "/file")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsInvalidMetadataAndFiles() throws Exception {
        String token = register("cert-val@example.com");

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", ""))
                        .file(textPart("issuer", "AWS"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", ""))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "a".repeat(121)))
                        .file(textPart("issuer", "AWS"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "b".repeat(121)))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "AWS"))
                        .file(textPart("credentialId", "c".repeat(81)))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "AWS"))
                        .file(textPart("credentialUrl", "javascript:alert(1)"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "AWS"))
                        .file(textPart("issuedDate", "01-06-2024"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "AWS"))
                        .file(textPart("expiryDate", "not-a-date"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]))
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "AWS"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(new MockMultipartFile("file", "x.bin", "application/octet-stream", new byte[]{1, 2, 3}))
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "AWS"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        byte[] huge = TestFileFixtures.pdfBytes((int) (5 * 1024 * 1024) + 100);
        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(new MockMultipartFile("file", "huge.pdf", "application/pdf", huge))
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "AWS"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void patchRejectsInvalidExpiryAndMissingCertificate() throws Exception {
        String token = register("cert-patch@example.com");

        MvcResult created = mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "Coursera"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isCreated())
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asText();

        mockMvc.perform(patch("/api/v1/certificates/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expiryDate\":\"bad\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/v1/certificates/missing-id")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expiryDate\":\"2027-01-01\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/certificates")).andExpect(status().isUnauthorized());
        mockMvc.perform(multipart("/api/v1/certificates")
                        .file(textPart("name", "Cert"))
                        .file(textPart("issuer", "AWS")))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/certificates/any/file")).andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/certificates/any")).andExpect(status().isUnauthorized());
        mockMvc.perform(patch("/api/v1/certificates/any")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clearExpiryDate\":true}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void idorUserBCannotAccessUserACertificates() throws Exception {
        String tokenA = register("cert-owner@example.com");
        String tokenB = register("cert-other@example.com");

        MvcResult created = mockMvc.perform(multipart("/api/v1/certificates")
                        .file(new MockMultipartFile(
                                "file", "secret.pdf", "application/pdf", TestFileFixtures.pdfBytes(40)))
                        .file(textPart("name", "Secret Cert"))
                        .file(textPart("issuer", "Private"))
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenA)))
                .andExpect(status().isCreated())
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString())
                .path("data").path("id").asText();

        mockMvc.perform(get("/api/v1/certificates/" + id).header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/certificates/" + id + "/file")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/api/v1/certificates/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expiryDate\":\"2030-01-01\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/v1/certificates/" + id).header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/certificates").header(HttpHeaders.AUTHORIZATION, bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));

        mockMvc.perform(get("/api/v1/certificates/" + id).header(HttpHeaders.AUTHORIZATION, bearer(tokenA)))
                .andExpect(status().isOk());
    }

    private String register(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("Cert User", email, "password123"))))
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
