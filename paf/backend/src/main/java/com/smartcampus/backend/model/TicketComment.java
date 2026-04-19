package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {
    private String id;
    private String userId;
    private String userName;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
