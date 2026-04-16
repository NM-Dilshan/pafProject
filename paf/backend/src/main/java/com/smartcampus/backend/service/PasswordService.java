package com.smartcampus.backend.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder.BCryptVersion;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    
    private final BCryptPasswordEncoder passwordEncoder;
    
    public PasswordService() {
        // BCrypt with cost factor 12
        this.passwordEncoder = new BCryptPasswordEncoder(BCryptVersion.$2A, 12);
    }
    
    public String hashPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        return passwordEncoder.encode(password);
    }
    
    public boolean verifyPassword(String password, String passwordHash) {
        if (password == null || passwordHash == null) {
            return false;
        }
        return passwordEncoder.matches(password, passwordHash);
    }
}
