---
name: ticketing-debug-fixer
description: 'Fix errors in the incident ticketing feature without affecting other modules. Use for debugging import errors, API mismatches, DTO issues, validation bugs, comment ownership, file upload errors, and status transitions. Minimal surgical fixes only.'
argument-hint: 'Describe the error (e.g., "comment edit not working", "file upload 400 error", "route not found")'
user-invocable: true
---

# Ticketing Debug Fixer

Surgical debugging for the incident ticketing feature—fix only what's broken, preserve everything else.

## When to Use

- **Import errors**: Module not found, circular imports
- **Route issues**: 404 on endpoints, wrong HTTP method
- **API mismatch**: Frontend calls wrong endpoint, DTO field mismatch
- **Validation bugs**: Frontend validation not matching backend, wrong error messages
- **Comment bugs**: Can't edit/delete, wrong author check, missing permissions
- **File upload**: File validation failing, wrong MIME type check, size limits incorrect
- **Status transition**: Invalid state change, workflow blocked, status not updating
- **Authorization**: User can see/do things they shouldn't, role checks missing

## Philosophy

1. **Identify Root Cause First**: Don't just patch symptoms
2. **Minimal Change**: Fix only the broken part, never refactor
3. **Preserve Design**: Keep file structure, naming, and patterns as-is
4. **Single Responsibility**: Fix one thing per change
5. **Test Before/After**: Show how to verify the fix works

---

## Common Issues & Fixes

### Issue 1: API Route Not Found (404)

**Problem**: Frontend calls `POST /api/v1/tickets` but gets 404

**Root Cause**:
- Route not defined in controller
- Wrong HTTP method (GET instead of POST)
- Request path mismatch (frontend sends `/api/tickets` but backend expects `/api/v1/tickets`)
- Controller not registered as REST controller

**File Paths**:
- `backend/src/main/java/com/smartcampus/backend/controller/TicketController.java`

**Fix - Add Missing Route**:
```java
// BEFORE: Missing endpoint
@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        // ...
    }
}

// AFTER: Add POST endpoint
@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {
    @Autowired
    private TicketService ticketService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TicketResponse> createTicket(
        @Valid @RequestBody CreateTicketRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse response = ticketService.createTicket(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        // ...
    }
}
```

**How to Test**:
```bash
# Should return 201 Created, not 404
curl -X POST http://localhost:8080/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Ticket",
    "description": "This is a test description",
    "priority": "HIGH",
    "category": "IT",
    "resource": "Lab 101",
    "preferredContact": "test@example.com"
  }'
```

---

### Issue 2: DTO Field Mismatch

**Problem**: Frontend sends `attachment` field but backend DTO expects `attachments` (plural)

**Root Cause**:
- DTO field name doesn't match frontend request payload
- Typo in field name
- Serialization mismatch

**File Paths**:
- `backend/src/main/java/com/smartcampus/backend/dto/CreateTicketRequest.java`
- `frontend/src/pages/Incident_tickting/components/TicketForm.jsx`

**Fix - Match Field Names**:
```java
// BEFORE: Wrong field name
@Data
public class CreateTicketRequest {
    private String title;
    private String description;
    private String attachment; // WRONG: singular
}

// AFTER: Correct field name
@Data
public class CreateTicketRequest {
    private String title;
    private String description;
    private List<String> attachmentIds; // CORRECT: matches frontend
}
```

**Frontend Must Send**:
```javascript
// BEFORE: Wrong field
const formData = {
  title: "Issue",
  description: "Something broken",
  attachment: "file.jpg" // WRONG
}

// AFTER: Correct field
const formData = {
  title: "Issue",
  description: "Something broken",
  attachmentIds: ["file1.jpg", "file2.jpg"] // CORRECT
}
```

**How to Test**:
- Open browser DevTools → Network tab
- Create a ticket
- Check request payload matches DTO field names
- Should see 200/201, not 400 validation error

---

### Issue 3: Comment Edit Authorization Bug

**Problem**: User can edit someone else's comment (security bug)

**Root Cause**:
- Missing author check before allowing edit
- Service doesn't verify `userId` matches comment author
- Authorization only checked at controller, not at service level

