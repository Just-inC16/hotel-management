package com.tcs.reservation.Dto;

import lombok.Data;

@Data
public class Address {
	private String line1;
	private String city;
	private String state;
	private String postalCode;
	private String countryCode;
}
