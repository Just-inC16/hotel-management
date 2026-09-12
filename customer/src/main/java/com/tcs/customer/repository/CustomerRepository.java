package com.tcs.customer.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tcs.customer.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
	@Query("SELECT user FROM Customer user WHERE user.email = :email and user.password= :password ")
	Customer findByEmailPassword(@Param("email") String email,@Param("password") String password);

	Optional<Customer> findByEmail(String email);
}
