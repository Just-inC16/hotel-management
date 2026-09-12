package com.tcs.customer.Dto;

import lombok.Data;

@Data
public class CustomerUpdateRequest {
	private String firstName;
	private String lastName;
	private String phone;
	private String paymentCardholderName;
	private String paymentCardBrand;
	private String paymentLast4;
	private String paymentExpiry;
}
