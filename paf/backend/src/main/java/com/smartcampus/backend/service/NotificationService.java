package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.NotificationStatus;
import com.smartcampus.backend.model.NotificationType;
import com.smartcampus.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    
    public Notification createNotification(String userId, NotificationType type, String message) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setMessage(message);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setCreatedAt(Instant.now());
        
        return notificationRepository.save(notification);
    }
    
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setStatus(NotificationStatus.READ);
        return notificationRepository.save(notification);
    }
    
    public long clearAllNotifications(String userId) {
        return notificationRepository.deleteByUserId(userId);
    }
    
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }
}
