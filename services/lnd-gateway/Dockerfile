FROM node:14.7.0-alpine3.11 as builder

# Necessary for building grpc package
RUN apk add --no-cache --update \
    alpine-sdk \
    python

# Create the app dir and make it the working dir
WORKDIR /app

# Copy install file
COPY package.json .

# Install dependencies
RUN yarn install

# Copy the rest of the app files
COPY . .

# Expose a port
EXPOSE $PORT