package com.smartcampus.backend.config;

import com.smartcampus.backend.filter.JwtAuthenticationFilter;
import com.smartcampus.backend.service.OAuth2Service;
import com.smartcampus.backend.service.TokenService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2Service oAuth2Service;
    private final TokenService tokenService;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          OAuth2Service oAuth2Service,
                          TokenService tokenService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2Service = oAuth2Service;
        this.tokenService = tokenService;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/api/user/me").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler((request, response, authentication) -> {
                    org.springframework.security.oauth2.core.user.OAuth2User oAuth2User = 
                        (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();
                    
                    String email = oAuth2User.getAttribute("email");
                    String name = oAuth2User.getAttribute("name");
                    
                    com.smartcampus.backend.model.User user = oAuth2Service.findOrCreateUserFromOAuth(email, name);
                    String token = tokenService.generateToken(user);
                    
                    String redirectUrl = "http://localhost:5173/auth/callback?token=" + token + 
                        "&user=" + java.net.URLEncoder.encode(
                            String.format("{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}",
                                user.getId(), user.getName(), user.getEmail(), user.getRole()), 
                            "UTF-8");
                    
                    response.sendRedirect(redirectUrl);
                })
                .failureHandler((request, response, exception) -> {
                    String errorMessage = exception.getMessage();
                    response.sendRedirect("http://localhost:5173/login?error=" + 
                        java.net.URLEncoder.encode(errorMessage, "UTF-8"));
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
