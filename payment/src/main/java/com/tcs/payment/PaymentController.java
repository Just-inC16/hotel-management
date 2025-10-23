package com.tcs.payment;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
	private PaymentRepository paymentRepository;

	public PaymentController(PaymentRepository paymentRepository) {
		this.paymentRepository = paymentRepository;
	}

	@PostMapping
	public ResponseEntity<Payment> makePayment(@RequestBody Payment payment) {
		return ResponseEntity.ok(paymentRepository.save(payment));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
		Optional<Payment> paymentById = paymentRepository.findById(id);
		if (paymentById.isPresent()) {
			Payment payment = paymentById.get();
			Payment paymentDto = new Payment(payment.getId(), payment.getCustomerId(), payment.getAmount());
			return ResponseEntity.ok(paymentDto);
		} else {
			return ResponseEntity.notFound().build();
		}
	}
}