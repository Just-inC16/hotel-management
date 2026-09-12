package com.tcs.notification.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.tcs.notification.dto.HotelManagement;
import com.tcs.notification.model.Notification;
import com.tcs.notification.repository.NotificationRepository;

@Service
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final KafkaTemplate<String, Object> kafkaTemplate;

	public NotificationService(NotificationRepository notificationRepository, KafkaTemplate<String, Object> kafkaTemplate) {
		this.notificationRepository = notificationRepository;
		this.kafkaTemplate = kafkaTemplate;
	}

	public Notification sendNotification(Notification notification) {
		return notificationRepository.save(notification);
	}

	public Notification getNotification(Long id) {
		Notification notificationById = notificationRepository.getReferenceById(id);
		return new Notification(notificationById.getId(), notificationById.getEntity(), notificationById.getMessage());
	}

	@KafkaListener(topics = "room-ready-notification")
	public void roomReadyNotification(HotelManagement hotelManagement) {
		this.sendNotification(new Notification("HotelManagement", "The room is ready to be checked into."));
	}
}
