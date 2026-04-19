---
name: incident-ticketing-builder
description: 'Build or update the Member 3 incident ticketing feature in Smart Campus Operations Hub. Use for creating/updating tickets, comments, attachments, status workflows, and role-based access. Covers React frontend, Spring Boot backend, MongoDB integration, and validation rules.'
argument-hint: 'Specify what to build or update (e.g., "create ticket form", "ticket service backend", "comment system")'
user-invocable: true
---

# Incident Ticketing Builder

Complete guide for implementing the Member 3 incident ticketing feature in the Smart Campus Operations Hub.

## When to Use

- Build new ticketing components (forms, views, lists)
- Create or update backend services, repositories, or DTOs
- Implement comment functionality (add, edit, delete)
- Handle file attachments (validation, upload)
- Add role-based access control (USER, ADMIN)
- Update ticket status workflows
- Validate frontend and backend requirements
- Test API integration

## Project Context

**Tech Stack:**
- Frontend: React + Tailwind CSS
- Backend: Spring Boot
- Database: MongoDB

**Folder Rules:**
- Frontend: All files must stay in `frontend/src/pages/Incident_tickting`
- Backend: Package root is `com.smartcampus.backend`
- Backend structure: `controller`, `dto`, `exception`, `model`, `repository`, `service`

**User Roles:** USER, ADMIN

**Ticket Workflow States:** OPEN → IN_PROGRESS → RESOLVED → CLOSED (or REJECTED)

## Core Features to Implement

1. **Create Ticket** - Form with title, description, priority, category
2. **View Ticket** - Single ticket detail with full information
3. **List Tickets** - Dashboard showing user's or all tickets
4. **Update Status** - Change ticket state through workflow
5. **Assign Ticket** - Admins assign to staff/technicians
6. **Attachments** - Max 3 images (jpg, jpeg, png), file validation
7. **Comments** - Add, edit, delete comments on tickets
8. **Role-Based Access** - Different views/actions for USER vs ADMIN

## Backend Implementation Guide

### 1. Models (com.smartcampus.backend.model)

**Ticket Model (MongoDB Document):**
```java
@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    @Id
    private String id;
    private String title;
    private String description;
    private TicketStatus status; // ENUM: OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    private TicketPriority priority; // ENUM: LOW, MEDIUM, HIGH, URGENT
    private String category; // e.g., "Facility", "IT", "Safety"
    private String createdBy; // User ID
    private String assignedTo; // Admin/Staff ID (optional)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private List<String> attachmentIds; // File references
    private List<TicketComment> comments; // Embedded comments
}
```

**TicketStatus Enum:**
```java
public enum TicketStatus {
    OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
}
```

**TicketPriority Enum:**
```java
public enum TicketPriority {
    LOW, MEDIUM, HIGH, URGENT
}
```

