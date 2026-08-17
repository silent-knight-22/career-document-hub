package com.careerdocumenthub.documents.repository;

import com.careerdocumenthub.documents.domain.SignableDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SignableDocumentRepository extends MongoRepository<SignableDocument, String> {

    List<SignableDocument> findAllByUserIdOrderByCreatedAtDesc(String userId);

    Optional<SignableDocument> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);
}
