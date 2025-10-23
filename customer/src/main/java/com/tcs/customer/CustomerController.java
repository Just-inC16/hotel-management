package com.tcs.customer;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.tcs.customer.Dto.Notification;
import com.tcs.customer.Dto.Reservation;
import com.tcs.customer.exceptions.EmailException;
import com.tcs.customer.exceptions.NameException;
import com.tcs.customer.exceptions.PasswordException;
import com.tcs.customer.feign.ReservationClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

	private CustomerRepository customerRepository;
	private final RestTemplate restTemplate;
	private ReservationClient reservationClient;

	public CustomerController(CustomerRepository customerRepository, RestTemplate restTemplate,
			ReservationClient reservationClient) {
		this.customerRepository = customerRepository;
		this.restTemplate = restTemplate;
		this.reservationClient = reservationClient;
	}

	// Register the customer
	@PostMapping("/register")
	public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
		return ResponseEntity.ok(customerRepository.save(customer));
	}

	// What happens if it doesn't exist? 500 internal server error
	@GetMapping("/{id}")
	public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
		Customer customerById = customerRepository.getReferenceById(id);
		Customer CustomerDto = new Customer(customerById.getId(), customerById.getName(), customerById.getEmail(),
				customerById.getPassword());
		return ResponseEntity.ok(CustomerDto);
	}

	@CircuitBreaker(name = "signup", fallbackMethod = "fallbackMethod")
	@PostMapping("/signup")
	public String signup(@RequestBody Customer newCustomer) {
		try {
			// Verify data is suitable
			String name = newCustomer.getName();
			String email = newCustomer.getEmail();
			String password = newCustomer.getPassword();

			// Check for exceptions
			if (name == "" || !isAllLetters(name)) {
				throw new NameException();
			}
			if (!isEmailFormat(email)) {
				throw new EmailException();
			}
			if (!isPasswordLengthOfEight(email)) {
				throw new PasswordException();
			}
			// Create the customer
			customerRepository.save(newCustomer);

			// Communicate with notification service
			final String ENTITY = "Customer";
			final String MESSAGE = "Successful customer signup";
			HttpEntity<String> requestBody = createRequestBody(ENTITY, MESSAGE);
			return restTemplate.postForObject("http://localhost:8084/api/v1/notifications/send", requestBody,
					String.class);
		} catch (NameException e) {
			System.out.println(e.toString());
		} catch (EmailException e) {
			System.out.println(e.toString());
		} catch (PasswordException e) {
			System.out.println(e.toString());
		}
		return "Unsuccessful signup!";
	}

	// Assume customer exist
	@CircuitBreaker(name = "reserve", fallbackMethod = "fallbackMethod")
	@PostMapping("/reserve")
	public ResponseEntity<Notification> reservation(@RequestBody Reservation reservation) {
		return reservationClient.reserveHotel(reservation);
	}

	public String fallbackMethod() {
		return "Something went wrong :(";
	}

	public Boolean isAllLetters(String name) {
		for (char character : name.toCharArray()) {
			if (!('a' <= character && character <= 'z')) {
				return false;
			}
		}
		return true;
	}

	// Look for @ & characters after @(gmail.com)
	public Boolean isEmailFormat(String email) {
		return email.contains("@") && email.indexOf("@") < email.length();
	}

	public Boolean isPasswordLengthOfEight(String password) {
		final Integer AT_LEAST_EIGHT_CHARACTERS = 8;
		return password.length() >= AT_LEAST_EIGHT_CHARACTERS;
	}

	public HttpEntity<String> createRequestBody(String entity, String message) {
		// Create headers with the content type
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		// Create the request body (replace this with your actual JSON or other content)
		String requestBody = "{ \"entity\":\"" + entity + "\" , \"message\":\"" + message + "\" }";

		// Create an HttpEntity with the request body and headers
		HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
		return requestEntity;
	}

}