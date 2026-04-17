package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ChangePasswordRequest;
import com.smartcampus.backend.dto.AuthenticationResponse;
import com.smartcampus.backend.dto.MessageResponse;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.PasswordService;
import com.smartcampus.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UserController {
    
    private final UserService userService;
    private final PasswordService passwordService;
    
    public UserController(UserService userService, PasswordService passwordService) {
        this.userService = userService;
        this.passwordService = passwordService;
    }
    
    @GetMapping("/me")
    public ResponseEntity<AuthenticationResponse.UserDto> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String principal = authentication.getName();
        
        User user = userService.getUserByPrincipal(principal);
        
        AuthenticationResponse.UserDto userDto = new AuthenticationResponse.UserDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt()
        );
        
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByPrincipal(authentication.getName());
        passwordService.changePassword(user.getId(), request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }
}
