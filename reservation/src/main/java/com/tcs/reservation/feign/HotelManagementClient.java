package com.tcs.reservation.feign;

import java.math.BigDecimal;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import com.tcs.reservation.Dto.HotelManagement;

@Component
@FeignClient(name = "api-gateway1", url = "localhost:8085")
public interface HotelManagementClient {
	@GetMapping("/hotelmanagement/api/v1/hotelManagements/{id}")
	public ResponseEntity<HotelManagement> isHotelIdPresent(@PathVariable Long id);

	@PutMapping("/hotelmanagement/api/v1/hotelManagements/book/{id}")
	public ResponseEntity<BigDecimal> bookHotelRoom(@PathVariable Long id);
}
