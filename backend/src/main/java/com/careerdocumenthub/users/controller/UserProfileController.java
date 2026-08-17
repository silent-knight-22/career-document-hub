package com.careerdocumenthub.users.controller;

import com.careerdocumenthub.common.response.ApiResponse;
import com.careerdocumenthub.config.OpenApiConfig;
import com.careerdocumenthub.security.SecurityUtils;
import com.careerdocumenthub.security.UserPrincipal;
import com.careerdocumenthub.users.dto.UpdateProfileRequest;
import com.careerdocumenthub.users.dto.UserProfileResponse;
import com.careerdocumenthub.users.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authenticated profile endpoints. Operates only on the JWT subject — never on a client-supplied userId.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Retrieve and update the authenticated user's profile")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    @Operation(
            summary = "Get current profile",
            description = "Returns the authenticated user's profile. Identity comes from the JWT SecurityContext."
    )
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile() {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userProfileService.getProfile(principal)));
    }

    @PutMapping("/me")
    @Operation(
            summary = "Update current profile",
            description = "Updates allowed profile fields (name) for the authenticated user. "
                    + "Email, password, and id cannot be changed via this endpoint."
    )
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        UserProfileResponse updated = userProfileService.updateProfile(principal, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated"));
    }
}
