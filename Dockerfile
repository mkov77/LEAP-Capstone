# Stage 1: Build
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install only the dependencies required for building
RUN npm install

# Copy the rest of the source files
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Production (only includes the built files)
FROM node:18-alpine

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Copy only the build output from the previous stage
COPY --from=build /app/build /app/build

# Expose the port the app runs on
EXPOSE 3000

# Start the server with the build files
CMD ["serve", "-s", "/app/build"]