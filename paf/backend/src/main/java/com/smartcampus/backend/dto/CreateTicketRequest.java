package com.smartcampus.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 15, max = 1000, message = "Description must be between 15 and 1000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Category is required")
    private String category;

    private String resourceId;
    
    private String location;

    @NotBlank(message = "Preferred contact is required")
    @Pattern(
        regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$|^(\\+?1)?(\\d{3})?[-\\.\\s]?\\d{3}[-\\.\\s]?\\d{4}$",
        message = "Please provide a valid email or phone number"
    )
    private String preferredContact;
}
