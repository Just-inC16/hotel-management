package com.tcs.hotelManagement;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.hotelManagement.service.HotelManagementService;

@RestController
@RequestMapping("/api/v1/hotelManagements")
public class HotelManagementController {

	private HotelManagementService hotelManagementService;

	public HotelManagementController(HotelManagementService hotelManagementService) {
		this.hotelManagementService = hotelManagementService;
	}

	@PostMapping
	public ResponseEntity<?> saveHotelRoomDetails(@RequestBody HotelManagement hotelManagement) {
		return ResponseEntity.ok(hotelManagementService.saveHotelRoomDetails(hotelManagement));
	}

	@GetMapping("/{id}")
	public ResponseEntity<HotelManagement> isHotelIdPresent(@PathVariable Long id) {
		return hotelManagementService.isHotelIdPresent(id);
	}

	@PutMapping("/book/{id}")
	public ResponseEntity<BigDecimal> bookHotelRoom(@PathVariable Long id) {
		return hotelManagementService.bookHotelRoom(id);
	}

	@KafkaListener(topics = "room-ready")
	public void setRoomReady(HotelManagement hotelManagement) {
		hotelManagementService.setRoomReady(hotelManagement);
	}

	@PutMapping("/unbook/{id}")
	public ResponseEntity<String> unbookHotelRoom(@PathVariable Long id) {
		return hotelManagementService.unbookHotelRoom(id);
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
