FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use a simple alpine to hold the build artifacts and then exit
FROM alpine:latest
COPY --from=builder /app/build /build
# No CMD needed - will exit immediately
