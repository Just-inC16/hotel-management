package com.tcs.reservation.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.tcs.reservation.Dto.Payment;

@Component
@FeignClient(name = "api-gateway3", url = "localhost:8085")
public interface PaymentClient {
	@PostMapping("/payment/api/v1/payments")
	public ResponseEntity<Payment> makePayment(@RequestBody Payment payment);
}
