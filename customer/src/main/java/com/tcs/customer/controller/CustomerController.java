package com.tcs.customer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.customer.Dto.CustomerUpdateRequest;
import com.tcs.customer.Dto.Notification;
import com.tcs.customer.Dto.Reservation;
import com.tcs.customer.Dto.SigninRequest;
import com.tcs.customer.Dto.SignupRequest;
import com.tcs.customer.model.Customer;
import com.tcs.customer.service.CustomerService;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

	private final CustomerService customerService;

	public CustomerController(CustomerService customerService) {
		this.customerService = customerService;
	}

	// Legacy/unused-by-frontend alias, kept for backward compatibility.
	@PostMapping("/register")
	public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
		return ResponseEntity.ok(customerService.registerCustomer(customer));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
		return customerService.getCustomerById(id);
	}

	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
		return customerService.signup(request);
	}

	@PostMapping("/signin")
	public ResponseEntity<?> signin(@RequestBody SigninRequest request) {
		return customerService.signin(request);
	}

	// Assume customer exist
	@PostMapping("/reserve")
	public ResponseEntity<Notification> reservation(@RequestBody Reservation reservation) {
		return customerService.reservation(reservation);
	}

	@PatchMapping("/{id}")
	public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
			@PathVariable("id") long id, @RequestBody CustomerUpdateRequest update) {
		return customerService.updateProfile(authHeader, id, update);
	}
}
