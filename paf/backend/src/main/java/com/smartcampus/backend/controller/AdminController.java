package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.CreateTechnicianRequest;
import com.smartcampus.backend.dto.StaffResponse;
import com.smartcampus.backend.dto.UpdateTechnicianRequest;
import com.smartcampus.backend.service.StaffManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminController {

    private final StaffManagementService staffManagementService;

    public AdminController(StaffManagementService staffManagementService) {
        this.staffManagementService = staffManagementService;
    }

    @PostMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> createTechnician(
        @Valid @RequestBody CreateTechnicianRequest request,
        Authentication authentication) {
        StaffResponse response = staffManagementService.createTechnician(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StaffResponse>> getAllTechnicians() {
        return ResponseEntity.ok(staffManagementService.getAllTechnicians());
    }

    @GetMapping("/technicians/check-username")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> checkUsernameAvailability(@RequestParam String username) {
        boolean available = staffManagementService.isUsernameAvailable(username);
        return ResponseEntity.ok(Map.of(
            "username", username,
            "available", available
        ));
    }

    @PutMapping("/technicians/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> updateTechnician(
        @PathVariable String id,
        @Valid @RequestBody UpdateTechnicianRequest request) {
        return ResponseEntity.ok(staffManagementService.updateTechnician(id, request));
    }

    @DeleteMapping("/technicians/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateTechnician(@PathVariable String id) {
        staffManagementService.deactivateTechnician(id);
        return ResponseEntity.noContent().build();
    }
}
