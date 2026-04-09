#!/usr/bin/env bash

services=("apiGateway" "customer" "eurekaServer" "hotelManagement" "notification" "payment" "reservation")

for service in "${services[@]}"; do
  echo "Cleaning $service...."
  (cd "$service" && mvn $@)
done
