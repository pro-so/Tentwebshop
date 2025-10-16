# Use Node.js 18 as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port Render expects
EXPOSE 10000

# Set environment variable
ENV PORT=10000

# Start the app
CMD ["npm", "start"]
