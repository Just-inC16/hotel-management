package com.tcs.payment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.payment.model.Payment;
import com.tcs.payment.service.PaymentService;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

	private final PaymentService paymentService;

	public PaymentController(PaymentService paymentService) {
		this.paymentService = paymentService;
	}

	@PostMapping
	public ResponseEntity<Payment> makePayment(@RequestBody Payment payment) {
		return paymentService.makePayment(payment);
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
		return paymentService.getPaymentById(id);
	}
}
