package com.tcs.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tcs.payment.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

}
