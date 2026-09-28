package com.careerdocumenthub.certificates.dto;

/**
 * Narrow PATCH for Expiry Tracker parity.
 * Null fields are left unchanged. {@code clearExpiryDate=true} clears expiry.
 */
public record UpdateCertificateRequest(
        String expiryDate,
        Boolean clearExpiryDate
) {
}
