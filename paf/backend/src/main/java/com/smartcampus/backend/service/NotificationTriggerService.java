package com.smartcampus.backend.service;

import com.smartcampus.backend.model.NotificationType;
import org.springframework.stereotype.Service;

@Service
public class NotificationTriggerService {
    
    private final NotificationService notificationService;
    
    public NotificationTriggerService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    public void triggerBookingApprovedNotification(String userId, String bookingId) {
        notificationService.createNotification(
            userId,
            NotificationType.BOOKING_APPROVED,
            "Your booking (ID: " + bookingId + ") has been approved"
        );
    }
    
    public void triggerBookingRejectedNotification(String userId, String bookingId, String rejectionReason) {
        notificationService.createNotification(
            userId,
            NotificationType.BOOKING_REJECTED,
            "Your booking (ID: " + bookingId + ") has been rejected: " + rejectionReason
        );
    }
    
    public void triggerTicketCreatedNotification(String userId, String ticketId, String ticketTitle) {
        notificationService.createNotification(
            userId,
            NotificationType.TICKET_CREATED,
            "Your ticket (ID: " + ticketId + ") has been created: " + ticketTitle
        );
    }
    
    public void triggerTicketAssignedNotification(String userId, String ticketId, String ticketTitle) {
        notificationService.createNotification(
            userId,
            NotificationType.TICKET_ASSIGNED,
            "You have been assigned a new ticket (ID: " + ticketId + "): " + ticketTitle
        );
    }
    
    public void triggerTicketStatusUpdatedNotification(String userId, String ticketId, String ticketTitle, String newStatus) {
        notificationService.createNotification(
            userId,
            NotificationType.TICKET_STATUS_UPDATED,
            "Your ticket (ID: " + ticketId + ") status has been updated to: " + newStatus
        );
    }
    
    public void triggerCommentAddedNotification(String userId, String ticketId, String ticketTitle) {
        notificationService.createNotification(
            userId,
            NotificationType.COMMENT_ADDED,
            "A new comment has been added to your ticket (ID: " + ticketId + "): " + ticketTitle
        );
    }
}
