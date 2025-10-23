package com.tcs.customer.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.tcs.customer.Dto.Notification;
import com.tcs.customer.Dto.Reservation;

@Component
@FeignClient(name = "api-gateway", url = "localhost:8085")
public interface ReservationClient {
	@PostMapping("/reservation/api/v1/reservations/reserveHotel")
	ResponseEntity<Notification> reserveHotel(@RequestBody Reservation reservation);
}
