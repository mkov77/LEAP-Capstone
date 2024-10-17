# Use a Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the backend package.json and package-lock.json
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend files
COPY . .

# Expose the port the backend listens on
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]