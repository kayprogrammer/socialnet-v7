# Stage 1: Build the application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code and output compiled JS to the root directory
RUN npx tsc --outDir .

# Debug: Verify that index.js is created
RUN ls -l /app/index.js  # Check if the file exists

# Stage 2: Create a smaller image for the app
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/index.js ./  
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/*.json ./    

# Install only production dependencies
RUN npm install --only=production

# Expose the port your app listens on (e.g., 8000)
EXPOSE 8000

# Command to run your app
CMD ["node", "index.js"]
