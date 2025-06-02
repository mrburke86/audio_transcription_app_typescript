# Dockerfile for npm-based Next.js project
FROM node:18-alpine AS base

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application (uncomment for production)
# RUN npm run build

# Expose the port
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=development

# Command to run the application
CMD ["npm", "run", "dev"]