package com.careerdocumenthub.vault.repository;

import com.careerdocumenthub.vault.domain.VaultItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface VaultItemRepository extends MongoRepository<VaultItem, String> {

    List<VaultItem> findAllByUserIdOrderByCreatedAtDesc(String userId);

    Optional<VaultItem> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);

    boolean existsByIdAndUserId(String id, String userId);
}
