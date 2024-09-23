# Dockerfile
# Use the official Bun image as the base
FROM oven/bun:1 AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and bun.lockb (if you're using Bun's lockfile)
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# RUN bun run build

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV production

# Command to run the application
CMD ["bun", "run", "dev"]