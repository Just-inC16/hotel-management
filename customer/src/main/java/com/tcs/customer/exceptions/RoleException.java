package com.tcs.customer.exceptions;

public class RoleException extends Exception {
	public final String MESSAGE = "The role must be manager or customer.";

	public RoleException() {

	}

	@Override
	public String toString() {
		return MESSAGE.toString();
	}
}
