package com.tcs.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tcs.notification.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

}
