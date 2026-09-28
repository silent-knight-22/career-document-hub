package com.careerdocumenthub.certificates.repository;

import com.careerdocumenthub.certificates.domain.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends MongoRepository<Certificate, String> {

    List<Certificate> findAllByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Certificate> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);
}
