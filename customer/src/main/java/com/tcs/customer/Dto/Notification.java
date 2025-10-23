package com.tcs.customer.Dto;

import lombok.Data;

@Data
public class Notification {
	private Long id;
	private String entity;
	private String message;

	public Notification(String entity, String message) {
		this.entity = entity;
		this.message = message;
	}
}
