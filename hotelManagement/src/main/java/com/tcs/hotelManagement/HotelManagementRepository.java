package com.tcs.hotelManagement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HotelManagementRepository extends JpaRepository<HotelManagement, Long> {
	@Query("select hotel from HotelManagement hotel where hotel.name=:name")
	HotelManagement findKHotels(@Param("name")String name );
	
}
