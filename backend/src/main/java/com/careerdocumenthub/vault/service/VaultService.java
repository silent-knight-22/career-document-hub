package com.careerdocumenthub.vault.service;

import com.careerdocumenthub.common.exception.ResourceNotFoundException;
import com.careerdocumenthub.security.UserPrincipal;
import com.careerdocumenthub.storage.FileStorageService;
import com.careerdocumenthub.storage.UploadValidator;
import com.careerdocumenthub.storage.ValidatedUpload;
import com.careerdocumenthub.vault.domain.VaultCategory;
import com.careerdocumenthub.vault.domain.VaultItem;
import com.careerdocumenthub.vault.dto.UpdateVaultItemRequest;
import com.careerdocumenthub.vault.dto.VaultItemResponse;
import com.careerdocumenthub.vault.repository.VaultItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VaultService {

    public static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final int MAX_TAGS = 20;

    private final VaultItemRepository vaultItemRepository;
    private final FileStorageService fileStorageService;
    private final UploadValidator uploadValidator;

    public VaultItemResponse create(
            UserPrincipal principal,
            MultipartFile file,
            String category,
            String tagsCsv,
            String note,
            String expiryDate) {

        ValidatedUpload upload = uploadValidator.validate(file, MAX_BYTES);
        VaultCategory cat = VaultCategory.from(category);
        List<String> tags = parseTags(tagsCsv);
        String cleanNote = sanitizeNote(note);
        String cleanExpiry = normalizeExpiry(expiryDate);

        String id = UUID.randomUUID().toString();
        String storageKey = principal.getUserId() + "/vault/" + id + "." + upload.extension();
        fileStorageService.store(storageKey, upload.content(), upload.contentType(), upload.originalFilename());

        Instant now = Instant.now();
        VaultItem item = VaultItem.builder()
                .id(id)
                .userId(principal.getUserId())
                .name(upload.originalFilename())
                .type(upload.type())
                .size(upload.size())
                .category(cat.name())
                .tags(tags)
                .note(cleanNote)
                .expiryDate(cleanExpiry)
                .starred(false)
                .storageKey(storageKey)
                .contentType(upload.contentType())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(vaultItemRepository.save(item));
    }

    public List<VaultItemResponse> list(UserPrincipal principal) {
        return vaultItemRepository.findAllByUserIdOrderByCreatedAtDesc(principal.getUserId())
                .stream()
                .map(VaultService::toResponse)
                .toList();
    }

    public VaultItemResponse get(UserPrincipal principal, String id) {
        return toResponse(requireOwned(principal.getUserId(), id));
    }

    public VaultItemResponse update(UserPrincipal principal, String id, UpdateVaultItemRequest request) {
        VaultItem item = requireOwned(principal.getUserId(), id);

        if (request.note() != null) {
            item.setNote(sanitizeNote(request.note()));
        }
        if (request.starred() != null) {
            item.setStarred(request.starred());
        }
        if (Boolean.TRUE.equals(request.clearExpiryDate())) {
            item.setExpiryDate(null);
        } else if (request.expiryDate() != null) {
            item.setExpiryDate(normalizeExpiry(request.expiryDate()));
        }
        if (request.category() != null) {
            item.setCategory(VaultCategory.from(request.category()).name());
        }
        if (request.tags() != null) {
            item.setTags(sanitizeTags(request.tags()));
        }

        item.setUpdatedAt(Instant.now());
        return toResponse(vaultItemRepository.save(item));
    }

    public void delete(UserPrincipal principal, String id) {
        VaultItem item = requireOwned(principal.getUserId(), id);
        fileStorageService.deleteQuietly(item.getStorageKey());
        vaultItemRepository.deleteByIdAndUserId(id, principal.getUserId());
    }

    public ResponseEntity<InputStreamResource> download(UserPrincipal principal, String id) {
        VaultItem item = requireOwned(principal.getUserId(), id);
        if (!fileStorageService.exists(item.getStorageKey())) {
            throw new ResourceNotFoundException("File not found");
        }
        InputStreamResource body = new InputStreamResource(fileStorageService.open(item.getStorageKey()));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + escapeFilename(item.getName()) + "\"")
                .contentType(MediaType.parseMediaType(item.getContentType()))
                .contentLength(item.getSize())
                .body(body);
    }

    private VaultItem requireOwned(String userId, String id) {
        return vaultItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vault item not found"));
    }

    private static VaultItemResponse toResponse(VaultItem item) {
        return new VaultItemResponse(
                item.getId(),
                item.getName(),
                item.getType(),
                item.getSize(),
                item.getCategory(),
                item.getTags() == null ? List.of() : List.copyOf(item.getTags()),
                item.getNote() == null ? "" : item.getNote(),
                item.getExpiryDate(),
                item.isStarred(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    private static List<String> parseTags(String tagsCsv) {
        if (tagsCsv == null || tagsCsv.isBlank()) {
            return new ArrayList<>();
        }
        List<String> tags = new ArrayList<>();
        for (String part : tagsCsv.split(",")) {
            String tag = sanitizeTag(part);
            if (!tag.isEmpty()) {
                tags.add(tag);
            }
            if (tags.size() >= MAX_TAGS) {
                break;
            }
        }
        return tags;
    }

    private static List<String> sanitizeTags(List<String> raw) {
        List<String> tags = new ArrayList<>();
        for (String part : raw) {
            String tag = sanitizeTag(part);
            if (!tag.isEmpty()) {
                tags.add(tag);
            }
            if (tags.size() >= MAX_TAGS) {
                break;
            }
        }
        return tags;
    }

    private static String sanitizeTag(String raw) {
        if (raw == null) {
            return "";
        }
        String tag = raw.trim();
        if (tag.length() > 40) {
            throw new IllegalArgumentException("Each tag must be at most 40 characters");
        }
        return tag;
    }

    private static String sanitizeNote(String note) {
        if (note == null) {
            return "";
        }
        String cleaned = note.trim();
        if (cleaned.length() > 500) {
            throw new IllegalArgumentException("Note must be at most 500 characters");
        }
        return cleaned;
    }

    private static String normalizeExpiry(String expiryDate) {
        if (expiryDate == null || expiryDate.isBlank()) {
            return null;
        }
        String value = expiryDate.trim();
        try {
            LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Expiry date must be YYYY-MM-DD");
        }
        return value;
    }

    private static String escapeFilename(String name) {
        return name.replace("\"", "");
    }
}
