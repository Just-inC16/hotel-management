package com.tcs.customer.exceptions;

public class EmailException extends Exception {
	public final String MESSAGE = "Email must be in proper email format(@)";

	public EmailException() {

	}

	@Override
	public String toString() {
		return MESSAGE.toString();
	}
}
