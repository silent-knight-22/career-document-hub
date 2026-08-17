package com.careerdocumenthub.security;

import com.careerdocumenthub.users.domain.User;
import com.careerdocumenthub.users.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Reads {@code Authorization: Bearer <jwt>}, validates the token, loads the user,
 * and populates {@link SecurityContextHolder}.
 * <p>
 * Approach: JWT is validated cryptographically first; then the user is loaded by
 * {@code sub} (user id) so deleted accounts cannot keep using old tokens.
 * Invalid/expired/missing tokens leave the context empty — protected routes then return 401.
 * </p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER_PREFIX.length()).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            tryAuthenticate(token, request);
        }

        filterChain.doFilter(request, response);
    }

    private void tryAuthenticate(String token, HttpServletRequest request) {
        try {
            if (!jwtService.isValid(token)) {
                return;
            }
            String userId = jwtService.extractUserId(token);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return;
            }
            User user = userOpt.get();
            UserPrincipal principal = new UserPrincipal(user.getId(), user.getEmail(), user.getName());
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ex) {
            log.debug("JWT authentication skipped: {}", ex.getClass().getSimpleName());
            SecurityContextHolder.clearContext();
        }
    }
}