**File Paths**:
- `backend/src/main/java/com/smartcampus/backend/service/TicketServiceImpl.java`

**Fix - Add Author Check**:
```java
// BEFORE: No author check
@Override
public TicketResponse updateComment(
        String ticketId, 
        String commentId, 
        TicketCommentRequest request, 
        String userId) {
    
    Ticket ticket = ticketRepository.findById(ticketId)
        .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

    TicketComment comment = ticket.getComments().stream()
        .filter(c -> c.getId().equals(commentId))
        .findFirst()
        .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

    // MISSING: Author check!
    comment.setContent(request.getContent());
    comment.setUpdatedAt(LocalDateTime.now());
    return convertToResponse(ticketRepository.save(ticket));
}

// AFTER: Verify author
@Override
public TicketResponse updateComment(
        String ticketId, 
        String commentId, 
        TicketCommentRequest request, 
        String userId) {
    
    Ticket ticket = ticketRepository.findById(ticketId)
        .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

    TicketComment comment = ticket.getComments().stream()
        .filter(c -> c.getId().equals(commentId))
        .findFirst()
        .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

    // FIX: Check author before allowing edit
    if (!comment.getAuthorId().equals(userId)) {
        throw new CommentAccessDeniedException(
            "You can only edit your own comments"
        );
    }

    comment.setContent(request.getContent());
    comment.setUpdatedAt(LocalDateTime.now());
    ticket.setUpdatedAt(LocalDateTime.now());
    return convertToResponse(ticketRepository.save(ticket));
}
```

**How to Test**:
1. Log in as User A
2. Create ticket and add comment "My comment"
3. Log in as User B (different account)
4. Try to edit User A's comment → Should get 403 Forbidden
5. Log in as User A again
6. Edit your own comment → Should succeed with 200 OK

---

### Issue 4: File Validation Mismatch

**Problem**: Frontend accepts .gif files but backend rejects them with 400 error

**Root Cause**:
- Frontend `accept` attribute includes `image/gif`
- Backend only allows `image/jpeg`, `image/png`
- Different allowed types on each side

**File Paths**:
- `frontend/src/pages/Incident_tickting/components/TicketForm.jsx`
- `backend/src/main/java/com/smartcampus/backend/service/TicketServiceImpl.java`

**Fix - Match Allowed Types**:
```javascript
// BEFORE: Frontend allows too much
<input
  type="file"
  multiple
  accept="image/*"  // WRONG: allows all image types
  onChange={handleFileChange}
/>

// AFTER: Frontend restricted to backend allowed types
<input
  type="file"
  multiple
  accept=".jpg,.jpeg,.png"  // CORRECT: only jpg/png
  onChange={handleFileChange}
/>
```

```java
// BEFORE: Backend allows inconsistent set
private static final List<String> ALLOWED_IMAGE_TYPES = 
    Arrays.asList("image/jpeg", "image/png", "image/jpg", "image/gif"); // WRONG

// AFTER: Backend matches frontend
private static final List<String> ALLOWED_IMAGE_TYPES = 
    Arrays.asList("image/jpeg", "image/png", "image/jpg"); // CORRECT

// Also check extension validation
private static final List<String> ALLOWED_EXTENSIONS = 
    Arrays.asList(".jpg", ".jpeg", ".png"); // CORRECT
```

**How to Test**:
```javascript
// Test file validation in browser console
const validationUtils = require('./validationUtils');

const jpgFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
const gifFile = new File(['content'], 'test.gif', { type: 'image/gif' });

validationUtils.validateAttachments([jpgFile]).isValid; // Should be true
validationUtils.validateAttachments([gifFile]).isValid; // Should be false (error)
```

---

### Issue 5: Status Transition Blocked

**Problem**: Cannot update ticket status from OPEN to IN_PROGRESS (400 error)

**Root Cause**:
- Status transition validation rejects valid transition
- Enum name mismatch (frontend sends "InProgress", backend expects "IN_PROGRESS")
- Status transition rules too restrictive

**File Paths**:
- `backend/src/main/java/com/smartcampus/backend/service/TicketServiceImpl.java`
- `frontend/src/pages/Incident_tickting/components/StatusBadge.jsx`

