# # ---------- Stage 1: Build ----------
# FROM maven:3.9.6-eclipse-temurin-17 AS build

# WORKDIR /app

# # Copy pom and source code
# COPY pom.xml .
# COPY src ./src

# # Build the application (creates JAR)
# RUN mvn clean package -DskipTests


# # ---------- Stage 2: Run ----------
# FROM eclipse-temurin:17-jdk

# WORKDIR /app

# # Copy JAR from build stage
# COPY --from=build /app/target/*.jar app.jar

# # Run the app
# ENTRYPOINT ["java", "-jar", "app.jar"]

# Runtime stage
# FROM eclipse-temurin:17-jdk-alpine
# FROM bellsoft/liberica-openjdk-alpine:17
# FROM openjdk:27-ea-slim
FROM amazoncorretto:latest
COPY /target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