**TicketComment Model (Embedded in Ticket):**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {
    private String id;
    private String content;
    private String authorId; // User who added comment
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 2. DTOs (com.smartcampus.backend.dto)

**CreateTicketRequest:**
```java
@Data
public class CreateTicketRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be 5-200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be 10-2000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Category is required")
    private String category;
}
```

**UpdateTicketStatusRequest:**
```java
@Data
public class UpdateTicketStatusRequest {
    @NotNull(message = "Status is required")
    private TicketStatus status;
    private String notes; // Optional resolution notes
}
```

**TicketCommentRequest:**
```java
@Data
public class TicketCommentRequest {
    @NotBlank(message = "Comment content is required")
    @Size(min = 1, max = 1000, message = "Comment must be 1-1000 characters")
    private String content;
}
```

**TicketResponse (DTO):**
```java
@Data
public class TicketResponse {
    private String id;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private String category;
    private String createdBy;
    private String createdByName; // Resolved user name
    private String assignedTo;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private List<String> attachmentIds;
    private List<TicketCommentResponse> comments;
}
```

### 3. Repository (com.smartcampus.backend.repository)

```java
@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByCreatedBy(String userId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByCreatedByOrAssignedTo(String userId, String assignedToId);
    Page<Ticket> findAll(Pageable pageable);
}
```

### 4. Service Layer (com.smartcampus.backend.service)

**TicketService (Interface):**
```java
public interface TicketService {
    TicketResponse createTicket(CreateTicketRequest request, String userId);
    TicketResponse getTicket(String ticketId);
    List<TicketResponse> listUserTickets(String userId);
    List<TicketResponse> listAllTickets();
    TicketResponse updateTicketStatus(String ticketId, UpdateTicketStatusRequest request);
    TicketResponse assignTicket(String ticketId, String assignToUserId);
    TicketResponse addComment(String ticketId, TicketCommentRequest request, String userId);
    TicketResponse updateComment(String ticketId, String commentId, TicketCommentRequest request, String userId);
    TicketResponse deleteComment(String ticketId, String commentId, String userId);
    void deleteAttachment(String ticketId, String attachmentId);
}
```

**TicketServiceImpl Implementation:**
- Validate all inputs using validation annotations
- Check user authorization (only ADMIN can assign/update status)
- Update timestamps appropriately
- Handle file attachment references
- Throw custom exceptions for invalid operations

### 5. Controller (com.smartcampus.backend.controller)

```java
@RestController
@RequestMapping("/api/v1/tickets")
@Slf4j
public class TicketController {
    
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TicketResponse> createTicket(
        @Valid @RequestBody CreateTicketRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        // Implementation
    }
    
    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable String ticketId) {
        // Implementation
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
        @AuthenticationPrincipal UserDetails userDetails) {
        // Implementation
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        // Implementation
    }
    
    @PutMapping("/{ticketId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> updateTicketStatus(
        @PathVariable String ticketId,
        @Valid @RequestBody UpdateTicketStatusRequest request) {
        // Implementation
    }
    
    @PostMapping("/{ticketId}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignTicket(
        @PathVariable String ticketId,
        @RequestParam String assignToUserId) {
        // Implementation
    }
    
    @PostMapping("/{ticketId}/comments")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TicketResponse> addComment(
        @PathVariable String ticketId,
        @Valid @RequestBody TicketCommentRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        // Implementation
    }
    
    @PutMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TicketResponse> updateComment(
        @PathVariable String ticketId,
        @PathVariable String commentId,
        @Valid @RequestBody TicketCommentRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        // Implementation
    }
    
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteComment(
        @PathVariable String ticketId,
        @PathVariable String commentId,
        @AuthenticationPrincipal UserDetails userDetails) {
        // Implementation
    }
}
```

### 6. Exception Handling

Create custom exceptions in `com.smartcampus.backend.exception`:
- `TicketNotFoundException` - Ticket doesn't exist
- `TicketAccessDeniedException` - User not authorized to view/modify
- `TicketStatusTransitionException` - Invalid status transition
- `InvalidAttachmentException` - File validation failed
- `CommentNotFoundException` - Comment doesn't exist

## Frontend Implementation Guide

### 1. Folder Structure

```
frontend/src/pages/Incident_tickting/
├── components/
│   ├── TicketForm.jsx
│   ├── TicketCard.jsx
│   ├── TicketDetailView.jsx
│   ├── CommentSection.jsx
│   ├── AttachmentUpload.jsx
│   └── StatusBadge.jsx
├── services/
│   └── ticketService.js
├── hooks/
│   └── useTickets.js
├── Incident_ticketing_Page.jsx
├── Incident_ticketing_Page.css
└── README.md
```

### 2. Styling Rules

- Use Tailwind CSS utility classes
- Follow the existing green/white dashboard design
- Status colors: OPEN (blue), IN_PROGRESS (orange), RESOLVED (green), CLOSED (gray), REJECTED (red)
- Priority indicators: LOW (blue), MEDIUM (yellow), HIGH (orange), URGENT (red)
- Maintain consistent spacing and typography with existing components

### 3. TicketForm Component

**Requirements:**
- Title input (required, 5-200 chars)
- Description textarea (required, 10-2000 chars)
- Priority dropdown
- Category dropdown
- Attachment upload (max 3 files, jpg/jpeg/png)
- Submit and cancel buttons
- Form validation with error messages
- Loading state during submission

### 4. TicketCard Component

**Features:**
- Display ticket summary (title, status, priority)
- Show created date and assignee
- Click to view full details
- Color-coded status badges
- Quick status update button (ADMIN only)

### 5. TicketDetailView Component

**Sections:**
- Ticket metadata (title, description, status, priority, category)
- Created by and assigned to information
- Timeline/history of status changes
- Comment section (add, edit, delete)
- Attachments display
- Action buttons (edit, change status, assign) - ADMIN only

### 6. CommentSection Component

**Features:**
- Display all comments with author and timestamp
- Add new comment form
- Edit comment (author only)
- Delete comment (author or ADMIN)
- Optimistic UI updates
- Error handling for failed operations

### 7. AttachmentUpload Component

**Validation:**
- Accept only jpg, jpeg, png
- Max file size: 5MB per file
- Max 3 files total
- Show upload progress
- Display error messages for invalid files
- Show uploaded files with delete option

### 8. API Integration Service

**ticketService.js:**
```javascript
// Base API URL (configure from environment)
const API_BASE = process.env.REACT_APP_API_URL || '/api/v1/tickets'

export const ticketService = {
  // Tickets
  createTicket: (data) => POST(`${API_BASE}`, data),
  getTicket: (ticketId) => GET(`${API_BASE}/${ticketId}`),
  getMyTickets: () => GET(`${API_BASE}/my`),
  getAllTickets: () => GET(`${API_BASE}`),
  updateTicketStatus: (ticketId, status, notes) => 
    PUT(`${API_BASE}/${ticketId}/status`, { status, notes }),
  assignTicket: (ticketId, userId) => 
    POST(`${API_BASE}/${ticketId}/assign`, { assignToUserId: userId }),
  
  // Comments
  addComment: (ticketId, content) => 
    POST(`${API_BASE}/${ticketId}/comments`, { content }),
  updateComment: (ticketId, commentId, content) => 
    PUT(`${API_BASE}/${ticketId}/comments/${commentId}`, { content }),
  deleteComment: (ticketId, commentId) => 
    DELETE(`${API_BASE}/${ticketId}/comments/${commentId}`),
  
  // Attachments (multipart upload)
  uploadAttachments: (ticketId, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return POST(`${API_BASE}/${ticketId}/attachments`, formData, { 
      'Content-Type': 'multipart/form-data' 
    })
  }
}
```

## Validation Checklist

### Frontend Validation
- [ ] Required field checks before submit
- [ ] String length limits enforced
- [ ] File type validation (jpg, jpeg, png only)
- [ ] File size validation (5MB max per file)
- [ ] Max 3 files validation
- [ ] Show clear error messages
- [ ] Disable submit button while loading

### Backend Validation
- [ ] Use JSR-303 annotations (@NotNull, @NotBlank, @Size)
- [ ] Validate file types server-side
- [ ] Check file sizes on server
- [ ] Verify user authorization for actions
- [ ] Validate ticket status transitions
- [ ] Return proper HTTP status codes (400 for validation, 403 for auth, 404 for not found)
- [ ] Include detailed error messages in response

### API Response Format
```json
// Success
{
  "success": true,
  "data": { /* TicketResponse object */ }
}

// Error
{
  "success": false,
  "error": "Error message",
  "details": { /* Optional field-level errors */ }
}
```

## Testing Checklist

### Backend Testing
- [ ] Unit tests for TicketService
- [ ] Controller integration tests with MockMvc
- [ ] Test all CRUD operations
- [ ] Test authorization checks (USER vs ADMIN)
- [ ] Test status transition validation
- [ ] Test comment operations
- [ ] Test file attachment validation

### Frontend Testing
- [ ] Form validation logic
- [ ] API call integration
- [ ] Comment add/edit/delete flows
- [ ] File upload with validation
- [ ] Permission-based UI rendering (USER vs ADMIN)
- [ ] Error handling and display
- [ ] Loading states

### Manual Testing Scenarios
1. Create ticket as USER, verify email and view
2. List tickets - USER sees only own, ADMIN sees all
3. ADMIN updates status, USER receives notification
4. Add comment, edit as author, delete as ADMIN
5. Upload 3 images, try 4th (should fail)
6. Try invalid file type (should fail)
7. Create ticket without title (should show validation error)

## Key Implementation Notes

1. **Authorization**: Always verify user roles server-side, never trust frontend
2. **Naming**: Use clear names like `TicketController`, `TicketService` for GitHub visibility and viva explanations
3. **Error Messages**: Make them specific and actionable (not just "Error occurred")
4. **Timestamps**: Always track `createdAt` and `updatedAt` for audit trail
5. **Comments**: Store author info to display user names, not just IDs
6. **Attachments**: Validate on both frontend and backend; store file references in MongoDB
7. **Status Workflow**: Define allowed transitions (e.g., CLOSED cannot go back to OPEN)
8. **Pagination**: For large ticket lists, implement pagination on backend
9. **Soft Deletes**: Consider soft deletes instead of hard deletes for audit trail
10. **Logging**: Use `@Slf4j` annotation for consistent logging in services

## Example Workflow

1. User creates ticket via form
2. Frontend validates and calls `POST /api/v1/tickets`
3. Backend validates request, creates Ticket document
4. MongoDB generates ID, returns TicketResponse
5. Frontend receives success, redirects to ticket detail
6. User can add comments, upload attachments
7. ADMIN sees ticket in dashboard, can assign/update status
8. Comments trigger real-time updates via polling or WebSocket
9. Notification sent when status changes or assigned

## Related Project Files

- **AGENTS.md**: Project rules and tech stack documentation
- **Frontend existing pages**: Check `AdminDashboardPage.jsx`, `UserDashboardPage.jsx` for styling patterns
- **Backend existing services**: Review existing `*Service.java` for transaction handling patterns
