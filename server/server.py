from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
import os
from dotenv import load_dotenv
import requests
from flask_cors import CORS  # Enable CORS to allow frontend access

# Load environment variables
load_dotenv()
ES_HOST = os.getenv("ELASTICSEARCH_HOST", "http://elasticsearch:9200")
API_KEY = os.getenv("RECIPE_API_KEY")  # Ensure API key is set in .env
ES_PASS = os.getenv("ELASTICSEARCH_PW")
ES_USER = "elastic"

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize Elasticsearch client
es = Elasticsearch(ES_HOST, basic_auth=(ES_USER, ES_PASS))
# Connect to Elasticsearch
try:
    if es.ping():
        print("This is server.py: Successfully connected to Elasticsearch!")
    else:
        print("Failed to connect to Elasticsearch.")
except Exception as e:
    print(f"Error connecting to Elasticsearch: {e}")

def fetch_recipes(query):
    """Fetch recipes from API-Ninjas and return JSON response."""
    API_KEY = os.getenv("RECIPE_API_KEY")  # Ensure this exists in .env
    
    if not API_KEY:
        print("Error: RECIPE_API_KEY is missing in environment variables!")
        return []

    api_url = f"https://api.api-ninjas.com/v1/recipe?query={query}"
    headers = {"X-Api-Key": API_KEY}

    response = requests.get(api_url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching recipes: {response.status_code}, {response.text}")
        return []

@app.route('/recipes/search', methods=['GET'])
def search_recipes():
    """Handle search requests from frontend and return results."""
    query = request.args.get("query", "")

    if not query:
        return jsonify({"error": "No search query provided"}), 400

    # Search in Elasticsearch
    es_query = {
        "query": {
            "match": {
                "title": query  # Assuming title is indexed
            }
        }
    }

    print("Query Pulled from frontend:", query)

    try:
        results = es.search(index="recipe_box", body=es_query)
        print(results["hits"]["hits"])
        recipes = [hit["_source"] for hit in results["hits"]["hits"]]
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        recipes = []

    # If no results in ES, fetch from API-Ninjas
    if not recipes:
        recipes = fetch_recipes(query)
        if recipes:
            for i, recipe in enumerate(recipes):
                es.index(index="recipes", id=i+1, document=recipe)  # Store results in ES

    return jsonify(recipes)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
