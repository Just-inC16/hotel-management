package com.tcs.customer.exceptions;

public class PasswordException extends Exception {
	public final String MESSAGE = "Password must have at least 8 characters.";

	public PasswordException() {

	}

	@Override
	public String toString() {
		return MESSAGE.toString();
	}
}
