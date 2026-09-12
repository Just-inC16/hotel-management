package com.tcs.customer.Dto;

import lombok.Data;

@Data
public class SignupRequest {
	private String firstName;
	private String lastName;
	private String email;
	private String password;
	private String role;
}
