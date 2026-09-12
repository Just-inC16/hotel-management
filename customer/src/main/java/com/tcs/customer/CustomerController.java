package com.tcs.customer;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.customer.Dto.Notification;
import com.tcs.customer.Dto.Reservation;
import com.tcs.customer.service.CustomerService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

	private CustomerService customerService;

	public CustomerController(CustomerService customerService) {
		this.customerService = customerService;
	}

	// Register the customer
	@PostMapping("/register")
	public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
		return ResponseEntity.ok(customerService.registerCustomer(customer));
	}

	// What happens if it doesn't exist? 500 internal server error
	@GetMapping("/{id}")
	public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
		return ResponseEntity.ok(customerService.getCustomerById(id));
	}

	@CircuitBreaker(name = "signup", fallbackMethod = "fallbackMethod")
	@PostMapping("/signup")
	public String signup(@RequestBody Customer newCustomer, @RequestParam(required = true) String role) {
		return customerService.signup(newCustomer, role);
	}

	@GetMapping("/signin")
	public String signin(@RequestBody Customer newCustomer) {
		return customerService.signin(newCustomer);
	}

	// Assume customer exist
	@CircuitBreaker(name = "reserve", fallbackMethod = "fallbackMethod")
	@PostMapping("/reserve")
	public ResponseEntity<Notification> reservation(@RequestBody Reservation reservation) {
		return customerService.reservation(reservation);
	}

	public String fallbackMethod() {
		return "Something went wrong :(";
	}

	@PatchMapping("/{id}")
	public Customer updateProfile(@PathVariable("id") long id, @RequestBody Customer newInformation) {
		return customerService.updateProfile(id, newInformation);
	}
}
