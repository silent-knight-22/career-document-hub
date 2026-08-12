package com.careerdocumenthub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * Career Document Hub backend entry point.
 * <p>
 * {@link UserDetailsServiceAutoConfiguration} is excluded so Spring Boot does not
 * generate a default user/password. Phase 1 has no username/password auth; JWT arrives in Phase 2.
 * </p>
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

}
