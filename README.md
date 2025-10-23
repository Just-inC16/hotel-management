# 🏨 Hotel Booking Microservices Application

This project is a **Hotel Management System** built using a **microservices architecture**. It consists of **7 independent services** that communicate through REST APIs, registered under a **Eureka Server** and accessed via an **API Gateway**.

The application demonstrates **service discovery**, **load balancing**, **fault tolerance (circuit breaker)**, and **database management** — providing a real-world example of scalable, cloud-ready design (deployable on AWS).

---

## 🚀 Features

- **Customer Service** – Manages customer registration, authentication, and profiles  
- **Hotel Management Service** – Handles hotel details, room availability, and pricing  
- **Reservation Service** – Allows customers to reserve available rooms  
- **Payment Service** – Processes and validates customer payments  
- **Notification Service** – Sends notifications after successful payments  
- **API Gateway** – Routes external requests to internal microservices securely  
- **Eureka Server** – Provides service discovery for all registered microservices  

---

## 🏗️ Architecture Overview

```plaintext
                       +----------------------+
                       |      API Gateway     |
                       +----------+-----------+
                                  |
        +-------------------------+--------------------------+
        |            |             |             |            |
+-------v--+   +------v-------+ +---v--------+ +---v--------+
| Customer |   | Hotel Mgmt   | | Reservation| |  Payment   |
+-------+--+   +------+-------+ +----+-------+ +-----+------+
        |              |              |              |
        |              |              |              |
        |              |              |              |
        |         +----v----+         |         +----v----+
        |         | Database|         |         | Database|
        |         +---------+         |         +---------+
        |                             |
        +-----------------------------+
                     |
              +------v-------+
              | Notification |
              +------+-------+
                     |
                     v
            Sends Email/SMS Notification
```

| Service Name                 | Port   | Description                                       |
| ---------------------------- | ------ | ------------------------------------------------- |
| **Eureka Server**            | `8761` | Service registry for all microservices            |
| **API Gateway**              | `8080` | Entry point routing requests to microservices     |
| **Customer Service**         | `8081` | Manages customer data and authentication          |
| **Hotel Management Service** | `8082` | Handles hotels, rooms, and availability           |
| **Reservation Service**      | `8083` | Manages reservations between customers and hotels |
| **Payment Service**          | `8084` | Handles transactions and payment verification     |
| **Notification Service**     | `8085` | Sends booking/payment confirmation messages       |

## 🧩 Technologies Used

- **Spring Boot** (Microservices Framework)  
- **Spring Cloud Netflix**
  - **Eureka Server** (Service Discovery)  
  - **Spring Cloud Gateway** (API Gateway)  
  - **Hystrix / Resilience4j** (Circuit Breaker)  
- **Spring Data JPA** (Database Management)  
- **MySQL / PostgreSQL** (Relational Databases)  
- **Lombok**, **OpenFeign**, **RestTemplate**  
- **Docker** (Optional for containerization)  
- **AWS RDS / ECS** (for cloud deployment)  

---

## 💡 Example Flow

**Scenario:** A customer books a hotel room.

1. The client (frontend) sends a request to **API Gateway** → `/api/reservations/create`
2. The **API Gateway** routes the request to **Reservation Service**
3. **Reservation Service**:
   - Calls **Hotel Management Service** to verify room availability  
   - Calls **Customer Service** to fetch customer details  
   - Creates a reservation record in its database
4. **Reservation Service** calls **Payment Service** to handle payment  
5. **Payment Service**:
   - Processes the payment  
   - Sends confirmation to **Notification Service**
6. **Notification Service** sends an email/SMS to the customer confirming the booking  

✅ If any service fails, the **Circuit Breaker** triggers fallback logic (e.g., retry or return cached data).

---

## 🧠 Example API Usage

### **POST /api/customers/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}

