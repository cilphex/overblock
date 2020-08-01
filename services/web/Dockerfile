# Use official Node runtime as a parent image
FROM node:14.7.0-alpine3.11 as builder

# Necessary for building grpc package
RUN apk add --no-cache --update \
    alpine-sdk \
    python

# Create the app dir and make it the working dir
WORKDIR /app

# Copy install file
COPY package.json .

# Install dependencies (Removed --prod for now)
RUN yarn install

# Copy files
COPY . .

# Build the flat files that will be served
RUN yarn build

# Start a new, final image to reduce size
FROM node:14.7.0-alpine3.11

# Copy files from builder
COPY --from=builder /app /app

# Starting command that is run will run from here
WORKDIR /app

# Intentionally do not specify PORT in this file so that it must be specified
# through the environment.
# ENV PORT=

# Expose port
EXPOSE $PORT