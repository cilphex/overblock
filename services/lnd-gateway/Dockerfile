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

COPY . .

# Start a new, final image to reduce size
FROM node:14.7.0-alpine3.11

# Copy files from builder
COPY --from=builder /app /app

# Starting command that is run will run from here
WORKDIR /app

EXPOSE 4040