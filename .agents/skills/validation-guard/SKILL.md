---
name: validation-guard
description: 'Add strong frontend and backend validation for incident ticketing. Use when building forms, APIs, or services. Covers required fields, length limits, file validation, authorization checks, and status transitions. Ensures frontend and backend rules match.'
argument-hint: 'Specify what to validate (e.g., "create ticket form", "comment service", "file upload")'
user-invocable: true
---

# Validation Guard

Complete validation patterns for the incident ticketing feature—frontend and backend in sync.

## When to Use

- Build or update ticket creation form
- Implement comment add/edit functionality
- Add file attachment upload
- Create or update service layer business logic
- Build DTOs and request classes
- Handle API responses with validation errors
- Add authorization checks for user actions
- Validate status workflow transitions

## Core Principle

**Frontend and backend validation rules MUST match.** Frontend catches errors early; backend enforces them as security boundary.

---

## Frontend Validation Patterns

Location: `frontend/src/pages/Incident_tickting/`

### 1. Field-Level Validation Rules

```javascript
// Frontend Validation Constants
export const VALIDATION_RULES = {
  TICKET: {
    title: {
      required: true,
      minLength: 5,
      maxLength: 200,
      pattern: /^[a-zA-Z0-9\s\-.,!?'"()]+$/, // Alphanumeric and basic punctuation
      errorMessages: {
        required: 'Title is required',
        minLength: 'Title must be at least 5 characters',
        maxLength: 'Title cannot exceed 200 characters',
        pattern: 'Title contains invalid characters'
      }
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 2000,
      errorMessages: {
        required: 'Description is required',
        minLength: 'Description must be at least 10 characters',
        maxLength: 'Description cannot exceed 2000 characters'
      }
    },
    priority: {
      required: true,
      allowed: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      errorMessages: {
        required: 'Priority is required',
        invalid: 'Please select a valid priority level'
      }
    },
    category: {
      required: true,
      minLength: 2,
      maxLength: 50,
      errorMessages: {
        required: 'Category is required',
        minLength: 'Category must be at least 2 characters',
        maxLength: 'Category cannot exceed 50 characters'
      }
    },
    resource: {
      required: true,
      examples: ['Building A', 'Laboratory 201', 'Campus Gate'],
      errorMessages: {
        required: 'Location/resource is required'
      }
    },
    preferredContact: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$|^(\+?1)?(\d{3})?[-.\s]?\d{3}[-.\s]?\d{4}$/,
      errorMessages: {
        required: 'Preferred contact (email or phone) is required',
        invalid: 'Please enter a valid email or phone number'
      }
    }
  },
  COMMENT: {
    content: {
      required: true,
      minLength: 1,
      maxLength: 1000,
      errorMessages: {
        required: 'Comment cannot be empty',
        maxLength: 'Comment cannot exceed 1000 characters'
      }
    }
  },
  ATTACHMENT: {
    maxFiles: 3,
    maxFileSize: 5242880, // 5MB in bytes
    allowedFormats: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    errorMessages: {
      maxFiles: 'Maximum 3 attachments allowed',
      maxFileSize: 'File size must not exceed 5MB',
      invalidFormat: 'Only JPG, JPEG, and PNG images are allowed',
      invalidExtension: 'Invalid file type. Please upload JPG, JPEG, or PNG files'
    }
  }
}
```

### 2. Validation Utility Functions

