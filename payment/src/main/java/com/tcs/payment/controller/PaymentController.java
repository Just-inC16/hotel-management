<<<<<<< Updated upstream:payment/src/main/java/com/tcs/payment/controller/PaymentController.java
package com.tcs.payment.controller;
=======
package com.tcs.payment;
>>>>>>> Stashed changes:payment/src/main/java/com/tcs/payment/PaymentController.java

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

<<<<<<< Updated upstream:payment/src/main/java/com/tcs/payment/controller/PaymentController.java
import com.tcs.payment.model.Payment;
=======
>>>>>>> Stashed changes:payment/src/main/java/com/tcs/payment/PaymentController.java
import com.tcs.payment.service.PaymentService;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

<<<<<<< Updated upstream:payment/src/main/java/com/tcs/payment/controller/PaymentController.java
	private final PaymentService paymentService;
=======
	private PaymentService paymentService;
>>>>>>> Stashed changes:payment/src/main/java/com/tcs/payment/PaymentController.java

	public PaymentController(PaymentService paymentService) {
		this.paymentService = paymentService;
	}

	@PostMapping
	public ResponseEntity<Payment> makePayment(@RequestBody Payment payment) {
<<<<<<< Updated upstream:payment/src/main/java/com/tcs/payment/controller/PaymentController.java
		return paymentService.makePayment(payment);
=======
		return ResponseEntity.ok(paymentService.makePayment(payment));
>>>>>>> Stashed changes:payment/src/main/java/com/tcs/payment/PaymentController.java
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
		return paymentService.getPaymentById(id);
	}
}
