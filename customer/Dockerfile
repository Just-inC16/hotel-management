# Runtime stage
FROM eclipse-temurin:17-jdk
COPY /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]