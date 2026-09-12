package com.tcs.reservation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tcs.reservation.model.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

	List<Reservation> findByCustomerIdOrderByStartDateDesc(Long customerId);

}
