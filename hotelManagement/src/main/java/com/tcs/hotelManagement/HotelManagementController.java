package com.tcs.hotelManagement;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
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
	private KafkaTemplate<String,HotelManagement> kafkaTemplate ;
	
	public HotelManagementController(HotelManagementRepository hotelManagementRepository,KafkaTemplate<String,HotelManagement> kafkaTemplate) {
		this.hotelManagementRepository = hotelManagementRepository;
		this.kafkaTemplate=kafkaTemplate;
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
			
			if (hotelRoomStatus == Status.AVAILABLE) {
				hotelManagement.setStatus(Status.NOT_READY);
				hotelManagementRepository.save(hotelManagement);
				this.kafkaTemplate.send("room-ready",hotelManagement);
				return ResponseEntity.ok(hotelRoomAmount);
			} else {
				return ResponseEntity.status(409).build();
			}
		} else {
			return ResponseEntity.notFound().build();
		}

	}
	@KafkaListener(topics="room-ready")
	public void setRoomReady(HotelManagement hotelManagement) {
		hotelManagement.setStatus(Status.READY);
		hotelManagementRepository.save(hotelManagement);
		this.kafkaTemplate.send("room-ready-notification", hotelManagement);
	}
	@PutMapping("/unbook/{id}")
	public ResponseEntity<String> unbookHotelRoom(@PathVariable Long id) {
		Optional<HotelManagement> hotelRoomById = hotelManagementRepository.findById(id);
		if (hotelRoomById.isPresent()) {
			HotelManagement hotelManagement = hotelRoomById.get();
			Status hotelRoomStatus = hotelManagement.getStatus();
			if (hotelRoomStatus == Status.BOOKED) {
				hotelManagement.setStatus(Status.AVAILABLE);
				hotelManagementRepository.save(hotelManagement);
				return ResponseEntity.ok("Hotel room was unbooked.");
			} else {
				return ResponseEntity.status(409).build();
			}
		} else {
			return ResponseEntity.notFound().build();
		}
	}
	@GetMapping("/analytics")
	public String getAnalytics() {
		return "";
	}
	@GetMapping("/topHotels")
	public List<HotelManagement> getKHotels(int k){
		return null;
	}
}
