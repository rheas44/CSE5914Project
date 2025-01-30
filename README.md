# Elastic Eats

Elastic Eats is a recipe generator that leverages Elasticsearch to search and generate recipes.

## Project Structure

- **elastic-eats-ui**: React frontend (Vite-based)
- **Server**: Express backend

## Prerequisites

- **Node.js**: v20.12.2
- **npm**: v10.5.0
- **Express.js**: v4.21.2 (for backend)
- **Docker** (optional, for containerized setup)

## Installation & Running the Project

Important: The frontend (React) and backend (Express) must be run in separate terminal windows.

### Frontend (React)

1. Navigate to the `elastic-eats-ui` directory:
   ```cd elastic-eats-ui```
2. Install dependencies:
   ```npm install```
3. Start the development server:
   ```npm run dev```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend (Express)

1. Navigate to the `server` directory:
   ```cd server```
2. Install dependencies:
   ```npm install```
3. Start the Express server:
   ```node index.js```
4. The backend runs on [http://localhost:5000](http://localhost:5000) (or the specified port).

## Running with Docker

1. Ensure Docker Desktop is installed and running.
2. Build the containers:
   ```docker-compose build```
3. Start the services:
   ```docker-compose up```
4. Access the frontend at [http://localhost:5173](http://localhost:5173).