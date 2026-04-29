# Runtime stage
FROM public.ecr.aws/amazoncorretto/17
COPY /target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
