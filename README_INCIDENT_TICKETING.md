# Incident Ticketing Feature - Implementation Guide

## Overview

This document describes the complete implementation of the Member 3 Incident Ticketing feature for the Smart Campus Operations Hub. The feature allows campus users to report incidents and administrators to manage and resolve them.

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Spring Boot + MongoDB
- **Validation**: JSR-303 (Backend) + Custom validation (Frontend)
- **Authentication**: Bearer Token (JWT)

## File Structure

### Backend Files

```
src/main/java/com/smartcampus/backend/
├── model/
│   ├── Ticket.java - Main ticket document
│   ├── TicketComment.java - Comment model (embedded)
│   ├── TicketStatus.java - Enum (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED)
│   └── TicketPriority.java - Enum (LOW, MEDIUM, HIGH, URGENT)
│
├── dto/
│   ├── CreateTicketRequest.java - Create ticket validation
│   ├── UpdateTicketStatusRequest.java - Status update validation
│   ├── TicketCommentRequest.java - Comment validation
│   ├── TicketCommentResponse.java - Comment response
│   ├── TicketResponse.java - Complete ticket response
│   └── TicketListResponse.java - Ticket list item
│
├── repository/
│   ├── TicketRepository.java - MongoDB queries
│   └── (TicketCommentRepository optional - using embedded docs)
│
├── service/
│   ├── TicketService.java - Service interface
│   └── TicketServiceImpl.java - Implementation with validation
│
├── controller/
│   └── TicketController.java - REST API endpoints
│
└── exception/
    ├── TicketNotFoundException.java
    ├── CommentNotFoundException.java
    ├── CommentAccessDeniedException.java
    ├── InvalidStatusTransitionException.java
    ├── InvalidAttachmentException.java
    └── (Update GlobalExceptionHandler.java with new handlers)
```

### Frontend Files

```
frontend/src/pages/Incident_tickting/
├── pages/
│   ├── TicketListPage.jsx - List view with filters
│   ├── CreateTicketPage.jsx - Create ticket page
│   ├── CreateTicketForm.jsx - Form component
│   ├── TicketDetailsPage.jsx - Detail view with comments
│   └── IncidentTicketingPage.jsx - Main orchestrator
│
├── components/
│   ├── TicketCard.jsx - Card view
│   ├── TicketTable.jsx - Table view
│   ├── StatusBadge.jsx - Status badge component
│   ├── PriorityBadge.jsx - Priority badge component
│   ├── AttachmentUploader.jsx - File upload component
│   ├── AttachmentPreviewList.jsx - Image gallery
│   ├── CommentThread.jsx - Comments section
│   ├── CommentForm.jsx - Add comment form
│   ├── EditCommentForm.jsx - Edit comment form
│   ├── ErrorAlert.jsx - Error alert components
│   └── LoadingSpinner.jsx - Loading spinner
│
├── services/
│   └── ticketApiService.js - API integration
│
├── utils/
│   ├── validationUtils.js - Validation rules & functions
│   └── formatUtils.js - Date/string formatting
│
└── index.js - Module exports
```

## Field Specifications

### Ticket Fields

| Field | Type | Rules |
|-------|------|-------|
| id | String | MongoDB ID |
| title | String | Min 5, Max 100 chars, Required |
| description | String | Min 15, Max 1000 chars, Required |
| category | String | Required |
| resourceId | String | Optional |
| location | String | Optional (either resourceId or location required) |
| priority | Enum | LOW, MEDIUM, HIGH, URGENT - Required |
| status | Enum | OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED |
| reportedBy | String | User ID - Auto-set on create |
| reportedByName | String | User name - Auto-resolved |
| assignedTo | String | User ID - Admin only |
| assignedToName | String | User name - Admin only |
| preferredContact | String | Email or phone - Required |
| resolutionNotes | String | Required when RESOLVED |
| rejectionReason | String | Required when REJECTED |
| attachmentUrls | List<String> | Max 3 files, JPG/JPEG/PNG only, 5MB per file |
| comments | List<TicketComment> | Embedded comments |
| createdAt | LocalDateTime | Auto-set |
| updatedAt | LocalDateTime | Auto-updated |
| resolvedAt | LocalDateTime | Set when RESOLVED or CLOSED |

### Comment Fields

| Field | Type | Rules |
|-------|------|-------|
| id | String | UUID |
| userId | String | User ID - Auto-set |
| userName | String | User name - Auto-resolved |
| message | String | Min 2, Max 500 chars, Required |
| createdAt | LocalDateTime | Auto-set |
| updatedAt | LocalDateTime | Auto-updated |

## Status Transitions

```
OPEN
├─→ IN_PROGRESS
└─→ REJECTED

IN_PROGRESS
├─→ RESOLVED
└─→ REJECTED

RESOLVED
└─→ CLOSED

CLOSED (No transitions)

REJECTED (No transitions)
```

## API Endpoints

