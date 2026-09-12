package com.tcs.notification.dto;

import lombok.Data;

@Data
public class notificationDto {
	private Long id;
	private Object entity;
	private String message;

}
