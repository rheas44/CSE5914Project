from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
import os
from dotenv import load_dotenv
import requests
from flask_cors import CORS 
from bcrypt import hashpw, gensalt

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

def hash_email(email):
    return hashpw(email.encode('utf-8'), gensalt()).decode('utf-8')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    # Search for the user in Elasticsearch
    es_query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"username": username}},  # Assuming username is indexed
                    {"term": {"password": password}}  # Using term query for exact match
                ]
            }
        }
    }

    try:
        results = es.search(index="users", body=es_query)  # Assuming users are stored in 'users' index
        if results["hits"]["total"]["value"] > 0:
            user_email = results["hits"]['hits'][0]['_source']['email']
            # Assuming there's a function to hash the email
            hashed_email = hash_email(user_email)
            return jsonify({"message": "Login successful!", "user_id": hashed_email}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/signup', methods=['POST'])
def signup():
    """Handle user login requests."""
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    firstName = data.get("firstName")
    lastName = data.get("lastName")
    email = data.get("email")

    if not username or not password or not firstName or not lastName or not email:
        return jsonify({"error": "All fields are required"}), 400

    # Check if the email is already in the 'users' index
    es_query = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"email": email}}  # Using term query for exact match
                ]
            }
        }
    }

    try:
        results = es.search(index="users", body=es_query)  # Assuming users are stored in 'users' index
        if results["hits"]["total"]["value"] > 0:
            return jsonify({"error": "Email already in use"}), 400
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        return jsonify({"error": "Internal server error"}), 500
    
    # Assuming the user data is stored in a dictionary 'user_data'
    user_data = {
        "username": username,
        "email": email,
        "first_name": firstName,
        "last_name": lastName,
        "password": password  # Store password securely
    }
    
    try:
        es.index(index='users', id=user_data['email'], document=user_data, routing=user_data['email'])  # Adding the user to the 'users' index

        new_pantry = {
            "user_id": hash_email(email),
            "items": []
        }

        es.index(index='pantry', document=new_pantry)

        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        print("Error adding user to Elasticsearch:", e)
        return jsonify({"error": "Internal server error"}), 500
        
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
