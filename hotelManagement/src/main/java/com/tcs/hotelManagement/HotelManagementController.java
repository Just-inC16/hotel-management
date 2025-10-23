package com.tcs.hotelManagement;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/hotelManagements")
public class HotelManagementController {
	private HotelManagementRepository hotelManagementRepository;

	public HotelManagementController(HotelManagementRepository hotelManagementRepository) {
		this.hotelManagementRepository = hotelManagementRepository;
	}

	@PostMapping
	public ResponseEntity<?> saveHotelRoomDetails(@RequestBody HotelManagement hotelManagement) {
		return ResponseEntity.ok(hotelManagementRepository.save(hotelManagement));
	}

	@GetMapping("/{id}")
	public ResponseEntity<HotelManagement> isHotelIdPresent(@PathVariable Long id) {
		Optional<HotelManagement> hotelManagementById = hotelManagementRepository.findById(id);
		if (hotelManagementById.isPresent()) {
			HotelManagement hotelManagement = hotelManagementById.get();
			HotelManagement hotelManagementDto = new HotelManagement(hotelManagement.getId(), hotelManagement.getName(),
					hotelManagement.getRoomNumber(), hotelManagement.getStatus(), hotelManagement.getAmount());
			return ResponseEntity.ok(hotelManagementDto);

		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@PutMapping("/book/{id}")
	public ResponseEntity<BigDecimal> bookHotelRoom(@PathVariable Long id) {
		Optional<HotelManagement> hotelRoomById = hotelManagementRepository.findById(id);
		if (hotelRoomById.isPresent()) {
			HotelManagement hotelManagement = hotelRoomById.get();
			Status hotelRoomStatus = hotelManagement.getStatus();
			BigDecimal hotelRoomAmount = hotelManagement.getAmount();
			if (hotelRoomStatus == Status.EMPTY) {
				hotelManagement.setStatus(Status.BOOKED);
				hotelManagementRepository.save(hotelManagement);
				return ResponseEntity.ok(hotelRoomAmount);
			} else {
				return ResponseEntity.status(409).build();
			}
		} else {
			return ResponseEntity.notFound().build();
		}

	}

	@PutMapping("/unbook/{id}")
	public ResponseEntity<String> unbookHotelRoom(@PathVariable Long id) {
		Optional<HotelManagement> hotelRoomById = hotelManagementRepository.findById(id);
		if (hotelRoomById.isPresent()) {
			HotelManagement hotelManagement = hotelRoomById.get();
			Status hotelRoomStatus = hotelManagement.getStatus();
			if (hotelRoomStatus == Status.BOOKED) {
				hotelManagement.setStatus(Status.EMPTY);
				hotelManagementRepository.save(hotelManagement);
				return ResponseEntity.ok("Hotel room was unbooked.");
			} else {
				return ResponseEntity.status(409).build();
			}
		} else {
			return ResponseEntity.notFound().build();
		}
	}
}
