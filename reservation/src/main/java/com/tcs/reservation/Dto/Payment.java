package com.tcs.reservation.Dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class Payment {
	public Payment(Long customerId, BigDecimal hotelRoomAmount) {
		this.customerId = customerId;
		this.amount = hotelRoomAmount;
	}

	private Long id;
	private Long customerId;
	private BigDecimal amount;
}