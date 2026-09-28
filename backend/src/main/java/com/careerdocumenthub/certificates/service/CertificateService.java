package com.careerdocumenthub.certificates.service;

import com.careerdocumenthub.certificates.domain.Certificate;
import com.careerdocumenthub.certificates.dto.CertificateResponse;
import com.careerdocumenthub.certificates.dto.UpdateCertificateRequest;
import com.careerdocumenthub.certificates.repository.CertificateRepository;
import com.careerdocumenthub.common.exception.ResourceNotFoundException;
import com.careerdocumenthub.security.UserPrincipal;
import com.careerdocumenthub.storage.FileStorageService;
import com.careerdocumenthub.storage.UploadValidator;
import com.careerdocumenthub.storage.ValidatedUpload;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    public static final long MAX_BYTES = 5L * 1024 * 1024;

    private final CertificateRepository certificateRepository;
    private final FileStorageService fileStorageService;
    private final UploadValidator uploadValidator;

    public CertificateResponse create(
            UserPrincipal principal,
            MultipartFile file,
            String name,
            String issuer,
            String issuedDate,
            String expiryDate,
            String credentialId,
            String credentialUrl) {

        String cleanName = requireText(name, "Name", 120);
        String cleanIssuer = requireText(issuer, "Issuer", 120);
        String cleanIssued = normalizeIssuedDate(issuedDate);
        String cleanExpiry = normalizeExpiryDate(expiryDate);
        String cleanCredentialId = sanitizeOptional(credentialId, "Credential ID", 80);
        String cleanCredentialUrl = normalizeCredentialUrl(credentialUrl);

        String id = UUID.randomUUID().toString();
        String storageKey = null;
        String type = null;
        String contentType = null;
        long size = 0L;

        if (file != null && !file.isEmpty()) {
            ValidatedUpload upload = uploadValidator.validate(file, MAX_BYTES);
            storageKey = principal.getUserId() + "/certificates/" + id + "." + upload.extension();
            fileStorageService.store(storageKey, upload.content(), upload.contentType(), upload.originalFilename());
            type = upload.type();
            contentType = upload.contentType();
            size = upload.size();
        } else if (file != null && file.isEmpty()) {
            throw new com.careerdocumenthub.common.exception.InvalidFileException("The selected file is empty.");
        }

        Instant now = Instant.now();
        Certificate certificate = Certificate.builder()
                .id(id)
                .userId(principal.getUserId())
                .name(cleanName)
                .issuer(cleanIssuer)
                .issuedDate(cleanIssued)
                .expiryDate(cleanExpiry)
                .credentialId(cleanCredentialId)
                .credentialUrl(cleanCredentialUrl)
                .size(size)
                .type(type)
                .contentType(contentType)
                .storageKey(storageKey)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(certificateRepository.save(certificate));
    }

    public List<CertificateResponse> list(UserPrincipal principal) {
        return certificateRepository.findAllByUserIdOrderByCreatedAtDesc(principal.getUserId())
                .stream()
                .map(CertificateService::toResponse)
                .toList();
    }

    public CertificateResponse get(UserPrincipal principal, String id) {
        return toResponse(requireOwned(principal.getUserId(), id));
    }

    public CertificateResponse updateExpiry(UserPrincipal principal, String id, UpdateCertificateRequest request) {
        Certificate certificate = requireOwned(principal.getUserId(), id);

        if (Boolean.TRUE.equals(request.clearExpiryDate())) {
            certificate.setExpiryDate(null);
        } else if (request.expiryDate() != null) {
            certificate.setExpiryDate(normalizeExpiryDate(request.expiryDate()));
        }

        certificate.setUpdatedAt(Instant.now());
        return toResponse(certificateRepository.save(certificate));
    }

    public void delete(UserPrincipal principal, String id) {
        Certificate certificate = requireOwned(principal.getUserId(), id);
        fileStorageService.deleteQuietly(certificate.getStorageKey());
        certificateRepository.deleteByIdAndUserId(id, principal.getUserId());
    }

    public ResponseEntity<InputStreamResource> download(UserPrincipal principal, String id) {
        Certificate certificate = requireOwned(principal.getUserId(), id);
        if (certificate.getStorageKey() == null || certificate.getStorageKey().isBlank()) {
            throw new ResourceNotFoundException("File not found");
        }
        if (!fileStorageService.exists(certificate.getStorageKey())) {
            throw new ResourceNotFoundException("File not found");
        }
        InputStreamResource body = new InputStreamResource(fileStorageService.open(certificate.getStorageKey()));
        String contentType = certificate.getContentType() != null
                ? certificate.getContentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + escapeFilename(certificate.getName()) + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(certificate.getSize())
                .body(body);
    }

    private Certificate requireOwned(String userId, String id) {
        return certificateRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
    }

    private static CertificateResponse toResponse(Certificate certificate) {
        return new CertificateResponse(
                certificate.getId(),
                certificate.getName(),
                certificate.getIssuer(),
                certificate.getIssuedDate() == null ? "" : certificate.getIssuedDate(),
                certificate.getExpiryDate(),
                certificate.getCredentialId() == null ? "" : certificate.getCredentialId(),
                certificate.getCredentialUrl() == null ? "" : certificate.getCredentialUrl(),
                certificate.getSize(),
                certificate.getType(),
                certificate.getCreatedAt(),
                certificate.getUpdatedAt()
        );
    }

    private static String requireText(String raw, String label, int maxLength) {
        String cleaned = sanitizeText(raw, label, maxLength);
        if (cleaned.isEmpty()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return cleaned;
    }

    private static String sanitizeOptional(String raw, String label, int maxLength) {
        if (raw == null) {
            return "";
        }
        return sanitizeText(raw, label, maxLength);
    }

    private static String sanitizeText(String raw, String label, int maxLength) {
        if (raw == null) {
            return "";
        }
        String cleaned = raw
                .replaceAll("[\\p{Cntrl}]", "")
                .replace("<", "")
                .replace(">", "")
                .trim();
        if (cleaned.length() > maxLength) {
            throw new IllegalArgumentException(label + " must be at most " + maxLength + " characters");
        }
        return cleaned;
    }

    private static String normalizeIssuedDate(String issuedDate) {
        if (issuedDate == null || issuedDate.isBlank()) {
            return "";
        }
        return requireYyyyMmDd(issuedDate.trim(), "Issue date");
    }

    private static String normalizeExpiryDate(String expiryDate) {
        if (expiryDate == null || expiryDate.isBlank()) {
            return null;
        }
        return requireYyyyMmDd(expiryDate.trim(), "Expiry date");
    }

    private static String requireYyyyMmDd(String value, String label) {
        try {
            LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException(label + " must be YYYY-MM-DD");
        }
        return value;
    }

    private static String normalizeCredentialUrl(String credentialUrl) {
        if (credentialUrl == null || credentialUrl.isBlank()) {
            return "";
        }
        String raw = credentialUrl.trim();
        if (raw.matches("(?i)^[a-z][a-z0-9+.-]*:.*") && !raw.matches("(?i)^https?://.*")) {
            throw new IllegalArgumentException("Credential URL must be a valid http(s) link");
        }
        String withProto = raw.matches("(?i)^https?://.*") ? raw : "https://" + raw;
        try {
            URI uri = URI.create(withProto);
            String scheme = uri.getScheme();
            if (scheme == null
                    || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))
                    || uri.getHost() == null
                    || uri.getHost().isBlank()) {
                throw new IllegalArgumentException("Credential URL must be a valid http(s) link");
            }
            return uri.toASCIIString();
        } catch (IllegalArgumentException ex) {
            if (ex.getMessage() != null && ex.getMessage().startsWith("Credential URL")) {
                throw ex;
            }
            throw new IllegalArgumentException("Credential URL must be a valid http(s) link");
        }
    }

    private static String escapeFilename(String name) {
        if (name == null || name.isBlank()) {
            return "certificate";
        }
        return name.replace("\"", "").replaceAll("[\\\\/]", "_");
    }
}
