package com.tcs.customer.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.tcs.customer.Dto.Notification;



@Component
@FeignClient(name="api-gateway1", url="${gateway.url:localhost:8085}")
public interface NotificationClient {
	@PostMapping("notification/api/v1/notifications/send")
	public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification);
}
