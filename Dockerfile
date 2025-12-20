# Use official Node image
FROM node:18
# Set working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy all project files
COPY . .
# Expose the port your app uses (example: 3000)
EXPOSE 3000
# Start the app
CMD ["npm", "start"]
