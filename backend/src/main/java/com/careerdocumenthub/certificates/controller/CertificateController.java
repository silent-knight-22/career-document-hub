package com.careerdocumenthub.certificates.controller;

import com.careerdocumenthub.certificates.dto.CertificateResponse;
import com.careerdocumenthub.certificates.dto.UpdateCertificateRequest;
import com.careerdocumenthub.certificates.service.CertificateService;
import com.careerdocumenthub.common.response.ApiResponse;
import com.careerdocumenthub.config.OpenApiConfig;
import com.careerdocumenthub.security.SecurityUtils;
import com.careerdocumenthub.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificates", description = "Certificate metadata with optional PDF/PNG/JPEG file storage")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Create certificate",
            description = "Multipart: required name + issuer; optional file (PDF/PNG/JPEG, max 5 MB), "
                    + "issuedDate, expiryDate, credentialId, credentialUrl. File is optional.")
    public ResponseEntity<ApiResponse<CertificateResponse>> create(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("name") String name,
            @RequestPart("issuer") String issuer,
            @RequestPart(value = "issuedDate", required = false) String issuedDate,
            @RequestPart(value = "expiryDate", required = false) String expiryDate,
            @RequestPart(value = "credentialId", required = false) String credentialId,
            @RequestPart(value = "credentialUrl", required = false) String credentialUrl) {

        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        CertificateResponse created = certificateService.create(
                principal, file, name, issuer, issuedDate, expiryDate, credentialId, credentialUrl);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Certificate created"));
    }

    @GetMapping
    @Operation(summary = "List certificates", description = "Returns only the authenticated user's certificates.")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> list() {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(certificateService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get certificate metadata")
    public ResponseEntity<ApiResponse<CertificateResponse>> get(@PathVariable String id) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(certificateService.get(principal, id)));
    }

    @PatchMapping("/{id}")
    @Operation(
            summary = "Update certificate expiry",
            description = "Narrow PATCH for Expiry Tracker: expiryDate and/or clearExpiryDate only.")
    public ResponseEntity<ApiResponse<CertificateResponse>> update(
            @PathVariable String id,
            @RequestBody UpdateCertificateRequest request) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                certificateService.updateExpiry(principal, id, request),
                "Certificate updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete certificate and stored file (if any)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        certificateService.delete(principal, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/file")
    @Operation(summary = "Download certificate file", description = "Binary download; 404 when no file is attached.")
    public ResponseEntity<InputStreamResource> download(@PathVariable String id) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return certificateService.download(principal, id);
    }
}
