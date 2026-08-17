package com.careerdocumenthub.users.service;

import com.careerdocumenthub.common.exception.ResourceNotFoundException;
import com.careerdocumenthub.security.UserPrincipal;
import com.careerdocumenthub.users.domain.User;
import com.careerdocumenthub.users.dto.UpdateProfileRequest;
import com.careerdocumenthub.users.dto.UserProfileResponse;
import com.careerdocumenthub.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Authenticated user's own profile. Identity always comes from {@link UserPrincipal}.
 */
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    public UserProfileResponse getProfile(UserPrincipal principal) {
        return toResponse(requireUser(principal.getUserId()));
    }

    public UserProfileResponse updateProfile(UserPrincipal principal, UpdateProfileRequest request) {
        User user = requireUser(principal.getUserId());
        user.setName(request.name());
        user.setUpdatedAt(Instant.now());
        return toResponse(userRepository.save(user));
    }

    private User requireUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private static UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
