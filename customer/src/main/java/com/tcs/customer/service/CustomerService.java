package com.tcs.customer.service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.tcs.customer.Dto.AuthResponse;
import com.tcs.customer.Dto.CustomerResponse;
import com.tcs.customer.Dto.CustomerUpdateRequest;
import com.tcs.customer.Dto.Notification;
import com.tcs.customer.Dto.Reservation;
import com.tcs.customer.Dto.SigninRequest;
import com.tcs.customer.Dto.SignupRequest;
import com.tcs.customer.feign.NotificationClient;
import com.tcs.customer.feign.ReservationClient;
import com.tcs.customer.model.Customer;
import com.tcs.customer.repository.CustomerRepository;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class CustomerService {

	private static final String BEARER_PREFIX = "Bearer ";

	private final CustomerRepository customerRepository;
	private final ReservationClient reservationClient;
	private final NotificationClient notifcationClient;

	public CustomerService(CustomerRepository customerRepository, ReservationClient reservationClient,
			NotificationClient notifcationClient) {
		this.customerRepository = customerRepository;
		this.reservationClient = reservationClient;
		this.notifcationClient = notifcationClient;
	}

	// Legacy/unused-by-frontend alias, kept for backward compatibility.
	public Customer registerCustomer(Customer customer) {
		return customerRepository.save(customer);
	}

	public ResponseEntity<?> getCustomerById(Long id) {
		return customerRepository.findById(id)
				.map(customer -> ResponseEntity.ok(toCustomerResponse(customer)))
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@CircuitBreaker(name = "signup", fallbackMethod = "signupFallback")
	public ResponseEntity<?> signup(SignupRequest request) {
		String firstName = trim(request.getFirstName());
		String lastName = trim(request.getLastName());
		String email = trim(request.getEmail());
		String password = request.getPassword() == null ? "" : request.getPassword();
		String role = (request.getRole() == null || request.getRole().isBlank()) ? "customer" : request.getRole();

		if (!isValidName(firstName) || !isValidName(lastName)) {
			return ResponseEntity.badRequest().body(Map.of("error", "First and last name must contain letters only."));
		}
		if (!isEmailFormat(email)) {
			return ResponseEntity.badRequest().body(Map.of("error", "Email must be in proper email format(@)"));
		}
		if (!isPasswordLengthOfEight(password)) {
			return ResponseEntity.badRequest().body(Map.of("error", "Password must have at least 8 characters"));
		}
		if (!(role.equals("customer") || role.equals("manager"))) {
			return ResponseEntity.badRequest().body(Map.of("error", "The role must be manager or customer."));
		}
		if (customerRepository.findByEmail(email).isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "An account with that email already exists."));
		}

		Customer newCustomer = new Customer();
		newCustomer.setFirstName(firstName);
		newCustomer.setLastName(lastName);
		newCustomer.setEmail(email);
		newCustomer.setPassword(password);
		newCustomer.setRole(role);
		newCustomer.setToken(UUID.randomUUID().toString());
		customerRepository.save(newCustomer);

		// Communicate with notification service
		final String ENTITY = "Customer";
		final String MESSAGE = "Successful customer signup";
		this.createNewNotification(ENTITY, MESSAGE);

		return ResponseEntity.ok(toAuthResponse(newCustomer));
	}

	public ResponseEntity<?> signupFallback(SignupRequest request, Throwable throwable) {
		return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "Something went wrong when signing in :("));
	}

	public ResponseEntity<?> signin(SigninRequest request) {
		String email = trim(request.getEmail());
		String password = request.getPassword() == null ? "" : request.getPassword();

		if (!isEmailFormat(email)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password."));
		}

		Customer user = customerRepository.findByEmailPassword(email, password);
		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password."));
		}

		user.setToken(UUID.randomUUID().toString());
		customerRepository.save(user);

		// Communicate with notification service
		final String ENTITY = "Customer";
		final String MESSAGE = "Successful customer signedIn";
		this.createNewNotification(ENTITY, MESSAGE);

		return ResponseEntity.ok(toAuthResponse(user));
	}

	public void createNewNotification(String entity, String message) {
		Notification newNotification = new Notification(entity, message);
		this.notifcationClient.sendNotification(newNotification);
	}

	// Assume customer exist
	@CircuitBreaker(name = "reserve", fallbackMethod = "fallbackMethod")
	public ResponseEntity<Notification> reservation(Reservation reservation) {
		return reservationClient.reserveHotel(reservation);
	}

	public String fallbackMethod() {
		return "Something went wrong :(";
	}

	// Look for @ & characters after @(gmail.com)
	public Boolean isEmailFormat(String email) {
		return email != null && email.contains("@") && email.indexOf("@") < email.length();
	}

	public Boolean isPasswordLengthOfEight(String password) {
		final Integer AT_LEAST_EIGHT_CHARACTERS = 8;
		return password != null && password.length() >= AT_LEAST_EIGHT_CHARACTERS;
	}

	public Boolean isValidName(String name) {
		return name != null && !name.isBlank() && name.matches("^[\\p{L} '\\-]+$");
	}

	public ResponseEntity<?> updateProfile(String authHeader, long id, CustomerUpdateRequest update) {
		Optional<Customer> customerOpt = customerRepository.findById(id);
		if (customerOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		Customer customer = customerOpt.get();

		String token = extractToken(authHeader);
		if (token == null || customer.getToken() == null || !customer.getToken().equals(token)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or missing authorization token."));
		}

		if (update.getPaymentLast4() != null && !update.getPaymentLast4().matches("\\d{4}")) {
			return ResponseEntity.badRequest().body(Map.of("error", "paymentLast4 must be exactly 4 digits."));
		}
		if (update.getPaymentExpiry() != null && !update.getPaymentExpiry().matches("\\d{2}/\\d{2}")) {
			return ResponseEntity.badRequest().body(Map.of("error", "paymentExpiry must match MM/YY."));
		}

		if (update.getFirstName() != null) {
			customer.setFirstName(trim(update.getFirstName()));
		}
		if (update.getLastName() != null) {
			customer.setLastName(trim(update.getLastName()));
		}
		if (update.getPhone() != null) {
			customer.setPhone(trim(update.getPhone()));
		}
		if (update.getPaymentCardholderName() != null) {
			customer.setPaymentCardholderName(trim(update.getPaymentCardholderName()));
		}
		if (update.getPaymentCardBrand() != null) {
			customer.setPaymentCardBrand(trim(update.getPaymentCardBrand()));
		}
		if (update.getPaymentLast4() != null) {
			customer.setPaymentLast4(update.getPaymentLast4());
		}
		if (update.getPaymentExpiry() != null) {
			customer.setPaymentExpiry(update.getPaymentExpiry());
		}

		customerRepository.save(customer);
		return ResponseEntity.ok(toCustomerResponse(customer));
	}

	private String extractToken(String authHeader) {
		if (authHeader == null) {
			return null;
		}
		return authHeader.startsWith(BEARER_PREFIX) ? authHeader.substring(BEARER_PREFIX.length()) : authHeader;
	}

	private String trim(String value) {
		return value == null ? "" : value.trim();
	}

	private AuthResponse toAuthResponse(Customer customer) {
		return new AuthResponse(customer.getId(), customer.getFirstName(), customer.getLastName(),
				customer.getEmail(), customer.getRole(), customer.getToken());
	}

	private CustomerResponse toCustomerResponse(Customer customer) {
		return new CustomerResponse(customer.getId(), customer.getFirstName(), customer.getLastName(),
				customer.getEmail(), customer.getRole(), customer.getPhone(), customer.getPaymentCardholderName(),
				customer.getPaymentCardBrand(), customer.getPaymentLast4(), customer.getPaymentExpiry());
	}
}
