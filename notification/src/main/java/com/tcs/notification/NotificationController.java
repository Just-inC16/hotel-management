package com.tcs.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.notification.dto.HotelManagement;
import com.tcs.notification.service.NotificationService;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

	private NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@PostMapping("/send")
	public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
		return ResponseEntity.ok(notificationService.sendNotification(notification));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getNotification(@PathVariable("id") Long id) {
		return ResponseEntity.ok(notificationService.getNotification(id));
	}

	@KafkaListener(topics = "room-ready-notification")
	public void roomReadyNotification(HotelManagement hotelManagement) {
		notificationService.roomReadyNotification(hotelManagement);
	}
}
