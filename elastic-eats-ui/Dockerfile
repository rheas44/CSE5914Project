# Use the required Node.js version
FROM node:20.12.2

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install -g npm@10.5.0 && npm install

# Copy the rest of the React project files
COPY . ./

# Expose the port Vite uses for the dev server
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev"]