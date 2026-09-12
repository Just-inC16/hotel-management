package com.tcs.hotelManagement;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tcs.hotelManagement.model.Address;
import com.tcs.hotelManagement.model.Coordinates;
import com.tcs.hotelManagement.model.HotelManagement;
import com.tcs.hotelManagement.model.Status;
import com.tcs.hotelManagement.repository.HotelManagementRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HotelManagementControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private HotelManagementRepository hotelManagementRepository;

	@Autowired
	private ObjectMapper objectMapper;

	@BeforeEach
	void cleanUp() {
		hotelManagementRepository.deleteAll();
	}

	private HotelManagement sampleHotel(String name) {
		HotelManagement hotel = new HotelManagement();
		hotel.setName(name);
		hotel.setRoomNumber(101);
		hotel.setStatus(Status.AVAILABLE);
		hotel.setAmount(new BigDecimal("199.99"));
		hotel.setAddress(new Address("123 Main St", "Metropolis", "NY", "10001", "US"));
		hotel.setCoordinates(new Coordinates(40.7128, -74.0060));
		hotel.setStarRating(4);
		hotel.setLocationScore(5);
		hotel.setGuestRating(4.5);
		hotel.setDescription("A fine place to stay.");
		hotel.setCurrency("USD");
		hotel.setBenefits(List.of("Free WiFi", "Pool"));
		return hotel;
	}

	@Test
	void listAllReturnsSavedHotelsWithNewFields() throws Exception {
		hotelManagementRepository.save(sampleHotel("Grand Hotel"));
		hotelManagementRepository.save(sampleHotel("Budget Inn"));

		mockMvc.perform(get("/api/v1/hotelManagements"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(2)))
			.andExpect(jsonPath("$[*].name", containsInAnyOrder("Grand Hotel", "Budget Inn")))
			.andExpect(jsonPath("$[0].address.city").exists())
			.andExpect(jsonPath("$[0].starRating").exists())
			.andExpect(jsonPath("$[0].benefits").isArray());
	}

	@Test
	void postRoundTripsAddressCoordinatesAndBenefits() throws Exception {
		HotelManagement hotel = sampleHotel("Seaside Resort");

		mockMvc.perform(post("/api/v1/hotelManagements")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(hotel)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name").value("Seaside Resort"))
			.andExpect(jsonPath("$.address.line1").value("123 Main St"))
			.andExpect(jsonPath("$.address.city").value("Metropolis"))
			.andExpect(jsonPath("$.coordinates.latitude").value(40.7128))
			.andExpect(jsonPath("$.locationScore").value(5))
			.andExpect(jsonPath("$.benefits", hasSize(2)))
			.andExpect(jsonPath("$.benefits", containsInAnyOrder("Free WiFi", "Pool")));
	}

	@Test
	void getByIdReturnsFullHotelDetails() throws Exception {
		HotelManagement saved = hotelManagementRepository.save(sampleHotel("Lakeview Lodge"));

		mockMvc.perform(get("/api/v1/hotelManagements/{id}", saved.getId()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.name").value("Lakeview Lodge"))
			.andExpect(jsonPath("$.guestRating").value(4.5))
			.andExpect(jsonPath("$.currency").value("USD"))
			.andExpect(jsonPath("$.benefits", hasSize(2)));
	}
}
