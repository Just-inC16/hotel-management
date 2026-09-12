package com.tcs.customer.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "customer")
public class Customer {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "first_name", nullable = false)
	private String firstName;

	@Column(name = "last_name", nullable = false)
	private String lastName;

	@Column(name = "email", unique = true, nullable = false)
	private String email;

	@Column(name = "password", nullable = false)
	private String password;

	//Customer or manager role
	private String role;

	@Column(name = "phone")
	private String phone;

	@Column(name = "payment_cardholder_name")
	private String paymentCardholderName;

	@Column(name = "payment_card_brand")
	private String paymentCardBrand;

	@Column(name = "payment_last4", length = 4)
	private String paymentLast4;

	@Column(name = "payment_expiry", length = 5)
	private String paymentExpiry;

	@Column(name = "token")
	private String token;
	// Getters and setters...
}
