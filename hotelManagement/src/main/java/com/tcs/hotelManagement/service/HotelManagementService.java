package com.tcs.hotelManagement.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.tcs.hotelManagement.model.HotelManagement;
import com.tcs.hotelManagement.model.Status;
import com.tcs.hotelManagement.repository.HotelManagementRepository;

@Service
public class HotelManagementService {

	private final HotelManagementRepository hotelManagementRepository;
	private final KafkaTemplate<String, HotelManagement> kafkaTemplate;

	public HotelManagementService(HotelManagementRepository hotelManagementRepository,
			KafkaTemplate<String, HotelManagement> kafkaTemplate) {
		this.hotelManagementRepository = hotelManagementRepository;
		this.kafkaTemplate = kafkaTemplate;
	}

	public List<HotelManagement> getAllHotels() {
		return hotelManagementRepository.findAll();
	}

	public HotelManagement saveHotelRoomDetails(HotelManagement hotelManagement) {
		return hotelManagementRepository.save(hotelManagement);
	}

	public Optional<HotelManagement> isHotelIdPresent(Long id) {
		Optional<HotelManagement> hotelManagementById = hotelManagementRepository.findById(id);
		if (hotelManagementById.isPresent()) {
			HotelManagement hotelManagement = hotelManagementById.get();
			HotelManagement hotelManagementDto = new HotelManagement(hotelManagement.getId(), hotelManagement.getName(),
					hotelManagement.getRoomNumber(), hotelManagement.getStatus(), hotelManagement.getAmount(),
					hotelManagement.getAddress(), hotelManagement.getCoordinates(), hotelManagement.getStarRating(),
					hotelManagement.getLocationScore(), hotelManagement.getGuestRating(), hotelManagement.getDescription(),
					hotelManagement.getCurrency(), hotelManagement.getBenefits());
			return Optional.of(hotelManagementDto);
		}
		return Optional.empty();
	}

	public enum RoomOutcome { NOT_FOUND, CONFLICT, OK }

	public record BookingResult(RoomOutcome outcome, BigDecimal amount) {
	}

	public BookingResult bookHotelRoom(Long id) {
		Optional<HotelManagement> hotelRoomById = hotelManagementRepository.findById(id);
		if (hotelRoomById.isEmpty()) {
			return new BookingResult(RoomOutcome.NOT_FOUND, null);
		}

		HotelManagement hotelManagement = hotelRoomById.get();
		Status hotelRoomStatus = hotelManagement.getStatus();
		BigDecimal hotelRoomAmount = hotelManagement.getAmount();

		if (hotelRoomStatus == Status.AVAILABLE) {
			hotelManagement.setStatus(Status.NOT_READY);
			hotelManagementRepository.save(hotelManagement);
			this.kafkaTemplate.send("room-ready", hotelManagement);
			return new BookingResult(RoomOutcome.OK, hotelRoomAmount);
		}
		return new BookingResult(RoomOutcome.CONFLICT, null);
	}

	@KafkaListener(topics = "room-ready")
	public void setRoomReady(HotelManagement hotelManagement) {
		hotelManagement.setStatus(Status.READY);
		hotelManagementRepository.save(hotelManagement);
		this.kafkaTemplate.send("room-ready-notification", hotelManagement);
	}

	public RoomOutcome unbookHotelRoom(Long id) {
		Optional<HotelManagement> hotelRoomById = hotelManagementRepository.findById(id);
		if (hotelRoomById.isEmpty()) {
			return RoomOutcome.NOT_FOUND;
		}
		HotelManagement hotelManagement = hotelRoomById.get();
		Status hotelRoomStatus = hotelManagement.getStatus();
		if (hotelRoomStatus == Status.BOOKED) {
			hotelManagement.setStatus(Status.AVAILABLE);
			hotelManagementRepository.save(hotelManagement);
			return RoomOutcome.OK;
		}
		return RoomOutcome.CONFLICT;
	}

	public String getAnalytics() {
		return "";
	}

	public List<HotelManagement> getKHotels(int k) {
		return null;
	}
}
