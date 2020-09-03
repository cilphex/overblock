FROM node:14.7.0-alpine3.11

# Necessary for building grpc package
RUN apk add --no-cache --update \
    alpine-sdk \
    bash \
    python

# Create the app dir and make it the working dir
WORKDIR /app

# Copy the app files
COPY . .

# Install dependencies
RUN yarn install

# Expose a port (necessary?)
EXPOSE $PORT