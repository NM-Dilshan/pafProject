package com.smartcampus.backend.filter;

import com.smartcampus.backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final TokenService tokenService;
    
    public JwtAuthenticationFilter(TokenService tokenService) {
        this.tokenService = tokenService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            
            try {
                // Validate token
                tokenService.validateToken(token);
                
                // Extract email from token and set as authentication principal
                String email = tokenService.extractEmail(token);
                
                // Create authentication object
                Authentication authentication = new JwtAuthenticationToken(email, null);
                
                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                // Token is invalid or expired, continue without authentication
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
