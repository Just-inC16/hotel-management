package com.tcs.customer;

import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.tcs.customer.Dto.Notification;
import com.tcs.customer.feign.NotificationClient;
import com.tcs.customer.feign.ReservationClient;
import com.tcs.customer.model.Customer;
import com.tcs.customer.repository.CustomerRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerControllerTest {

	// @FeignClient defaults to primary=true, and a bare @MockBean (no explicit name)
	// registers a *second*, non-primary bean instead of replacing it - so autowiring
	// elsewhere (e.g. CustomerController's constructor) would still get the real client.
	// Naming the mock bean after the FeignClientFactoryBean-registered bean name
	// (the interface's fully qualified name) makes @MockBean replace it correctly.
	@MockBean(name = "com.tcs.customer.feign.NotificationClient")
	private NotificationClient notificationClient;

	@MockBean(name = "com.tcs.customer.feign.ReservationClient")
	private ReservationClient reservationClient;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private CustomerRepository customerRepository;

	@BeforeEach
	void setUp() {
		customerRepository.deleteAll();
		when(notificationClient.sendNotification(any())).thenReturn(ResponseEntity.ok(new Notification("Customer", "ok")));
	}

	private String signupBody(String email) {
		return """
				{
				  "firstName": "Jane",
				  "lastName": "Doe",
				  "email": "%s",
				  "password": "password123",
				  "role": "customer"
				}
				""".formatted(email);
	}

	@Test
	void signupSucceedsAndReturnsToken() throws Exception {
		mockMvc.perform(post("/api/v1/customers/signup")
						.contentType(MediaType.APPLICATION_JSON)
						.content(signupBody("jane.doe@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("jane.doe@example.com"))
				.andExpect(jsonPath("$.firstName").value("Jane"))
				.andExpect(jsonPath("$.token", not(blankOrNullString())));
	}

	@Test
	void signupWithDuplicateEmailReturnsConflict() throws Exception {
		mockMvc.perform(post("/api/v1/customers/signup")
						.contentType(MediaType.APPLICATION_JSON)
						.content(signupBody("dup@example.com")))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/v1/customers/signup")
						.contentType(MediaType.APPLICATION_JSON)
						.content(signupBody("dup@example.com")))
				.andExpect(status().isConflict());
	}

	@Test
	void signinWithWrongPasswordReturnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/v1/customers/signup")
						.contentType(MediaType.APPLICATION_JSON)
						.content(signupBody("wrongpass@example.com")))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/v1/customers/signin")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "email": "wrongpass@example.com", "password": "incorrectPassword" }
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void signinWithCorrectCredentialsReturnsToken() throws Exception {
		mockMvc.perform(post("/api/v1/customers/signup")
						.contentType(MediaType.APPLICATION_JSON)
						.content(signupBody("signin@example.com")))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/v1/customers/signin")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "email": "signin@example.com", "password": "password123" }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("signin@example.com"))
				.andExpect(jsonPath("$.token", not(blankOrNullString())));
	}

	@Test
	void patchWithoutTokenReturnsUnauthorized() throws Exception {
		Customer customer = new Customer();
		customer.setFirstName("Pat");
		customer.setLastName("Smith");
		customer.setEmail("patch-no-token@example.com");
		customer.setPassword("password123");
		customer.setRole("customer");
		customer.setToken("real-token");
		customer = customerRepository.save(customer);

		mockMvc.perform(patch("/api/v1/customers/{id}", customer.getId())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "firstName": "New" }
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void patchWithWrongTokenReturnsUnauthorized() throws Exception {
		Customer customer = new Customer();
		customer.setFirstName("Pat");
		customer.setLastName("Smith");
		customer.setEmail("patch-wrong-token@example.com");
		customer.setPassword("password123");
		customer.setRole("customer");
		customer.setToken("real-token");
		customer = customerRepository.save(customer);

		mockMvc.perform(patch("/api/v1/customers/{id}", customer.getId())
						.header("Authorization", "Bearer not-the-real-token")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "firstName": "New" }
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void patchWithCorrectTokenUpdatesProfileAndPayment() throws Exception {
		Customer customer = new Customer();
		customer.setFirstName("Pat");
		customer.setLastName("Smith");
		customer.setEmail("patch-ok@example.com");
		customer.setPassword("password123");
		customer.setRole("customer");
		customer.setToken("real-token");
		customer = customerRepository.save(customer);

		mockMvc.perform(patch("/api/v1/customers/{id}", customer.getId())
						.header("Authorization", "Bearer real-token")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "firstName": "Patricia",
								  "paymentCardholderName": "Patricia Smith",
								  "paymentCardBrand": "VISA",
								  "paymentLast4": "4242",
								  "paymentExpiry": "12/29"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.firstName").value("Patricia"))
				.andExpect(jsonPath("$.paymentLast4").value("4242"))
				.andExpect(jsonPath("$.password").doesNotExist())
				.andExpect(jsonPath("$.token").doesNotExist());
	}

	@Test
	void getCustomerByIdExcludesPasswordAndToken() throws Exception {
		Customer customer = new Customer();
		customer.setFirstName("Priv");
		customer.setLastName("Ate");
		customer.setEmail("private@example.com");
		customer.setPassword("password123");
		customer.setRole("customer");
		customer.setToken("secret-token");
		customer = customerRepository.save(customer);

		mockMvc.perform(get("/api/v1/customers/{id}", customer.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("private@example.com"))
				.andExpect(jsonPath("$.password").doesNotExist())
				.andExpect(jsonPath("$.token").doesNotExist());
	}
}
