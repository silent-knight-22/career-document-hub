package com.careerdocumenthub.auth.service;

import com.careerdocumenthub.auth.dto.AuthResponse;
import com.careerdocumenthub.auth.dto.LoginRequest;
import com.careerdocumenthub.auth.dto.RegisterRequest;
import com.careerdocumenthub.auth.dto.UserResponse;
import com.careerdocumenthub.common.exception.DuplicateEmailException;
import com.careerdocumenthub.common.exception.InvalidCredentialsException;
import com.careerdocumenthub.common.exception.ResourceNotFoundException;
import com.careerdocumenthub.security.JwtService;
import com.careerdocumenthub.security.UserPrincipal;
import com.careerdocumenthub.users.domain.User;
import com.careerdocumenthub.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        String name = request.name() == null ? "" : request.name().trim();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException();
        }

        Instant now = Instant.now();
        User user = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .createdAt(now)
                .updatedAt(now)
                .build();

        try {
            user = userRepository.save(user);
        } catch (DuplicateKeyException ex) {
            throw new DuplicateEmailException();
        }

        String token = jwtService.generateToken(user.getId());
        return toAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user.getId());
        return toAuthResponse(user, token);
    }

    public UserResponse me(UserPrincipal principal) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    private static AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), token);
    }

    private static UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
