package com.tcs.customer.exceptions;

public class PasswordException extends Exception {
	public  String message = "Password must have at least 8 characters";

	public PasswordException() {

	}
	public PasswordException(String msg) {
		this.message=msg;
	}

	@Override
	public String toString() {
		return message.toString();
	}
}
