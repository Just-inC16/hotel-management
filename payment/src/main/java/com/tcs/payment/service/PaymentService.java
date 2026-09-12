package com.tcs.payment.service;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.tcs.payment.model.Payment;
import com.tcs.payment.repository.PaymentRepository;

@Service
public class PaymentService {

	private final PaymentRepository paymentRepository;

	public PaymentService(PaymentRepository paymentRepository) {
		this.paymentRepository = paymentRepository;
	}

	public ResponseEntity<Payment> makePayment(Payment payment) {
		return ResponseEntity.ok(paymentRepository.save(payment));
	}

	public ResponseEntity<?> getPaymentById(Long id) {
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
