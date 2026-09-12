package com.tcs.reservation.service;

<<<<<<< Updated upstream:reservation/src/main/java/com/tcs/reservation/service/ReservationService.java
import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
=======
>>>>>>> Stashed changes:reservation/src/main/java/com/tcs/reservation/ReservationController.java
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.tcs.reservation.Dto.Notification;
import com.tcs.reservation.Dto.Payment;
<<<<<<< Updated upstream:reservation/src/main/java/com/tcs/reservation/service/ReservationService.java
import com.tcs.reservation.feign.HotelManagementClient;
import com.tcs.reservation.feign.NotificationClient;
import com.tcs.reservation.feign.PaymentClient;
import com.tcs.reservation.model.Reservation;
import com.tcs.reservation.repository.ReservationRepository;
=======
import com.tcs.reservation.service.ReservationService;
>>>>>>> Stashed changes:reservation/src/main/java/com/tcs/reservation/ReservationController.java

@Service
public class ReservationService {

<<<<<<< Updated upstream:reservation/src/main/java/com/tcs/reservation/service/ReservationService.java
	private final ReservationRepository reservationRepository;
	private final HotelManagementClient hotelManagementClient;
	private final PaymentClient paymentClient;
	private final NotificationClient notificationClient;

	public ReservationService(ReservationRepository reservationRepository,
			HotelManagementClient hotelManagementClient, PaymentClient paymentClient,
			NotificationClient notificationClient) {
		this.reservationRepository = reservationRepository;
		this.hotelManagementClient = hotelManagementClient;
		this.paymentClient = paymentClient;
		this.notificationClient = notificationClient;
	}

	public Reservation makeReservation(Reservation reservation) {
		return reservationRepository.save(reservation);
	}

	public Reservation getReservationById(Long id) {
		Reservation reservationById = reservationRepository.getReferenceById(id);
		return new Reservation(reservationById.getId(), reservationById.getCustomerId(),
				reservationById.getHotelId(), reservationById.getStartDate(), reservationById.getEndDate());
	}

	public List<Reservation> getReservationsByCustomer(Long customerId) {
		return reservationRepository.findByCustomerIdOrderByStartDateDesc(customerId);
	}

	public ResponseEntity<Notification> reserveHotel(Reservation reservation) {
		Long hotelId = reservation.getHotelId();
		Long customerId = reservation.getCustomerId();
		HotelManagement isHotelPresent = hotelManagementClient.isHotelIdPresent(hotelId).getBody();
		// Check if hotel room is present
		if (isHotelPresent != null) {
			ResponseEntity<BigDecimal> hotelRoomAmountResponseEntity = hotelManagementClient.bookHotelRoom(hotelId);
			if (hotelRoomAmountResponseEntity.getStatusCode() == HttpStatus.OK) {
				BigDecimal hotelRoomAmount = hotelRoomAmountResponseEntity.getBody();
				Payment payment = new Payment(customerId, hotelRoomAmount);
				paymentClient.makePayment(payment);

				reservationRepository.save(reservation);
				final String ENTITY = "Reservation";
				final String MESSAGE = "Successful booking of hotel room";
				Notification notification = new Notification(ENTITY, MESSAGE);
				return notificationClient.sendNotification(notification);
			} else {
				return ResponseEntity.status(409).build();
			}
		} else {
			return ResponseEntity.status(409).build();
		}
	}

	public ResponseEntity<Payment> sendPayment(Payment payment) {
		return paymentClient.makePayment(payment);
	}

	public ResponseEntity<Notification> sendNotification(Notification notification) {
		return notificationClient.sendNotification(notification);
=======
	private ReservationService reservationService;

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
>>>>>>> Stashed changes:reservation/src/main/java/com/tcs/reservation/ReservationController.java
	}

	@KafkaListener(topics = "reserve-room")
	public String getNotifications(Reservation reservation) {
<<<<<<< Updated upstream:reservation/src/main/java/com/tcs/reservation/service/ReservationService.java
		System.out.println("Recieved account event" + reservation.toString());

		return "Successful" + reservation.toString();
=======
		return reservationService.consumeReservation(reservation);
>>>>>>> Stashed changes:reservation/src/main/java/com/tcs/reservation/ReservationController.java
	}
}
