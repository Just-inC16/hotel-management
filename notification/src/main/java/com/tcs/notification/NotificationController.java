package com.tcs.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

	private NotificationRepository notificationRepository;

	public NotificationController(NotificationRepository notificationRepository) {
		this.notificationRepository = notificationRepository;
	}

	@PostMapping("/send")
	public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
		return ResponseEntity.ok(notificationRepository.save(notification));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getNotification(@PathVariable("id") Long id) {
		Notification notificationById = notificationRepository.getReferenceById(id);
		Notification notificationDto = new Notification(notificationById.getId(), notificationById.getEntity(),
				notificationById.getMessage());
		return ResponseEntity.ok(notificationDto);
	}

}