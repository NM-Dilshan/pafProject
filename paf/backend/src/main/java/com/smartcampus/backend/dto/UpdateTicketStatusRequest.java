package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketStatusRequest {
    
    @NotNull(message = "Status is required")
    @Pattern(regexp = "OPEN|IN_PROGRESS|RESOLVED|CLOSED|REJECTED", 
            message = "Invalid status value")
    private String status;

    private String resolutionNotes;
    
    private String rejectionReason;
}