**Fix - Allow Valid Transitions**:
```java
// BEFORE: Missing valid transition
private void validateStatusTransition(TicketStatus current, TicketStatus next) {
    Map<TicketStatus, Set<TicketStatus>> validTransitions = new HashMap<>();
    validTransitions.put(TicketStatus.OPEN, 
        new HashSet<>(Arrays.asList(TicketStatus.REJECTED))); // WRONG: missing IN_PROGRESS
    validTransitions.put(TicketStatus.IN_PROGRESS, 
        new HashSet<>(Arrays.asList(TicketStatus.RESOLVED)));
    validTransitions.put(TicketStatus.RESOLVED, 
        new HashSet<>(Arrays.asList(TicketStatus.CLOSED)));
    validTransitions.put(TicketStatus.CLOSED, new HashSet<>());
    
    if (!validTransitions.getOrDefault(current, new HashSet<>()).contains(next)) {
        throw new TicketStatusTransitionException(
            String.format("Cannot transition from %s to %s", current, next)
        );
    }
}

// AFTER: Include all valid transitions
private void validateStatusTransition(TicketStatus current, TicketStatus next) {
    Map<TicketStatus, Set<TicketStatus>> validTransitions = new HashMap<>();
    validTransitions.put(TicketStatus.OPEN, 
        new HashSet<>(Arrays.asList(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED))); // FIXED
    validTransitions.put(TicketStatus.IN_PROGRESS, 
        new HashSet<>(Arrays.asList(TicketStatus.RESOLVED, TicketStatus.REJECTED, TicketStatus.OPEN))); // FIXED
    validTransitions.put(TicketStatus.RESOLVED, 
        new HashSet<>(Arrays.asList(TicketStatus.CLOSED, TicketStatus.OPEN))); // FIXED
    validTransitions.put(TicketStatus.CLOSED, new HashSet<>());
    validTransitions.put(TicketStatus.REJECTED, 
        new HashSet<>(Arrays.asList(TicketStatus.OPEN))); // FIXED
    
    if (!validTransitions.getOrDefault(current, new HashSet<>()).contains(next)) {
        throw new TicketStatusTransitionException(
            String.format("Cannot transition from %s to %s", current, next)
        );
    }
}
```

**How to Test**:
```bash
# Test valid transition
curl -X PUT http://localhost:8080/api/v1/tickets/{ticketId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"status": "IN_PROGRESS"}'
# Should return 200 OK

# Test invalid transition (should fail)
curl -X PUT http://localhost:8080/api/v1/tickets/{ticketId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"status": "OPEN"}' # If already CLOSED
# Should return 400 with error message
```

---

### Issue 6: Validation Message Mismatch

**Problem**: Frontend shows "Title is required" but backend sends "Title cannot be blank"

**Root Cause**:
- Different error messages on frontend vs backend
- Inconsistent validation messaging confuses users
- Frontend message from local validation, backend message from API

**File Paths**:
- `frontend/src/pages/Incident_tickting/utils/validationUtils.js`
- `backend/src/main/java/com/smartcampus/backend/dto/CreateTicketRequest.java`

**Fix - Sync Error Messages**:
```javascript
// BEFORE: Frontend message
export const VALIDATION_RULES = {
  TICKET: {
    title: {
      required: true,
      errorMessages: {
        required: 'Title is needed' // WRONG: different from backend
      }
    }
  }
}

// AFTER: Match backend exactly
export const VALIDATION_RULES = {
  TICKET: {
    title: {
      required: true,
      errorMessages: {
        required: 'Title is required' // CORRECT: matches backend
      }
    }
  }
}
```

```java
// BACKEND: Keep error message consistent
@NotBlank(message = "Title is required") // MUST match frontend
@Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
private String title;
```

**How to Test**:
1. Clear title field and submit form
2. Check browser console error message
3. If error passes to backend, check API response error message
4. Both should say exactly: "Title is required"

---

### Issue 7: Comment Content Not Saved

**Problem**: Add comment but content is empty after save

**Root Cause**:
- Comment content not trimmed before save
- Whitespace-only comments accepted
- Frontend sends content with leading/trailing spaces, backend stores as-is

