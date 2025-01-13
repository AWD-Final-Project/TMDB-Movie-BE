# Stage 1: Build
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose the application port
EXPOSE 5000

# Start the application in production mode
CMD ["npm", "run", "start:prod"]
