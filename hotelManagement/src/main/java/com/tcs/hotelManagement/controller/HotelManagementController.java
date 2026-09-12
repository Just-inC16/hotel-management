package com.tcs.hotelManagement.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.hotelManagement.model.HotelManagement;
import com.tcs.hotelManagement.service.HotelManagementService;
import com.tcs.hotelManagement.service.HotelManagementService.BookingResult;
import com.tcs.hotelManagement.service.HotelManagementService.RoomOutcome;

@RestController
@RequestMapping("/api/v1/hotelManagements")
public class HotelManagementController {

	private final HotelManagementService hotelManagementService;

	public HotelManagementController(HotelManagementService hotelManagementService) {
		this.hotelManagementService = hotelManagementService;
	}

	@GetMapping
	public ResponseEntity<List<HotelManagement>> getAllHotels() {
		return ResponseEntity.ok(hotelManagementService.getAllHotels());
	}

	@PostMapping
	public ResponseEntity<?> saveHotelRoomDetails(@RequestBody HotelManagement hotelManagement) {
		return ResponseEntity.ok(hotelManagementService.saveHotelRoomDetails(hotelManagement));
	}

	@GetMapping("/{id}")
	public ResponseEntity<HotelManagement> isHotelIdPresent(@PathVariable Long id) {
		Optional<HotelManagement> hotelManagementDto = hotelManagementService.isHotelIdPresent(id);
		return hotelManagementDto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PutMapping("/book/{id}")
	public ResponseEntity<BigDecimal> bookHotelRoom(@PathVariable Long id) {
		BookingResult result = hotelManagementService.bookHotelRoom(id);
		return switch (result.outcome()) {
			case NOT_FOUND -> ResponseEntity.notFound().build();
			case CONFLICT -> ResponseEntity.status(409).build();
			case OK -> ResponseEntity.ok(result.amount());
		};
	}

	@PutMapping("/unbook/{id}")
	public ResponseEntity<String> unbookHotelRoom(@PathVariable Long id) {
		RoomOutcome outcome = hotelManagementService.unbookHotelRoom(id);
		return switch (outcome) {
			case NOT_FOUND -> ResponseEntity.notFound().build();
			case CONFLICT -> ResponseEntity.status(409).build();
			case OK -> ResponseEntity.ok("Hotel room was unbooked.");
		};
	}

	@GetMapping("/analytics")
	public String getAnalytics() {
		return hotelManagementService.getAnalytics();
	}

	@GetMapping("/topHotels")
	public List<HotelManagement> getKHotels(int k) {
		return hotelManagementService.getKHotels(k);
	}
}
