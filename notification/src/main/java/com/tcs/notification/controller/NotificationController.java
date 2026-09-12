package com.tcs.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.notification.model.Notification;
import com.tcs.notification.service.NotificationService;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

	private final NotificationService notificationService;

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
}
