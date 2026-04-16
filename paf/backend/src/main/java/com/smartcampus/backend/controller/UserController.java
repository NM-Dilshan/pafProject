package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.AuthenticationResponse;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/me")
    public ResponseEntity<AuthenticationResponse.UserDto> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userService.getUserByEmail(email);
        
        AuthenticationResponse.UserDto userDto = new AuthenticationResponse.UserDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt()
        );
        
        return ResponseEntity.ok(userDto);
    }
}
