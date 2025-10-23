package com.tcs.customer.exceptions;

public class NameException extends Exception {
	public final String MESSAGE = "Name must only have only alphabet letters.";

	public NameException() {

	}

	@Override
	public String toString() {
		return MESSAGE.toString();
	}
}
