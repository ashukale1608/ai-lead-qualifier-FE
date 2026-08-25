# ==========================================
# Multi-stage Dockerfile for React 18 (Vite + Nginx)
# ==========================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 2: Serve via High-Performance Nginx Web Server
FROM nginx:alpine

# Copy custom Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build outputs
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP web server port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
