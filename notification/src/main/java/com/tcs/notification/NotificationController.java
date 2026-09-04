package com.tcs.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.notification.dto.HotelManagement;
import com.tcs.notification.email.EmailDto;



@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

	private NotificationRepository notificationRepository;
	private KafkaTemplate<String, Object> kafkaTemplate;

	public NotificationController(NotificationRepository notificationRepository,KafkaTemplate<String, Object> kafkaTemplate) {
		this.notificationRepository = notificationRepository;
		this.kafkaTemplate=kafkaTemplate;
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
	@KafkaListener(topics="room-ready-notification")
	public void roomReadyNotification(HotelManagement hotelManagement) {
		this.sendNotification(new Notification("HotelManagement","The room is ready to be checked into.")) ;
	}
}