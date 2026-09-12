package com.tcs.hotelManagement.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "hotelmanagement")
public class HotelManagement {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String name;
	private Integer roomNumber;
	private Status status;
	private BigDecimal amount;

	@Embedded
	private Address address;

	@Embedded
	private Coordinates coordinates;

	private Integer starRating;
	private Integer locationScore;
	private Double guestRating;

	@Column(length = 2000)
	private String description;

	private String currency = "USD";

	@ElementCollection
	@CollectionTable(name = "hotel_management_benefits", joinColumns = @JoinColumn(name = "hotel_management_id"))
	@Column(name = "benefit")
	private List<String> benefits = new ArrayList<>();

}
