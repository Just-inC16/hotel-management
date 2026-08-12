package com.tcs.payment;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
@Table(name = "payment")
public class Payment {
	

	

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "customerId", nullable = false)
	private Long customerId;

	@Column(name = "amount", nullable = false)
	private BigDecimal amount;
	public Payment() {
		
	}
	// Additional fields such as payment method, status etc.
	public Payment(Long id, Long customerId, BigDecimal amount) {
		super();
		this.id = id;
		this.customerId = customerId;
		this.amount = amount;
	}
	// Getters and setters...
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getCustomerId() {
		return customerId;
	}

	public void setCustomerId(Long customerId) {
		this.customerId = customerId;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
}