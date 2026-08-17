package com.careerdocumenthub.documents.service;

import com.careerdocumenthub.common.exception.ResourceNotFoundException;
import com.careerdocumenthub.documents.domain.SignableDocument;
import com.careerdocumenthub.documents.dto.DocumentResponse;
import com.careerdocumenthub.documents.repository.SignableDocumentRepository;
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

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    public static final long MAX_ORIGINAL_BYTES = 3L * 1024 * 1024;
    /** Client-merged signed PNG may exceed the original upload limit. */
    public static final long MAX_SIGNED_BYTES = 10L * 1024 * 1024;

    private final SignableDocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final UploadValidator uploadValidator;

    public DocumentResponse create(UserPrincipal principal, MultipartFile file) {
        ValidatedUpload upload = uploadValidator.validate(file, MAX_ORIGINAL_BYTES);
        String id = UUID.randomUUID().toString();
        String storageKey = principal.getUserId() + "/documents/" + id + "." + upload.extension();
        fileStorageService.store(storageKey, upload.content(), upload.contentType(), upload.originalFilename());

        Instant now = Instant.now();
        SignableDocument doc = SignableDocument.builder()
                .id(id)
                .userId(principal.getUserId())
                .name(upload.originalFilename())
                .type(upload.type())
                .size(upload.size())
                .signed(false)
                .createdAt(now)
                .updatedAt(now)
                .signedAt(null)
                .storageKey(storageKey)
                .contentType(upload.contentType())
                .build();

        return toResponse(documentRepository.save(doc));
    }

    public List<DocumentResponse> list(UserPrincipal principal) {
        return documentRepository.findAllByUserIdOrderByCreatedAtDesc(principal.getUserId())
                .stream()
                .map(DocumentService::toResponse)
                .toList();
    }

    public DocumentResponse get(UserPrincipal principal, String id) {
        return toResponse(requireOwned(principal.getUserId(), id));
    }

    public void delete(UserPrincipal principal, String id) {
        SignableDocument doc = requireOwned(principal.getUserId(), id);
        fileStorageService.deleteQuietly(doc.getStorageKey());
        fileStorageService.deleteQuietly(doc.getSignedStorageKey());
        documentRepository.deleteByIdAndUserId(id, principal.getUserId());
    }

    public DocumentResponse sign(UserPrincipal principal, String id, MultipartFile signedFile) {
        SignableDocument doc = requireOwned(principal.getUserId(), id);
        ValidatedUpload upload = uploadValidator.validate(signedFile, MAX_SIGNED_BYTES);

        String signedKey = principal.getUserId() + "/documents/" + id + "-signed." + upload.extension();
        // Replace previous signed artifact if re-signing
        fileStorageService.deleteQuietly(doc.getSignedStorageKey());
        fileStorageService.store(signedKey, upload.content(), upload.contentType(), upload.originalFilename());

        Instant now = Instant.now();
        doc.setSigned(true);
        doc.setSignedAt(now);
        doc.setUpdatedAt(now);
        doc.setSignedStorageKey(signedKey);
        doc.setSignedContentType(upload.contentType());
        doc.setSignedSize(upload.size());

        return toResponse(documentRepository.save(doc));
    }

    /**
     * @param variant {@code original} (default) or {@code signed}
     */
    public ResponseEntity<InputStreamResource> download(UserPrincipal principal, String id, String variant) {
        SignableDocument doc = requireOwned(principal.getUserId(), id);
        boolean wantSigned = variant != null && variant.equalsIgnoreCase("signed");

        String key;
        String contentType;
        long length;
        String filename = doc.getName();

        if (wantSigned) {
            if (!doc.isSigned() || doc.getSignedStorageKey() == null) {
                throw new ResourceNotFoundException("Signed file not found");
            }
            key = doc.getSignedStorageKey();
            contentType = doc.getSignedContentType() != null ? doc.getSignedContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
            length = doc.getSignedSize() != null ? doc.getSignedSize() : -1;
            filename = prependSigned(filename);
        } else {
            key = doc.getStorageKey();
            contentType = doc.getContentType();
            length = doc.getSize();
        }

        if (!fileStorageService.exists(key)) {
            throw new ResourceNotFoundException("File not found");
        }

        InputStreamResource body = new InputStreamResource(fileStorageService.open(key));
        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + escapeFilename(filename) + "\"")
                .contentType(MediaType.parseMediaType(contentType));
        if (length >= 0) {
            builder.contentLength(length);
        }
        return builder.body(body);
    }

    private SignableDocument requireOwned(String userId, String id) {
        return documentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    private static DocumentResponse toResponse(SignableDocument doc) {
        return new DocumentResponse(
                doc.getId(),
                doc.getName(),
                doc.getType(),
                doc.getSize(),
                doc.isSigned(),
                doc.getCreatedAt(),
                doc.getSignedAt()
        );
    }

    private static String prependSigned(String name) {
        if (name == null || name.isBlank()) {
            return "signed_document";
        }
        String lower = name.toLowerCase(Locale.ROOT);
        if (lower.startsWith("signed_")) {
            return name;
        }
        return "signed_" + name;
    }

    private static String escapeFilename(String name) {
        return name.replace("\"", "");
    }
}
