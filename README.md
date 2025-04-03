# Elastic Eats

Elastic Eats is a recipe generator that leverages Elasticsearch to search and generate recipes.

## Project Structure

- **elastic-eats-ui**: React frontend (Vite-based)
- **Server**: Flask backend

## Prerequisites

- **Node.js**: v20.12.2
- **npm**: v10.5.0
- **pip**: v24.0
- **Docker**

## Installation & Running the Project

The front and backend are run through Docker.

### Running the Program

1. Inital Run:
   ```docker-compose up --build -d```
2. Subsequent Run:
   ```docker-compose up -d```

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
4. Build the containers:
   ```docker logs [container_id]```
5. Start the services:
   ```docker-compose up -d```
6. Finish setting up Docker:
   ```docker exec -it elasticsearch bash```
7. Change elasticsearch password:
   ```bin/elasticsearch-reset-password -u elastic -i```
8. Set new password:
   ```p5FE3c=alPhGd20o14bx```
9. Exit:
   ```exit```

### Dump data into Elasticsearch

1. Install elasticdump:
   ```npm install -g elasticdump```
2. Dump ElasticSearch Indices:
   ```elasticdump --input=final_recipes_v2_elastic_clean.ndjson --output=http://elastic:p5FE3c=alPhGd20o14bx@localhost:9200/recipe_box_v2 --type=data --inputFormat=ndjson```
   ```elasticdump --input=ES_data/pantry_index.json --output=http://elastic:p5FE3c=alPhGd20o14bx@localhost:9200/pantry --type=data```
   ```elasticdump --input=ES_data/users_index.json --output=http://elastic:p5FE3c=alPhGd20o14bx@localhost:9200/users --type=data```
