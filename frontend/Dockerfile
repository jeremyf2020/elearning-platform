# Use the same Node version as your local machine/backend to avoid conflicts
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package files first (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose the port Vite runs on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]