package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.TicketStatus;
import com.smartcampus.backend.model.TicketPriority;
import com.smartcampus.backend.model.EscalationLevel;
import com.smartcampus.backend.model.TicketComment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private String id;
    private String title;
    private String resourceId;
    private String location;
    private String category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String reportedBy;
    private String reportedByName;
    private String assignedTo;
    private String assignedToName;
    private String preferredContact;
    private String resolutionNotes;
    private String rejectionReason;
    private List<String> attachmentUrls;
    private List<TicketComment> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    
    // SLA-related fields for Member 3 novelty feature
    private LocalDateTime slaDeadline;
    private EscalationLevel escalationLevel;
    private Boolean isOverdue;
    private Boolean resolvedWithinSla;
}
