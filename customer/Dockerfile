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
FROM amazonlinux:2

ARG version=17.0.19.10-1

RUN set -eux \
    && ARCH="$(rpm --query --queryformat='%{ARCH}' rpm)" \
    && export resouce_version=$(echo $version | tr '-' '.') \
    && rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-amazon-linux-2 \
    && echo "localpkg_gpgcheck=1" >> /etc/yum.conf \
    && CORRETO_TEMP=$(mktemp -d) \
    && pushd ${CORRETO_TEMP} \
    && RPM_LIST=("java-17-amazon-corretto-headless-$version.amzn2.1.${ARCH}.rpm" "java-17-amazon-corretto-$version.amzn2.1.${ARCH}.rpm" "java-17-amazon-corretto-devel-$version.amzn2.1.${ARCH}.rpm" "java-17-amazon-corretto-jmods-$version.amzn2.1.${ARCH}.rpm") \
    && for rpm in ${RPM_LIST[@]}; do \
    curl --fail -O https://corretto.aws/downloads/resources/${resouce_version}/${rpm} \
    && rpm -K "${CORRETO_TEMP}/${rpm}" | grep -F "${CORRETO_TEMP}/${rpm}: rsa sha1 (md5) pgp md5 OK" || exit 1 \
    && if [[ ${rpm} != *jmods* ]]; then \
      yum install -y $(yum deplist "${CORRETO_TEMP}/${rpm}" |grep provider | grep -vE "log4j-cve|corretto" | tr -s ' ' |cut -d ' ' -f 3 ); \
      fi; \
      done \
    && rpm -i --nodeps ${CORRETO_TEMP}/*.rpm \
    && popd \
    && (find /usr/lib/jvm/java-17-amazon-corretto.${ARCH} -name src.zip -delete || true) \
    && rm -rf ${CORRETO_TEMP} \
    && yum clean all \
    && rm -rf /var/cache/yum \
    && sed -i '/localpkg_gpgcheck=1/d' /etc/yum.conf

ENV LANG=C.UTF-8
ENV JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto
COPY /target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