### Ticket Management

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/tickets` | USER, ADMIN | Create ticket |
| GET | `/api/v1/tickets/{id}` | USER, ADMIN | Get ticket |
| GET | `/api/v1/tickets/my/tickets` | USER, ADMIN | Get user's tickets |
| GET | `/api/v1/tickets` | ADMIN | Get all tickets |
| PUT | `/api/v1/tickets/{id}/status` | ADMIN | Update status |
| POST | `/api/v1/tickets/{id}/assign` | ADMIN | Assign ticket |
| POST | `/api/v1/tickets/{id}/attachments` | USER, ADMIN | Upload attachments |

### Comment Management

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/tickets/{id}/comments` | USER, ADMIN | Add comment |
| PUT | `/api/v1/tickets/{id}/comments/{commentId}` | USER, ADMIN | Edit comment (owner/admin) |
| DELETE | `/api/v1/tickets/{id}/comments/{commentId}` | USER, ADMIN | Delete comment (owner/admin) |

## Validation Rules

### Frontend & Backend Synchronized

**Ticket Creation:**
- title: 5-100 chars
- description: 15-1000 chars
- category: Required
- priority: One of [LOW, MEDIUM, HIGH, URGENT]
- resourceId or location: At least one required
- preferredContact: Valid email or phone

**Comments:**
- message: 2-500 chars
- Not empty

**Attachments:**
- Max 3 files
- Formats: JPG, JPEG, PNG only
- Max size: 5MB per file
- No empty files

### Status Updates (Backend)

- Only valid transitions allowed
- RESOLVED requires resolutionNotes
- REJECTED requires rejectionReason
- Admin only

## Authentication

- Bearer Token in Authorization header
- Token stored in localStorage
- User ID extracted from SecurityContextHolder
- Role-based access via @PreAuthorize

## Error Handling

### Exception Flow

```
Controller receives request
    ↓
Validation (JSR-303)
    ↓
Service layer (business logic)
    ↓
Custom exceptions thrown
    ↓
GlobalExceptionHandler catches
    ↓
Returns ErrorResponse (status, message, details)
```

### HTTP Status Codes

- 201: Created (POST)
- 200: OK (GET, PUT)
- 204: No Content (DELETE)
- 400: Bad Request (validation)
- 403: Forbidden (authorization)
- 404: Not Found (resource)
- 500: Internal Server Error

## Setup Instructions

### Backend Setup

1. **Add Dependencies** (pom.xml)
   - Spring Data MongoDB
   - Spring Security
   - Lombok
   - Jakarta Validation

2. **Create Model Classes**
   - Ticket, TicketComment, enums
   - Includes @Document for MongoDB

3. **Create DTOs**
   - Request/Response objects
   - Validation annotations

4. **Create Repository**
   - TicketRepository extends MongoRepository
   - Custom query methods

5. **Create Service**
   - TicketService interface
   - TicketServiceImpl implementation

6. **Create Controller**
   - @RestController with @RequestMapping
   - @PreAuthorize for role-based access
   - Proper HTTP methods and status codes

7. **Create Exceptions**
   - Custom RuntimeException classes
   - Update GlobalExceptionHandler

8. **Add Upload Folder** (gitignored)
   - `src/main/resources/uploads/`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install axios
   ```

2. **Add Route** (App.jsx or router config)
   ```jsx
   import IncidentTicketingPage from './pages/Incident_tickting/IncidentTicketingPage'
   
   <Route path="/tickets" element={<IncidentTicketingPage />} />
   <Route path="/admin/tickets" element={<IncidentTicketingPage />} />
   ```

3. **Add Navigation Links**
   - Link to `/tickets` for users
   - Link to `/admin/tickets` for admins

4. **Environment Variables** (if needed)
   ```
   REACT_APP_API_URL=http://localhost:8080/api/v1/tickets
   ```

## Testing

### Backend Testing

```bash
# Compile
cd backend
mvn clean compile

# Run
mvn spring-boot:run

# Test API
curl -X POST http://localhost:8080/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test", "description":"Test ticket...", ...}'
```

### Frontend Testing

1. Create a ticket - Verify form validation
2. List tickets - Verify filtering
3. View details - Verify layout
4. Add comment - Verify validation
5. Edit comment - Verify authorization
6. Delete comment - Verify confirmation
7. Update status (admin) - Verify transitions
8. Responsive design - Test mobile/tablet

## Common Issues & Solutions

### Issue: Token not passed in requests
**Solution:** Check localStorage key matches what's used in AuthContext

### Issue: CORS errors
**Solution:** Verify @CrossOrigin on controller

### Issue: Comments not appearing
**Solution:** Refresh ticket list after adding comment

### Issue: Status transitions not working
**Solution:** Check VALID_TRANSITIONS map and user role

### Issue: File upload failing
**Solution:** Verify file size, format, and MAX_FILES limit

## Future Enhancements

- Real file storage (AWS S3, Azure Blob)
- Ticket templates
- SLA tracking
- Automated notifications
- Bulk operations
- Advanced filtering
- Export to PDF/Excel
- Ticket history/audit log
- Custom fields

## Viva-Friendly Notes

- Clean, readable code with clear separation of concerns
- Validation synchronized frontend/backend
- Role-based access control enforced
- Error messages are user-friendly
- Component-based architecture (reusable)
- Service layer for business logic
- DTO pattern for API consistency
- MongoDB embedded documents for scalability

---

**Built for**: Smart Campus Operations Hub
**Feature**: Member 3 - Incident Ticketing
**Date**: April 2026
