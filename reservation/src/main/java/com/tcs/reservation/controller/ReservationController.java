package com.tcs.reservation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.reservation.Dto.Notification;
import com.tcs.reservation.Dto.Payment;
import com.tcs.reservation.model.Reservation;
import com.tcs.reservation.service.ReservationService;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {

	private final ReservationService reservationService;

	public ReservationController(ReservationService reservationService) {
		this.reservationService = reservationService;
	}

	@PostMapping
	public ResponseEntity<?> makeReservation(@RequestBody Reservation reservation) {
		return ResponseEntity.ok(reservationService.makeReservation(reservation));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getReservationById(@PathVariable Long id) {
		return ResponseEntity.ok(reservationService.getReservationById(id));
	}

	@GetMapping("/customer/{customerId}")
	public ResponseEntity<List<Reservation>> getReservationsByCustomer(@PathVariable Long customerId) {
		return ResponseEntity.ok(reservationService.getReservationsByCustomer(customerId));
	}

	@PostMapping("/reserveHotel")
	public ResponseEntity<Notification> reserveHotel(@RequestBody Reservation reservation) {
		return reservationService.reserveHotel(reservation);
	}

	@PostMapping("/sendPayment")
	public ResponseEntity<Payment> sendPayment(@RequestBody Payment payment) {
		return reservationService.sendPayment(payment);
	}

	@PostMapping("/sendNotification")
	public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
		return reservationService.sendNotification(notification);
	}
}
