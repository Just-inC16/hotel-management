package com.tcs.customer.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerResponse {
	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	private String role;
	private String phone;
	private String paymentCardholderName;
	private String paymentCardBrand;
	private String paymentLast4;
	private String paymentExpiry;
}
