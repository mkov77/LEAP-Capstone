# Use a Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the frontend package.json and package-lock.json
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Build the frontend
RUN npm run build

# Serve the frontend with a simple server
RUN npm install -g serve
CMD ["serve", "-s", "build"]