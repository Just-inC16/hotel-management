package com.tcs.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
	@Query("SELECT user FROM Customer user WHERE user.email = :email and user.password= :password ")
	Customer findByEmailPassword(@Param("email") String email,@Param("password") String password);
}
