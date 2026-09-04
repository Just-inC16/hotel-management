package com.tcs.customer;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
//import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.client.RestTemplate;

import com.tcs.customer.Dto.Notification;
import com.tcs.customer.Dto.Reservation;
import com.tcs.customer.exceptions.EmailException;
import com.tcs.customer.exceptions.NameException;
import com.tcs.customer.exceptions.PasswordException;
import com.tcs.customer.exceptions.RoleException;
import com.tcs.customer.feign.NotificationClient;
import com.tcs.customer.feign.ReservationClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

	private CustomerRepository customerRepository;
//	private final RestTemplate restTemplate;
	private ReservationClient reservationClient;
	private NotificationClient notifcationClient;
//	private KafkaTemplate<String, Reservation> kafkaTemplate;

//	public CustomerController(CustomerRepository customerRepository, RestTemplate restTemplate,
//			ReservationClient reservationClient, KafkaTemplate<String, Reservation> kafkaTemplate,NotificationClient notifcationClient ) {
//		this.customerRepository = customerRepository;
//		this.restTemplate = restTemplate;
//		this.reservationClient = reservationClient;
//		this.kafkaTemplate = kafkaTemplate;
//		this.notifcationClient=notifcationClient;
//	}
	public CustomerController(CustomerRepository customerRepository,ReservationClient reservationClient,NotificationClient notifcationClient) {
		this.customerRepository = customerRepository;
		this.reservationClient = reservationClient;
		this.notifcationClient=notifcationClient;
	}

	// Register the customer
	@PostMapping("/register")
	public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
		return ResponseEntity.ok(customerRepository.save(customer));
	}

	// What happens if it doesn't exist? 500 internal server error
	@GetMapping("/{id}")
	public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
		Customer customerById = customerRepository.getReferenceById(id);
		Customer CustomerDto = new Customer(customerById.getId(), customerById.getName(), customerById.getEmail(),
				customerById.getPassword(),customerById.getRole());
		return ResponseEntity.ok(CustomerDto);
	}

	@CircuitBreaker(name = "signup", fallbackMethod = "fallbackMethod")
	@PostMapping("/signup")
	public String signup(@RequestBody Customer newCustomer, @RequestParam(required=true)String role) {
		try {
			// Verify data is suitable
			String name = newCustomer.getName();
			String email = newCustomer.getEmail();

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
			if(!(role.equals("customer") || role.equals("manager"))) {
				throw new RoleException();
			}
			//Add the customer or manager type
			newCustomer.setRole(role);
			// Create the customer
			customerRepository.save(newCustomer);

			// Communicate with notification service
			final String ENTITY = "Customer";
			final String MESSAGE = "Successful customer signup";
//			HttpEntity<String> requestBody = createRequestBody(ENTITY, MESSAGE);
//			return restTemplate.postForObject("http://localhost:8084/api/v1/notifications/send", requestBody,
//					String.class);
			this.createNewNotification( ENTITY, MESSAGE);
			return newCustomer.toString();
		} catch (NameException e) {
			e.printStackTrace();
		} catch (EmailException e) {
			e.printStackTrace();
		} catch (PasswordException e) {
			e.printStackTrace();
		} catch (RoleException e) {
			e.printStackTrace();
		}
		return "Unsuccessful signup!";
	}
	@GetMapping("/signin")
	public String signin(@RequestBody Customer newCustomer) {
		try {
			// Verify data is suitable
			
			String email = newCustomer.getEmail();
			String password = newCustomer.getPassword();
			Customer user = customerRepository.findByEmailPassword(email, password);
			if (!isEmailFormat(email)) {
				throw new EmailException();
			}
			if (!isPasswordLengthOfEight(email)) {
				throw new PasswordException();
			}
			if(user == null) {
				throw new PasswordException("Wrong password");
			}
			
			// Communicate with notification service
			final String ENTITY = "Customer";
			final String MESSAGE = "Successful customer signedIn";
//			HttpEntity<String> requestBody = createRequestBody(ENTITY, MESSAGE);
//			return restTemplate.postForObject("http://localhost:8084/api/v1/notifications/send", requestBody,
//					String.class);
			this.createNewNotification( ENTITY, MESSAGE);
			return user.toString();
		} catch (EmailException e) {
			System.out.println(e.toString());
		} catch (PasswordException e) {
			System.out.println(e.toString());
		}
		return "Unsuccessful signin!";
	}
	public void createNewNotification(String entity, String message) {
		Notification newNotification= new Notification(entity, message);
		this.notifcationClient.sendNotification(newNotification);
	}
	// Assume customer exist
	@CircuitBreaker(name = "reserve", fallbackMethod = "fallbackMethod")
	@PostMapping("/reserve")
	public ResponseEntity<Notification> reservation(@RequestBody Reservation reservation) {
		return reservationClient.reserveHotel(reservation);
//		this.kafkaTemplate.send("reserve-room", reservation);
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
	@PatchMapping("/{id}")
	public Customer updateProfile(@PathVariable("id")long id,@RequestBody Customer newInformation) {
		Customer user= this.getCustomerById(id).getBody();
		if (newInformation.getName()!=null){
			user.setName(newInformation.getName());
			customerRepository.save(user);
			return user;
		}
		return null;
	}
//	public HttpEntity<String> createRequestBody(String entity, String message) {
//		// Create headers with the content type
//		HttpHeaders headers = new HttpHeaders();
//		headers.setContentType(MediaType.APPLICATION_JSON);
//
//		// Create the request body (replace this with your actual JSON or other content)
//		String requestBody = "{ \"entity\":\"" + entity + "\" , \"message\":\"" + message + "\" }";
//
//		// Create an HttpEntity with the request body and headers
//		HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
//		return requestEntity;
//	}
	
}