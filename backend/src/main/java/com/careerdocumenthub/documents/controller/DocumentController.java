package com.careerdocumenthub.documents.controller;

import com.careerdocumenthub.common.response.ApiResponse;
import com.careerdocumenthub.config.OpenApiConfig;
import com.careerdocumenthub.documents.dto.DocumentResponse;
import com.careerdocumenthub.documents.service.DocumentService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "Signable Documents", description = "Documents for digital signing (client merges signatures)")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload document", description = "PDF/PNG/JPEG up to 3 MB.")
    public ResponseEntity<ApiResponse<DocumentResponse>> create(@RequestPart("file") MultipartFile file) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        DocumentResponse created = documentService.create(principal, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Document uploaded"));
    }

    @GetMapping
    @Operation(summary = "List documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> list() {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(documentService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document metadata")
    public ResponseEntity<ApiResponse<DocumentResponse>> get(@PathVariable String id) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(documentService.get(principal, id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete document and stored files")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        documentService.delete(principal, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/file")
    @Operation(summary = "Download document file", description = "Query variant=original (default) or variant=signed.")
    public ResponseEntity<InputStreamResource> download(
            @PathVariable String id,
            @RequestParam(value = "variant", required = false, defaultValue = "original") String variant) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return documentService.download(principal, id, variant);
    }

    @PostMapping(value = "/{id}/sign", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Persist client-merged signed file",
            description = "Accepts the already-merged signed artifact. Does not apply signatures server-side."
    )
    public ResponseEntity<ApiResponse<DocumentResponse>> sign(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        DocumentResponse updated = documentService.sign(principal, id, file);
        return ResponseEntity.ok(ApiResponse.success(updated, "Document signed"));
    }
}
