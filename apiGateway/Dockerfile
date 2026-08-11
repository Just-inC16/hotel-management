FROM public.ecr.aws/amazoncorretto/amazoncorretto:17
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]