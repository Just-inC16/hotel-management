package com.tcs.reservation;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.tcs.reservation.model.Reservation;
import com.tcs.reservation.repository.ReservationRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReservationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ReservationRepository reservationRepository;

	@BeforeEach
	void setUp() {
		reservationRepository.deleteAll();

		reservationRepository.save(new Reservation(null, 1L, 100L, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5)));
		reservationRepository.save(new Reservation(null, 1L, 200L, LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 5)));
		reservationRepository.save(new Reservation(null, 2L, 300L, LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 5)));
	}

	@Test
	void getReservationsByCustomer_returnsOnlyThatCustomersReservations_orderedByStartDateDesc() throws Exception {
		mockMvc.perform(get("/api/v1/reservations/customer/1"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(2)))
			.andExpect(jsonPath("$[0].customerId").value(1))
			.andExpect(jsonPath("$[0].hotelId").value(200))
			.andExpect(jsonPath("$[1].customerId").value(1))
			.andExpect(jsonPath("$[1].hotelId").value(100));
	}

	@Test
	void getReservationsByCustomer_returnsEmptyListForUnknownCustomer() throws Exception {
		mockMvc.perform(get("/api/v1/reservations/customer/999"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(0)));
	}

}
