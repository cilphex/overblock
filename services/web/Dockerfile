FROM node:14.7.0-alpine3.11 as builder

# Necessary for building grpc package
RUN apk add --no-cache --update \
    alpine-sdk \
    python

# Create the app dir and make it the working dir
WORKDIR /app

# Copy the app files
COPY . .

# Install dependencies (Removed --prod for now)
RUN yarn install

# Build the flat files that will be served
RUN yarn build

# Expose port that is specified in the env vars
EXPOSE $PORT