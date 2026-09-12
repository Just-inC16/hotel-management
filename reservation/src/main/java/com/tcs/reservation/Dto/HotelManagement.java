package com.tcs.reservation.Dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class HotelManagement {
	private Long id;
	private String name;
	private Integer roomNumber;
	private Status status;
	private BigDecimal amount;
	private Address address;
	private Coordinates coordinates;
	private Integer starRating;
	private Integer locationScore;
	private Double guestRating;
	private String description;
	private String currency;
	private List<String> benefits;

}
