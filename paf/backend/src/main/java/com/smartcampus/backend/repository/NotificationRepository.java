package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.NotificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, NotificationStatus status);
    long deleteByUserId(String userId);
    long countByUserIdAndStatus(String userId, NotificationStatus status);
}
