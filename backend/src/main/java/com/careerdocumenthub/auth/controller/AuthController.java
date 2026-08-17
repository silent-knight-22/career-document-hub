package com.careerdocumenthub.auth.controller;

import com.careerdocumenthub.auth.dto.AuthResponse;
import com.careerdocumenthub.auth.dto.LoginRequest;
import com.careerdocumenthub.auth.dto.RegisterRequest;
import com.careerdocumenthub.auth.dto.UserResponse;
import com.careerdocumenthub.auth.service.AuthService;
import com.careerdocumenthub.common.response.ApiResponse;
import com.careerdocumenthub.config.OpenApiConfig;
import com.careerdocumenthub.security.SecurityUtils;
import com.careerdocumenthub.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, current user, logout")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new account", description = "Creates a user and returns a JWT access token.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Registration successful"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates with email/password and returns a JWT access token.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(data, "Login successful"));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
    @Operation(summary = "Current user", description = "Returns the authenticated user from the JWT SecurityContext.")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        UserPrincipal principal = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(authService.me(principal)));
    }

    /**
     * Stateless JWT logout: the server does not revoke tokens in Phase 2.
     * Clients must discard the access token (e.g. clear sessionStorage).
     */
    @PostMapping("/logout")
    @SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
    @Operation(
            summary = "Logout",
            description = "Acknowledges logout. Access tokens remain valid until expiry; "
                    + "the client must discard the token. No server-side revocation in Phase 2."
    )
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Ensure the caller is authenticated; identity comes from SecurityContext.
        SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                "Logged out. Discard the access token on the client; it is not revoked server-side."));
    }
}
