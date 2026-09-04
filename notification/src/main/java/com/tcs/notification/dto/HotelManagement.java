package com.tcs.notification.dto;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class HotelManagement {
	private Long id;
	private String name;
	private Integer roomNumber;
	private Status status;
	private BigDecimal amount;

}