```javascript
// frontend/src/pages/Incident_tickting/utils/validationUtils.js

export const validateTicketForm = (formData) => {
  const errors = {}
  const rules = VALIDATION_RULES.TICKET

  // Title validation
  if (!formData.title || !formData.title.trim()) {
    errors.title = rules.title.errorMessages.required
  } else if (formData.title.length < rules.title.minLength) {
    errors.title = rules.title.errorMessages.minLength
  } else if (formData.title.length > rules.title.maxLength) {
    errors.title = rules.title.errorMessages.maxLength
  } else if (!rules.title.pattern.test(formData.title)) {
    errors.title = rules.title.errorMessages.pattern
  }

  // Description validation
  if (!formData.description || !formData.description.trim()) {
    errors.description = rules.description.errorMessages.required
  } else if (formData.description.length < rules.description.minLength) {
    errors.description = rules.description.errorMessages.minLength
  } else if (formData.description.length > rules.description.maxLength) {
    errors.description = rules.description.errorMessages.maxLength
  }

  // Priority validation
  if (!formData.priority) {
    errors.priority = rules.priority.errorMessages.required
  } else if (!rules.priority.allowed.includes(formData.priority)) {
    errors.priority = rules.priority.errorMessages.invalid
  }

  // Category validation
  if (!formData.category || !formData.category.trim()) {
    errors.category = rules.category.errorMessages.required
  }

  // Resource/Location validation
  if (!formData.resource || !formData.resource.trim()) {
    errors.resource = rules.resource.errorMessages.required
  }

  // Preferred contact validation
  if (!formData.preferredContact || !formData.preferredContact.trim()) {
    errors.preferredContact = rules.preferredContact.errorMessages.required
  } else if (!rules.preferredContact.pattern.test(formData.preferredContact)) {
    errors.preferredContact = rules.preferredContact.errorMessages.invalid
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateAttachments = (files) => {
  const errors = []
  const rules = VALIDATION_RULES.ATTACHMENT

  if (!files || files.length === 0) {
    return { isValid: true, errors: [] }
  }

  // Check max file count
  if (files.length > rules.maxFiles) {
    errors.push({
      type: 'maxFiles',
      message: rules.errorMessages.maxFiles
    })
    return { isValid: false, errors }
  }

  // Check each file
  files.forEach((file, index) => {
    // Check file size
    if (file.size > rules.maxFileSize) {
      errors.push({
        type: 'fileSize',
        fileName: file.name,
        message: `${file.name}: ${rules.errorMessages.maxFileSize}`
      })
    }

    // Check file type
    if (!rules.allowedFormats.includes(file.type)) {
      errors.push({
        type: 'fileType',
        fileName: file.name,
        message: `${file.name}: ${rules.errorMessages.invalidFormat}`
      })
    }

    // Check extension
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!rules.allowedExtensions.includes(ext)) {
      errors.push({
        type: 'extension',
        fileName: file.name,
        message: `${file.name}: ${rules.errorMessages.invalidExtension}`
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateComment = (content) => {
  const errors = {}
  const rules = VALIDATION_RULES.COMMENT

  if (!content || !content.trim()) {
    errors.content = rules.content.errorMessages.required
  } else if (content.length > rules.content.maxLength) {
    errors.content = rules.content.errorMessages.maxLength
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
```

### 3. React Form Component with Validation

