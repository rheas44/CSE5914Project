# Elastic Eats

Elastic Eats is a recipe generator that leverages Elasticsearch to search and generate recipes.

## Project Structure

- **elastic-eats-ui**: React frontend (Vite-based)
- **Server**: Express backend

## Prerequisites

- **Node.js**: v20.12.2
- **npm**: v10.5.0
- **pip**: v24.0
- **Docker**

## Installation & Running the Project

Important: The frontend (React) and backend (Flask) must be run in separate terminal windows.

### Frontend (React)

1. Navigate to the `elastic-eats-ui` directory:
   ```cd elastic-eats-ui```
2. Install dependencies:
   ```npm install```
3. Start the development server:
   ```npm run dev```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend (Flask)

1. Navigate to the `server` directory:
   ```cd server```
2. Install packages:
   ```pip install -r requirements.txt```
3. Start the Flask server:
   ```python server.py```
4. The backend runs on [http://localhost:5000](http://localhost:5000) (or the specified port).

### Create .env file

1. Create a `.env` file with the various fields keys:
   
   RECIPE_API_KEY=```74cCBsjRIn+Q3tBRgGFBng==6qu7n1HlTjvzVi2r```

   ELASTICSEARCH_TOKEN=```AAEAAWVsYXN0aWMva2liYW5hL2tpYmFuYV90b2tlbjp1U2k0c1YwSFRMR2pUdmZfeDRQSTdR```

   ELASTICSEARCH_PW=```p5FE3c=alPhGd20o14bx```

### Docker

1. Ensure Docker Desktop is installed and running.
2. End current docker container:
   ```docker-compose down -v```
3. Build the containers:
   ```docker-compose build```
4. Start the services:
   ```docker-compose up -d```
5. Finish setting up Docker:
   ```docker exec -it elasticsearch bash```
6. Change elasticsearch password:
   ```bin/elasticsearch-reset-password -u elastic -i```
7. Set new password:
   ```p5FE3c=alPhGd20o14bx```
8. Exit:
   ```exit```
9. Access the frontend at [http://localhost:5173](http://localhost:5173).