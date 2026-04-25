# Dockerfile for React client

# Build React client
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Pass in the REACT_APP_API_BASE_URL to the build process
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

RUN npm run build

# Run in NGINX
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
# Cloud Run expects the port to be defined by the PORT env variable or default to 8080.
# NGINX needs to use the correct port. The default.conf sets it to 8080.

CMD ["nginx", "-g", "daemon off;"]