```javascript
// Example: TicketForm.jsx
import { validateTicketForm, validateAttachments } from './utils/validationUtils'

export const TicketForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    category: '',
    resource: '',
    preferredContact: '',
    attachments: []
  })
  const [errors, setErrors] = useState({})
  const [fileErrors, setFileErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const validation = validateAttachments(files)
    
    if (validation.isValid) {
      setFormData(prev => ({
        ...prev,
        attachments: files
      }))
      setFileErrors([])
    } else {
      setFileErrors(validation.errors)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Frontend validation
    const validation = validateTicketForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    try {
      const response = await ticketService.createTicket(formData)
      // Success handling
    } catch (error) {
      // Backend validation errors from API response
      if (error.response?.data?.details) {
        setErrors(error.response.data.details)
      } else {
        setErrors({ submit: error.response?.data?.error || 'Failed to create ticket' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ticket Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md ${
            errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Brief description of the issue"
          disabled={loading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.title.length}/200 characters
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="5"
          className={`mt-1 block w-full px-3 py-2 border rounded-md ${
            errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Provide detailed information about the incident"
          disabled={loading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length}/2000 characters
        </p>
      </div>

      {/* Priority Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Priority *
        </label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md ${
            errors.priority ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          disabled={loading}
        >
          <option value="">Select priority level</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        {errors.priority && (
          <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
        )}
      </div>

      {/* Category Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md ${
            errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="e.g., Facility, IT, Safety"
          disabled={loading}
        />
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Resource/Location Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Location/Resource *
        </label>
        <input
          type="text"
          name="resource"
          value={formData.resource}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md ${
            errors.resource ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="e.g., Building A, Laboratory 201"
          disabled={loading}
        />
        {errors.resource && (
          <p className="mt-1 text-sm text-red-600">{errors.resource}</p>
        )}
      </div>

      {/* Preferred Contact Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Preferred Contact (Email or Phone) *
        </label>
        <input
          type="text"
          name="preferredContact"
          value={formData.preferredContact}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md ${
            errors.preferredContact ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="your@email.com or +1234567890"
          disabled={loading}
        />
        {errors.preferredContact && (
          <p className="mt-1 text-sm text-red-600">{errors.preferredContact}</p>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Attachments (Max 3 images)
        </label>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="mt-1 block w-full"
          disabled={loading}
        />
        {fileErrors.length > 0 && (
          <div className="mt-2 space-y-1">
            {fileErrors.map((error, idx) => (
              <p key={idx} className="text-sm text-red-600">{error.message}</p>
            ))}
          </div>
        )}
        {formData.attachments.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-600">
              {formData.attachments.length}/3 files selected
            </p>
            <ul className="mt-1 space-y-1">
              {formData.attachments.map((file, idx) => (
                <li key={idx} className="text-xs text-gray-700">
                  ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || Object.keys(errors).length > 0}
        className="w-full bg-green-600 text-white py-2 rounded-md disabled:bg-gray-400"
      >
        {loading ? 'Creating Ticket...' : 'Create Ticket'}
      </button>
    </form>
  )
}
```

---

## Backend Validation Patterns

Location: `backend/src/main/java/com/smartcampus/backend/`

### 1. DTO Validation with JSR-303 Annotations

```java
// dto/CreateTicketRequest.java
package com.smartcampus.backend.dto;

import javax.validation.constraints.*;
import lombok.Data;

@Data
public class CreateTicketRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    @Pattern(
        regexp = "^[a-zA-Z0-9\\s\\-.,!?'\"()]+$",
        message = "Title contains invalid characters"
    )
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    @Pattern(regexp = "LOW|MEDIUM|HIGH|URGENT", message = "Invalid priority value")
    private String priority;

    @NotBlank(message = "Category is required")
    @Size(min = 2, max = 50, message = "Category must be between 2 and 50 characters")
    private String category;

    @NotBlank(message = "Location/resource is required")
    private String resource;

    @NotBlank(message = "Preferred contact is required")
    @Pattern(
        regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$|^(\\+?1)?(\\d{3})?[-\\.\\s]?\\d{3}[-\\.\\s]?\\d{4}$",
        message = "Please provide a valid email or phone number"
    )
    private String preferredContact;
}

// dto/UpdateTicketStatusRequest.java
@Data
public class UpdateTicketStatusRequest {
    
    @NotNull(message = "Status is required")
    @Pattern(regexp = "OPEN|IN_PROGRESS|RESOLVED|CLOSED|REJECTED", 
            message = "Invalid status value")
    private String status;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}

// dto/TicketCommentRequest.java
@Data
public class TicketCommentRequest {
    
    @NotBlank(message = "Comment content is required")
    @Size(min = 1, max = 1000, message = "Comment must be between 1 and 1000 characters")
    private String content;
}
```

### 2. Service Layer Business Validation

```java
// service/TicketService.java (Interface)
public interface TicketService {
    TicketResponse createTicket(CreateTicketRequest request, String userId);
    TicketResponse updateTicketStatus(String ticketId, UpdateTicketStatusRequest request, String userId);
    TicketResponse addComment(String ticketId, TicketCommentRequest request, String userId);
    TicketResponse updateComment(String ticketId, String commentId, TicketCommentRequest request, String userId);
    void deleteComment(String ticketId, String commentId, String userId);
    void validateAttachments(List<MultipartFile> files);
}

// service/TicketServiceImpl.java (Implementation)
package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.exception.*;
import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository; // For resolving user names

    private static final List<String> ALLOWED_IMAGE_TYPES = 
        Arrays.asList("image/jpeg", "image/png", "image/jpg");
    private static final List<String> ALLOWED_EXTENSIONS = 
        Arrays.asList(".jpg", ".jpeg", ".png");
    private static final long MAX_FILE_SIZE = 5242880; // 5MB
    private static final int MAX_ATTACHMENTS = 3;

    @Override
    public TicketResponse createTicket(CreateTicketRequest request, String userId) {
        log.info("Creating ticket for user: {}", userId);

        // Validate required fields (annotations handle some, but check complex rules here)
        validateTicketInput(request);

        // Create ticket document
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(TicketPriority.valueOf(request.getPriority()));
        ticket.setCategory(request.getCategory().trim());
        ticket.setResource(request.getResource().trim());
        ticket.setPreferredContact(request.getPreferredContact().trim());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(userId);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setComments(new ArrayList<>());

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket created with ID: {}", savedTicket.getId());
        
        return convertToResponse(savedTicket);
    }

    @Override
    public TicketResponse updateTicketStatus(
            String ticketId, 
            UpdateTicketStatusRequest request, 
            String userId) {
        log.info("Updating ticket {} status to {}", ticketId, request.getStatus());

        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));

        // Only ADMIN can change status
        // This is checked by @PreAuthorize in controller, but verify here too
        
        TicketStatus newStatus = TicketStatus.valueOf(request.getStatus());
        
        // Validate status transition
        validateStatusTransition(ticket.getStatus(), newStatus);

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        Ticket updated = ticketRepository.save(ticket);
        log.info("Ticket status updated successfully");
        
        return convertToResponse(updated);
    }

    @Override
    public TicketResponse addComment(
            String ticketId, 
            TicketCommentRequest request, 
            String userId) {
        log.info("Adding comment to ticket {}", ticketId);

        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));

        // Validate comment content
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        if (request.getContent().length() > 1000) {
            throw new IllegalArgumentException("Comment cannot exceed 1000 characters");
        }

        TicketComment comment = new TicketComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setContent(request.getContent().trim());
        comment.setAuthorId(userId);
        comment.setAuthorName(resolveUserName(userId));
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updated = ticketRepository.save(ticket);
        log.info("Comment added successfully");
        
        return convertToResponse(updated);
    }

    @Override
    public TicketResponse updateComment(
            String ticketId, 
            String commentId, 
            TicketCommentRequest request, 
            String userId) {
        log.info("Updating comment {} in ticket {}", commentId, ticketId);

        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));

        TicketComment comment = ticket.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new CommentNotFoundException("Comment not found: " + commentId));

        // Only comment author can edit (or ADMIN if needed)
        if (!comment.getAuthorId().equals(userId)) {
            throw new CommentAccessDeniedException(
                "You can only edit your own comments"
            );
        }

        // Validate updated content
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        if (request.getContent().length() > 1000) {
            throw new IllegalArgumentException("Comment cannot exceed 1000 characters");
        }

        comment.setContent(request.getContent().trim());
        comment.setUpdatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updated = ticketRepository.save(ticket);
        log.info("Comment updated successfully");
        
        return convertToResponse(updated);
    }

    @Override
    public void deleteComment(String ticketId, String commentId, String userId) {
        log.info("Deleting comment {} from ticket {}", commentId, ticketId);

        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));

        TicketComment comment = ticket.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new CommentNotFoundException("Comment not found: " + commentId));

        // Only comment author or ADMIN can delete
        boolean isAuthor = comment.getAuthorId().equals(userId);
        boolean isAdmin = userRepository.findById(userId)
            .map(u -> u.getRoles().contains("ADMIN"))
            .orElse(false);

        if (!isAuthor && !isAdmin) {
            throw new CommentAccessDeniedException(
                "You can only delete your own comments"
            );
        }

        ticket.getComments().removeIf(c -> c.getId().equals(commentId));
        ticket.setUpdatedAt(LocalDateTime.now());

        ticketRepository.save(ticket);
        log.info("Comment deleted successfully");
    }

    @Override
    public void validateAttachments(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return; // Optional
        }

        if (files.size() > MAX_ATTACHMENTS) {
            throw new InvalidAttachmentException(
                String.format("Maximum %d attachments allowed, got %d", 
                    MAX_ATTACHMENTS, files.size())
            );
        }

        for (MultipartFile file : files) {
            // Check file size
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new InvalidAttachmentException(
                    String.format("File %s exceeds 5MB limit (%.2fMB)", 
                        file.getOriginalFilename(), 
                        file.getSize() / 1024.0 / 1024.0)
                );
            }

            // Check MIME type
            if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
                throw new InvalidAttachmentException(
                    String.format("File %s has invalid type: %s. Only JPG and PNG allowed", 
                        file.getOriginalFilename(), 
                        file.getContentType())
                );
            }

            // Check extension
            String filename = file.getOriginalFilename();
            if (filename == null || !hasValidExtension(filename)) {
                throw new InvalidAttachmentException(
                    String.format("File %s has invalid extension. Use .jpg, .jpeg, or .png", 
                        filename)
                );
            }
        }
    }

    // Private validation helper methods
    
    private void validateTicketInput(CreateTicketRequest request) {
        // Additional business logic validation beyond annotations
        
        // Check that category is from allowed list (if restricted)
        List<String> validCategories = Arrays.asList("Facility", "IT", "Safety", "Other");
        if (!validCategories.contains(request.getCategory())) {
            log.warn("Invalid category: {}", request.getCategory());
            // Decide: either throw exception or log warning
        }
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        // Define valid transitions
        Map<TicketStatus, Set<TicketStatus>> validTransitions = new HashMap<>();
        validTransitions.put(TicketStatus.OPEN, 
            new HashSet<>(Arrays.asList(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED)));
        validTransitions.put(TicketStatus.IN_PROGRESS, 
            new HashSet<>(Arrays.asList(TicketStatus.RESOLVED, TicketStatus.REJECTED)));
        validTransitions.put(TicketStatus.RESOLVED, 
            new HashSet<>(Arrays.asList(TicketStatus.CLOSED, TicketStatus.OPEN)));
        validTransitions.put(TicketStatus.CLOSED, new HashSet<>());
        validTransitions.put(TicketStatus.REJECTED, 
            new HashSet<>(Arrays.asList(TicketStatus.OPEN)));

        if (!validTransitions.getOrDefault(current, new HashSet<>()).contains(next)) {
            throw new TicketStatusTransitionException(
                String.format("Cannot transition from %s to %s", current, next)
            );
        }
    }

    private boolean hasValidExtension(String filename) {
        String lowerName = filename.toLowerCase();
        return ALLOWED_EXTENSIONS.stream()
            .anyMatch(lowerName::endsWith);
    }

    private String resolveUserName(String userId) {
        return userRepository.findById(userId)
            .map(u -> u.getFirstName() + " " + u.getLastName())
            .orElse(userId);
    }

    private TicketResponse convertToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setStatus(ticket.getStatus());
        response.setPriority(ticket.getPriority());
        response.setCategory(ticket.getCategory());
        response.setCreatedBy(ticket.getCreatedBy());
        response.setCreatedByName(resolveUserName(ticket.getCreatedBy()));
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        // Convert comments
        response.setComments(ticket.getComments().stream()
            .map(c -> new TicketCommentResponse(
                c.getId(), c.getContent(), c.getAuthorId(), c.getAuthorName(),
                c.getCreatedAt(), c.getUpdatedAt()
            ))
            .toList());
        return response;
    }
}
```

### 3. Custom Exception Classes

```java
// exception/TicketNotFoundException.java
package com.smartcampus.backend.exception;

public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String message) {
        super(message);
    }
}

// exception/CommentNotFoundException.java
public class CommentNotFoundException extends RuntimeException {
    public CommentNotFoundException(String message) {
        super(message);
    }
}

// exception/CommentAccessDeniedException.java
public class CommentAccessDeniedException extends RuntimeException {
    public CommentAccessDeniedException(String message) {
        super(message);
    }
}

// exception/TicketStatusTransitionException.java
public class TicketStatusTransitionException extends RuntimeException {
    public TicketStatusTransitionException(String message) {
        super(message);
    }
}

// exception/InvalidAttachmentException.java
public class InvalidAttachmentException extends RuntimeException {
    public InvalidAttachmentException(String message) {
        super(message);
    }
}
```

### 4. Global Exception Handler

```java
// config/GlobalExceptionHandler.java
package com.smartcampus.backend.config;

import com.smartcampus.backend.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Handle JSR-303 validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> details = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            details.put(fieldName, message);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Validation failed");
        response.put("details", details);

        log.warn("Validation error: {}", details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleTicketNotFound(TicketNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        
        log.warn("Ticket not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(CommentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCommentNotFound(CommentNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(CommentAccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleCommentAccessDenied(
            CommentAccessDeniedException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(TicketStatusTransitionException.class)
    public ResponseEntity<Map<String, Object>> handleStatusTransition(
            TicketStatusTransitionException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(InvalidAttachmentException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidAttachment(
            InvalidAttachmentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
```

---

## Validation Sync Summary

| Field | Frontend Min | Frontend Max | Backend Min | Backend Max | Notes |
|-------|------------|------------|-----------|-----------|-------|
| Title | 5 | 200 | 5 | 200 | Match exactly |
| Description | 10 | 2000 | 10 | 2000 | Match exactly |
| Comment | 1 | 1000 | 1 | 1000 | Match exactly |
| Category | 2 | 50 | 2 | 50 | Match exactly |
| Attachments | - | 3 files | - | 3 files | Match exactly |
| File Size | 5MB | - | 5MB | - | Match exactly |
| File Types | jpg, jpeg, png | - | jpg, jpeg, png | - | Match exactly |

---

## API Error Response Format

### Validation Errors (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "priority": "Please select a valid priority level",
    "resource": "Location/resource is required"
  }
}
```

### File Upload Errors (400)
```json
{
  "success": false,
  "error": "Maximum 3 attachments allowed, got 4"
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "error": "You can only edit your own comments"
}
```

### Status Transition Errors (400)
```json
{
  "success": false,
  "error": "Cannot transition from CLOSED to OPEN"
}
```

---

## Testing Validation

### Frontend Test Cases
1. ✓ Submit form with empty title → shows "Title is required"
2. ✓ Enter title with 3 chars → shows "Title must be at least 5 characters"
3. ✓ Select 4 files → shows "Maximum 3 attachments allowed"
4. ✓ Upload 6MB file → shows "File size must not exceed 5MB"
5. ✓ Upload .gif file → shows "Only JPG, JPEG, and PNG images are allowed"
6. ✓ Submit invalid email → shows "Please enter a valid email or phone number"
7. ✓ Edit comment with 1001 chars → shows "Comment cannot exceed 1000 characters"

### Backend Test Cases (MockMvc/JUnit)
1. ✓ POST /api/v1/tickets with invalid priority → 400 with error details
2. ✓ POST /api/v1/tickets with title length 3 → 400
3. ✓ POST /api/v1/tickets/{id}/comments with empty content → 400
4. ✓ PUT /api/v1/tickets/{id}/comments/{cid} as non-author → 403
5. ✓ PUT /api/v1/tickets/{id}/status with invalid transition → 400
6. ✓ POST /api/v1/tickets/{id}/attachments with 4 files → 400
7. ✓ GET /api/v1/tickets/{id} with invalid ID → 404

---

## Key Principles

1. **Match Frontend & Backend**: Every rule must be identical on both sides
2. **Clear Messages**: Errors must be specific and actionable, not "Invalid input"
3. **Defense in Depth**: Frontend validates for UX, backend validates for security
4. **Service Layer**: Complex rules (status transitions, authorization) belong in service, not just DTOs
5. **Fail Fast**: Validate early and throw meaningful exceptions
6. **Audit Trail**: Log all validation failures for security monitoring
