package com.careerdocumenthub.vault.controller;

import com.careerdocumenthub.common.response.ApiResponse;
import com.careerdocumenthub.config.OpenApiConfig;
import com.careerdocumenthub.security.SecurityUtils;
import com.careerdocumenthub.security.UserPrincipal;
import com.careerdocumenthub.vault.dto.UpdateVaultItemRequest;
import com.careerdocumenthub.vault.dto.VaultItemResponse;
import com.careerdocumenthub.vault.service.VaultService;
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
@RequestMapping("/vault")
@RequiredArgsConstructor
@Tag(name = "Document Vault", description = "Personal document vault (metadata + file storage)")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class VaultController {

    private final VaultService vaultService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload vault item", description = "PDF/PNG/JPEG up to 5 MB with category, tags, note, expiryDate.")
    public ResponseEntity<ApiResponse<VaultItemResponse>> create(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "category", required = false) String category,
            @RequestPart(value = "tags", required = false) String tags,
            @RequestPart(value = "note", required = false) String note,
            @RequestPart(value = "expiryDate", required = false) String expiryDate) {

        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        VaultItemResponse created = vaultService.create(principal, file, category, tags, note, expiryDate);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Vault item created"));
    }

    @GetMapping
    @Operation(summary = "List vault items")
    public ResponseEntity<ApiResponse<List<VaultItemResponse>>> list() {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(vaultService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vault item metadata")
    public ResponseEntity<ApiResponse<VaultItemResponse>> get(@PathVariable String id) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(vaultService.get(principal, id)));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update vault metadata", description = "Allowed: note, starred, expiryDate/clearExpiryDate, category, tags.")
    public ResponseEntity<ApiResponse<VaultItemResponse>> update(
            @PathVariable String id,
            @RequestBody UpdateVaultItemRequest request) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                vaultService.update(principal, id, request),
                "Vault item updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete vault item and stored file")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        vaultService.delete(principal, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/file")
    @Operation(summary = "Download vault file")
    public ResponseEntity<InputStreamResource> download(@PathVariable String id) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return vaultService.download(principal, id);
    }
}
