from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
import os
from dotenv import load_dotenv
import requests
from flask_cors import CORS 
from bcrypt import hashpw, gensalt
import time

# Load environment variables
load_dotenv()
ES_HOST = os.getenv("ELASTICSEARCH_HOST", "http://elasticsearch:9200")
API_KEY = os.getenv("RECIPE_API_KEY")  # Ensure API key is set in .env
ES_PASS = os.getenv("ELASTICSEARCH_PW")
ES_USER = "elastic"

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins = "http://localhost:5173")


def fetch_recipes(query, filters=None):  # Add filters parameter
    """Fetch recipes from API-Ninjas with optional filtering."""

    API_KEY = os.getenv("RECIPE_API_KEY")

    if not API_KEY:
        print("Error: RECIPE_API_KEY is missing in environment variables!")
        return []

    api_url = f"https://api.api-ninjas.com/v1/recipe?query={query}"
    headers = {"X-Api-Key": API_KEY}

    response = requests.get(api_url, headers=headers)

    if response.status_code == 200:
        recipes = response.json()

        if filters: # Apply filters if provided
            filtered_recipes = []
            for recipe in recipes:
                if all(apply_filter(recipe, filter_item) for filter_item in filters):
                    filtered_recipes.append(recipe)
            return filtered_recipes
        
        return recipes
    else:
        print(f"Error fetching recipes: {response.status_code}, {response.text}")
        return []

def apply_filter(recipe, filter_item):
    """Apply a single filter to a recipe."""
    filter_type = filter_item.get("type")
    min_val = filter_item.get("min")
    max_val = filter_item.get("max")

    if not recipe.get("macros"): # Handle cases where macros are missing
        return False

    macro_value = recipe["macros"].get(filter_type)

    if macro_value is None: # Handle cases where specific macro is missing
        return False

    if min_val != "" and float(macro_value) < float(min_val):
        return False
    if max_val != "" and float(macro_value) > float(max_val):
        return False

    return True


@app.route('/recipe_box_v2/search', methods=['POST'])
def search_recipes():
    try:
        data = request.get_json()
        query = data.get("query", "")
        filters = data.get("filters", [])  # Get the filters array

        if not query:
            return jsonify({"error": "No search query provided"}), 400

        es_query = {
            "query": {
                "bool": {
                    "must": [{"match": {"title": query}}]
                }
            },
            "_source": True
        }

        if filters:
            es_query["query"]["bool"]["filter"] = []

            for filter_item in filters:
                filter_type = filter_item.get("type")
                min_val = filter_item.get("min")
                max_val = filter_item.get("max")

                range_query = {"range": {f"macros.{filter_type}": {}}}
                if min_val != "":
                    range_query["range"][f"macros.{filter_type}"]["gte"] = min_val
                if max_val != "":
                    range_query["range"][f"macros.{filter_type}"]["lte"] = max_val

                es_query["query"]["bool"]["filter"].append(range_query)

        results = es.search(index="recipe_box_v2", body=es_query)
        recipes = [hit["_source"] for hit in results["hits"]["hits"]]

        # if not recipes:  # If no results in ES, fetch from API-Ninjas
        #     recipes = fetch_recipes(query, filters)  # Pass filters to fetch_recipes

        #     if recipes:
        #         for i, recipe in enumerate(recipes):
        #             try:
        #                 es.index(index="recipe_box", id=i + 1, document=recipe)
        #             except Exception as e:
        #                 print(f"Error indexing recipe {i+1}: {e}")

        return jsonify(recipes)

    except Exception as e:
        print("Error processing request:", e)
        return jsonify({"error": "An error occurred"}), 500

@app.route('/pantry', methods=['POST'])
def get_pantry():
    user_id = request.get_json().get("user_id")
    print(user_id)

    if not user_id:
        return jsonify({"error": "No search user_id provided"}), 400

    # Search in Elasticsearch
    es_query = {
        "query": {
            "term": {
                "user_id": user_id  
            }
        }
    }

    try:
        results = es.search(index="pantry", body=es_query)
        pantry_list = results["hits"]['hits'][0]['_source']['items']
        print(pantry_list)
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        return jsonify({"error": "Elasticsearch Error"}), 400

    return jsonify({ "pantry": pantry_list }), 200