**File Paths**:
- `backend/src/main/java/com/smartcampus/backend/service/TicketServiceImpl.java`

**Fix - Trim Input**:
```java
// BEFORE: No trimming
@Override
public TicketResponse addComment(String ticketId, TicketCommentRequest request, String userId) {
    // ...
    TicketComment comment = new TicketComment();
    comment.setContent(request.getContent()); // WRONG: might have extra spaces
    // ...
}

// AFTER: Always trim
@Override
public TicketResponse addComment(String ticketId, TicketCommentRequest request, String userId) {
    // ...
    
    // Validate content not empty after trim
    String content = request.getContent().trim();
    if (content.isEmpty()) {
        throw new IllegalArgumentException("Comment content cannot be empty");
    }
    
    TicketComment comment = new TicketComment();
    comment.setContent(content); // CORRECT: trimmed
    comment.setAuthorId(userId);
    comment.setAuthorName(resolveUserName(userId));
    comment.setCreatedAt(LocalDateTime.now());
    comment.setUpdatedAt(LocalDateTime.now());
    
    ticket.getComments().add(comment);
    ticket.setUpdatedAt(LocalDateTime.now());
    return convertToResponse(ticketRepository.save(ticket));
}
```

**How to Test**:
1. Add comment with spaces: `"   My comment   "`
2. Retrieve ticket detail
3. Comment should display as: `"My comment"` (trimmed, no leading/trailing spaces)

---

### Issue 8: Import Error (Frontend)

**Problem**: "Cannot find module 'ticketService'" error when importing in React component

**Root Cause**:
- Incorrect import path
- File doesn't exist at specified path
- Wrong file extension

**File Paths**:
- `frontend/src/pages/Incident_tickting/components/TicketForm.jsx`
- `frontend/src/pages/Incident_tickting/services/ticketService.js`

**Fix - Correct Import Path**:
```javascript
// BEFORE: Wrong path
import { ticketService } from '../ticketService' // WRONG: file in services folder

// AFTER: Correct relative path
import { ticketService } from '../services/ticketService' // CORRECT

// Or if importing from utils
import { validateTicketForm } from '../utils/validationUtils' // CORRECT
```

**How to Test**:
```bash
# Run build - should have no import errors
npm run build

# Or check dev server logs
npm run dev
# Should not show "Cannot find module" errors
```

---

### Issue 9: Missing Authorization Check

**Problem**: Regular USER can call admin-only endpoint `/api/v1/tickets/{id}/status`

**Root Cause**:
- `@PreAuthorize` annotation missing from controller method
- Role check not implemented

**File Paths**:
- `backend/src/main/java/com/smartcampus/backend/controller/TicketController.java`

**Fix - Add Role Check**:
```java
// BEFORE: No authorization
@PutMapping("/{ticketId}/status")
public ResponseEntity<TicketResponse> updateTicketStatus(
    @PathVariable String ticketId,
    @Valid @RequestBody UpdateTicketStatusRequest request) {
    TicketResponse response = ticketService.updateTicketStatus(ticketId, request, userId);
    return ResponseEntity.ok(response);
}

// AFTER: Admin only
@PutMapping("/{ticketId}/status")
@PreAuthorize("hasRole('ADMIN')") // FIXED: add authorization
public ResponseEntity<TicketResponse> updateTicketStatus(
    @PathVariable String ticketId,
    @Valid @RequestBody UpdateTicketStatusRequest request,
    @AuthenticationPrincipal UserDetails userDetails) {
    TicketResponse response = ticketService.updateTicketStatus(
        ticketId, request, userDetails.getUsername());
    return ResponseEntity.ok(response);
}
```

**How to Test**:
```bash
# Test as USER (should fail)
curl -X PUT http://localhost:8080/api/v1/tickets/{ticketId}/status \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"status": "IN_PROGRESS"}'
# Should return 403 Forbidden

# Test as ADMIN (should work)
curl -X PUT http://localhost:8080/api/v1/tickets/{ticketId}/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"status": "IN_PROGRESS"}'
# Should return 200 OK
```

---

### Issue 10: Circular Import (Backend)

**Problem**: Compile error: "Circular dependency between TicketService and UserService"

