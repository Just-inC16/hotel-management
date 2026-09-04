# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Spring Boot microservices hotel booking system with seven independent Maven services plus an Angular frontend. There is no root/parent `pom.xml` — each service under its own directory is built, tested, and versioned independently.

Services (directory, Spring app name, actual port from `application.properties` — note the README's port table is stale and does not match these):

| Directory | `spring.application.name` | Port |
|---|---|---|
| `eurekaServer` | eureka-server | 8761 |
| `customer` | customer | 8080 |
| `reservation` | reservation | 8081 |
| `hotelManagement` | hotelManagement | 8082 |
| `payment` | payment | 8083 |
| `notification` | notification | 8084 |
| `apiGateway` | api-gateway | 8085 |

All services use Java 17, Spring Boot 3.2.0, Spring Cloud 2023.0.0-RC1, and register with Eureka (`eureka.client.service-url.defaultZone`, default `http://localhost:8761/eureka/` for bare-metal `mvn spring-boot:run`). Under `docker-compose.yml` this default is overridden per service via the `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` env var to `http://eureka-server:8761/eureka/` (the container name), not hardcoded to `localhost`.

## Common commands

Each service is built independently with its Maven wrapper from inside its own directory:

```bash
cd customer && ./mvnw clean package     # build one service
cd customer && ./mvnw test              # run tests for one service
cd customer && ./mvnw test -Dtest=CustomerApplicationTests   # run a single test class
cd customer && ./mvnw spring-boot:run   # run one service locally
```

`cleanFiles.sh` runs a given mvn goal across every service directory, e.g.:

```bash
./cleanFiles.sh clean
```

CI (`.github/workflows/maven.yml`) runs `mvn -B package --file pom.xml` per service on JDK 17 (temurin), triggered on push/PR to `main`.

Frontend (`fe/`, Angular 18):

```bash
cd fe && npm install
cd fe && npm start     # ng serve
cd fe && npm run build
cd fe && npm test      # ng test (Karma/Jasmine)
```

Docker: each service has its own `Dockerfile` (builds from a pre-built `target/*.jar`, so run `./cleanFiles.sh clean package -DskipTests` first). `docker-compose.yml` wires up all 7 services plus `mysql-db`: `eureka-server`, `apiGateway`, `customer`, `reservation`, `hotelManagement`, `payment`, `notification`. Each app service's Eureka `defaultZone` and (where applicable) datasource URL are injected by compose to point at container names (`eureka-server`, `mysql-db`) rather than `localhost`; `customer` and `reservation` additionally get `GATEWAY_URL=http://apiGateway:8085` for their Feign clients (see below). `mysql-db`'s 5 schemas are created on first boot via `mysql-init/01-schemas.sql` mounted to `/docker-entrypoint-initdb.d/` — if a stale volume exists from before this was wired up, run `docker-compose down -v` once to pick it up.

## Configuration and profiles

Every business service (`customer`, `hotelManagement`, `reservation`, `payment`, `notification`) uses Spring profiles via `spring.profiles.active` in its base `application.properties`, with per-profile files:
- `application-dev.properties` — local MySQL on `localhost:3306/<service>`, root/root
- `application-prod.properties` — reads `${DB_URL}`, `${DB_USERNAME}`, `${DB_PASSWORD}` from the environment
- `application-test.properties` — in-memory H2 (`jdbc:h2:mem:testdb`)

Each service has its own MySQL schema (`customer`, `hotelmanagement`, `reservation`, `payment`, `notification`), assumed to already exist on the target MySQL instance (`spring.jpa.hibernate.ddl-auto=update` handles table creation, not schema/database creation).

## Architecture

### Inter-service communication is routed through the API Gateway, not direct service discovery

Feign clients (in each service's `feign/` package) do **not** use Eureka logical service names for load-balanced calls. Instead they point at the API Gateway via `url = "${gateway.url:localhost:8085}"` with arbitrary/unused `name` attributes (e.g. `@FeignClient(name = "api-gateway1", url = "${gateway.url:localhost:8085}")`), and call gateway-routed paths like `/hotelmanagement/api/v1/hotelManagements/{id}`. The placeholder defaults to `localhost:8085` for bare-metal `mvn spring-boot:run`; `docker-compose.yml` overrides it via `GATEWAY_URL=http://apiGateway:8085` for the services that use it (`customer`, `reservation`). Spring Cloud Gateway's discovery locator (`spring.cloud.gateway.discovery.locator.enabled=true`, lower-cased) then forwards to the actual service registered in Eureka under its lower-cased `spring.application.name`. When adding or changing a Feign client, follow this same gateway-routed pattern — a parameterized URL with a `localhost:8085` fallback, not a bare literal — rather than pointing Feign directly at a service's own port.

### Mixed synchronous (Feign) and asynchronous (Kafka) communication, partially built out

`reservation` is the orchestrator for the booking flow: `ReservationController.reserveHotel()` calls `HotelManagementClient` to check/book a room, then `PaymentClient` to charge, then `NotificationClient` to notify — all synchronous Feign calls through the gateway. Several services also define Kafka producer/consumer config and `@KafkaListener` methods (e.g. `reserve-room`, `new-transaction` topics) alongside the REST/Feign path for the same entities. Kafka config is commented out or partially wired in several `application*.properties` files — check whether Kafka is actually enabled for a given service before assuming an event will be consumed, and don't assume the Kafka and Feign paths are kept in sync with each other.

### Per-service DTOs, not a shared library

There is no shared module. Each service that needs another service's data defines its own local copy of that DTO (e.g. `reservation/.../Dto/Payment.java`, `customer/.../Dto/Payment.java`, `reservation/.../Dto/HotelManagement.java`). When changing a field on an entity (e.g. `Payment`, `Notification`, `Reservation`, `HotelManagement`, `Status`), grep across all services for other copies of that DTO and update them together — the compiler will not catch a mismatch between services.

### Frontend

`fe/` is a standalone Angular 18 app (not yet wired into docker-compose or CI). Routing is in `fe/src/app/app.routes.ts`; currently has a single `hotel-management.page.ts` feature page.

## Verification Steps
After every change, always run in this order:
1. `npm run lint` — fix any lint errors before proceeding
2. `npx tsc --nocheck` — fix type errors
3. `npm test` — all tests must pass
4. `npm run build` — confirm build succeeds