@app.route('/add_item', methods=['POST'])
def add_item():

    data = request.get_json()
    name = data.get("name")
    qty = data.get("qty")
    unit = data.get("unit")
    exp_date = data.get("exp_date")
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "No search user_id provided"}), 400

    # Search in Elasticsearch
    es_query = {
        "query": {
            "term": {
                "user_id": user_id  
            }
        }
    }

    item = {
        "name": name,
        "qty": qty,
        "unit": unit,
        "exp_date": exp_date
    }

    try:
        results = es.search(index="pantry", body=es_query)
        pantry_list = results["hits"]['hits'][0]['_source']['items']
        pantry_list.append(item)  # Add the new item to the existing list
        es.index(index="pantry", id=results["hits"]['hits'][0]['_id'], document={"user_id": user_id, "items": pantry_list})  # Store updated list
        print(f"Successfully added: {name}")
        return jsonify({"Success": "Successfully added item", "pantry": pantry_list}), 200
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        return jsonify({"error": "Elasticsearch Error"}), 400

@app.route('/remove_item', methods=['POST'])
def remove_item():
    data = request.get_json()
    name = data.get("name")
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "No search user_id provided"}), 400

    # Search in Elasticsearch
    es_query = {
        "query": {
            "match": {
                "user_id": user_id  
            }
        }
    }

    try:
        results = es.search(index="pantry", body=es_query)
        pantry_list = results["hits"]['hits'][0]['_source']['items']
        
        # Remove item with the specified name
        pantry_list = [item for item in pantry_list if item['name'] != name]  # Filter out the item to be removed
        
        # Update the pantry list in Elasticsearch
        es.index(index="pantry", id=results["hits"]['hits'][0]['_id'], document={"user_id": user_id, "items": pantry_list})
        
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        return jsonify({"error": "Elasticsearch Error"}), 400

    return jsonify({"message": f"Item '{name}' removed successfully!", "pantry": pantry_list}), 200

def hash_email(email):
    return hashpw(email.encode('utf-8'), gensalt()).decode('utf-8')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    print(username, password)

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    es_query = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"username": username}},  # Assuming username is indexed
                    {"term": {"password": password}}  # Using term query for exact match
                ]
            }
        }
    }

    try:
        results = es.search(index="users", body=es_query)
        print(results["hits"]['hits'])
        if results["hits"]["total"].get("value", 0) > 0:
            user_id = results["hits"]["hits"][0]["_source"].get("user_id", None)
            response = jsonify({"message": "Login successful!", "user_id": user_id})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            return response, 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/recipe_box_v2/random', methods=['GET'])
def get_random_recipes():
    try:
        es_query = {
            "query": {
                "function_score": {
                    "query": {"match_all": {}},
                    "random_score": {}  # Uses a random seed automatically
                }
            },
            "size": 3
        }
        results = es.search(index="recipe_box_v2", body=es_query)
        recipes = [hit["_source"] for hit in results["hits"]["hits"]]
        return jsonify(recipes)
    except Exception as e:
        print("Error fetching random recipes:", e)
        return jsonify({"error": "An error occurred"}), 500

    
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
        "user_id": hash_email(email),
        "first_name": firstName,
        "last_name": lastName,
        "password": password  # Store password securely
    }
    
    try:
        es.index(index='users', id=user_data['email'], document=user_data, routing=user_data['email'])  # Adding the user to the 'users' index

        new_pantry = {
            "user_id": user_data["user_id"],
            "items": []
        }

        es.index(index='pantry', document=new_pantry)

        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        print("Error adding user to Elasticsearch:", e)
        return jsonify({"error": "Internal server error"}), 500


def create_es_client():
    """Create an Elasticsearch client with retries."""
    es = Elasticsearch(ES_HOST, basic_auth=(ES_USER, ES_PASS))
    
    # Keep trying to ping Elasticsearch until successful or 5 second timeout
    start_time = time.time()
    while time.time() - start_time < 10:
        try:
            if es.ping():
                print("This is server.py: Successfully connected to Elasticsearch!")

                """if run_elastic_dump():
                    print("Initial data load completed")
                else:
                    print("Warning: Initial data load failed")"""

                return es
        except Exception as e:
            print(f"Error connecting to Elasticsearch: {e}")
            time.sleep(1)  # Wait a bit before trying again
    print("Failed to connect to Elasticsearch within 10 seconds.")
    return None  # Return None if connection fails

es = create_es_client()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