**Root Cause**:
- TicketService injects UserService
- UserService injects TicketService
- Creates circular dependency loop

**File Paths**:
- `backend/src/main/java/com/smartcampus/backend/service/TicketServiceImpl.java`
- `backend/src/main/java/com/smartcampus/backend/service/UserServiceImpl.java`

**Fix - Remove Circular Dependency**:
```java
// BEFORE: Circular injection
@Service
public class TicketServiceImpl {
    @Autowired
    private UserService userService; // WRONG: creates circle
    
    private String resolveUserName(String userId) {
        User user = userService.getUser(userId); // Uses UserService
        return user.getFirstName() + " " + user.getLastName();
    }
}

@Service
public class UserServiceImpl {
    @Autowired
    private TicketService ticketService; // Creates circle back
}

// AFTER: Inject repository directly instead
@Service
public class TicketServiceImpl {
    @Autowired
    private UserRepository userRepository; // FIXED: inject repository instead
    
    private String resolveUserName(String userId) {
        return userRepository.findById(userId)
            .map(u -> u.getFirstName() + " " + u.getLastName())
            .orElse(userId);
    }
}

@Service
public class UserServiceImpl {
    // No reference to TicketService - circle is broken
}
```

**How to Test**:
```bash
# Rebuild - should compile without errors
mvn clean compile

# If using IDE, errors should disappear after saving
```

---

## Debugging Workflow

When you encounter a ticketing error:

1. **Read the error message carefully**
   - 404 → Route not found
   - 400 → Validation or DTO mismatch
   - 403 → Authorization missing
   - 500 → Server logic error (check logs)

2. **Check API request/response**
   - Open browser DevTools → Network tab
   - Check request payload matches DTO fields
   - Check response error details

3. **Verify frontend/backend alignment**
   - Field names match? (title vs Title)
   - Validation rules match? (length limits)
   - Error messages match?
   - Allowed values match? (status options)

4. **Isolate to one file change**
   - Fix only one thing per commit
   - Test between changes
   - Don't refactor unrelated code

5. **Test the fix**
   - Restart frontend/backend
   - Try action that was failing
   - Verify success response
   - Check logs for warnings

---

## Quick Checklist: New Endpoint

When adding a new endpoint, verify:

- [ ] Route defined in `@RequestMapping` or `@PostMapping` etc.
- [ ] HTTP method matches frontend call (GET, POST, PUT, DELETE)
- [ ] `@PreAuthorize` annotation set correctly (if restricted)
- [ ] DTO fields match frontend request payload
- [ ] Service method exists and returns correct response type
- [ ] All parameters annotated (`@PathVariable`, `@RequestBody`, `@AuthenticationPrincipal`)
- [ ] `@Valid` annotation on request body
- [ ] HTTP status code set correctly (201 for POST create, 200 for updates)
- [ ] Error cases throw appropriate exceptions
- [ ] Global exception handler catches exceptions and returns proper status code

---

## Quick Checklist: Validation Rule

When adding validation:

- [ ] Frontend constant defined in `validationUtils.js`
- [ ] Frontend regex/pattern matches backend pattern
- [ ] Backend DTO has matching JSR-303 annotation
- [ ] Error message is identical on both sides
- [ ] Service layer validates complex logic (not just annotations)
- [ ] Global exception handler formats error response
- [ ] Frontend displays error message to user
- [ ] Test with invalid input → verify error message appears
- [ ] Test with valid input → verify submission succeeds

---

## Files Never to Touch (Other Modules)

✋ DO NOT edit:
- `frontend/src/pages/AdminDashboardPage.jsx`
- `frontend/src/pages/UserDashboardPage.jsx`
- `frontend/src/components/NotificationBell.jsx`
- `backend/src/main/java/com/smartcampus/backend/config/SecurityConfig.java` (unless ticketing-specific)
- Any files outside the ticketing folder/package

---

## Key Principles for Safe Fixes

1. **Minimal**: Touch only broken code
2. **Surgical**: Fix the root cause, not symptoms
3. **Tested**: Verify before and after behavior
4. **Isolated**: Change only affects ticketing module
5. **Documented**: Brief comment on why change was needed
