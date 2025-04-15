from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
import os
from dotenv import load_dotenv
import requests
from flask_cors import CORS 
from bcrypt import hashpw, gensalt
import time
import subprocess
import sys
import signal
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))  # Add parent directory to path
from fetch_recipes_and_nutrition import get_nutrition
from clean_recipes import compute_nutrition_per_serving
import json
import uuid
from ml.recipe_modifier import suggest_modifications

# Load environment variables
load_dotenv()
ES_HOST = os.getenv("ELASTICSEARCH_HOST", "http://elasticsearch:9200")
API_KEY = os.getenv("RECIPE_API_KEY")  # Ensure API key is set in .env
ES_PASS = os.getenv("ELASTICSEARCH_PW")
ES_USER = "elastic"

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins = "http://localhost:5173")

# Map the filter values from the UI to the document field names
field_mapping = {
    "Calories": "Calories",
    "Protein (g)": "Protein",
    "Carbs (g)": "Total carbs",
    "Fat (g)": "Total fat"
}

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
    """Apply a single filter to a recipe using per-serving nutrition values."""
    filter_type = filter_item.get("type")
    min_val = filter_item.get("min")
    max_val = filter_item.get("max")

    # Use the per-serving nutrition for filtering
    if not recipe.get("nutrition_per_serving"):
        return False

    value = recipe["nutrition_per_serving"].get(filter_type)
    if value is None:
        return False

    if min_val != "" and float(value) < float(min_val):
        return False
    if max_val != "" and float(value) > float(max_val):
        return False

    return True

def add_nutri_per_serv(recipe):
    # Get nutrition data and total calories
    nutrition = recipe.get("nutrition", {})
    calories = float(nutrition.get("Calories", 0))
    
    # Skip recipes with zero calories
    if calories != 0:
        serving_count = int(recipe["servings"])

        # If it's a 1-serving recipe and total calories exceed 2000, skip it
        if not (serving_count == 1 and calories > 2000):
            # Compute per serving nutrition values
            nutrition_per_serving = compute_nutrition_per_serving(nutrition, serving_count)
            # Add the computed per serving nutrition to the recipe
            recipe["nutrition_per_serving"] = nutrition_per_serving

    # Normalize the title for duplicate checking
    title = recipe.get("title", "").strip().lower()

def process_new_recipe(recipe):
    output_file = "final_recipes_v2_clean.json"
    if os.path.exists(output_file):
        try:
            with open(output_file, "r") as infile:
                existing_recipes = json.load(infile)
            existing_titles = {recipe.get("title", "") for recipe in existing_recipes}
        except Exception as e:
            print("Error reading existing JSON file:", e)
            existing_recipes = []
            existing_titles = set()
    else:
        existing_recipes = []
        existing_titles = set()

    title = recipe['title'].strip().lower()
    if title not in existing_titles:
        ingredient_string = ""
        for ingredient in recipe["ingredients"]:
            ingredient_string += f"{ingredient['quantity'].replace(',', ';')} {ingredient['unit']} {ingredient['name'].replace(',', ';')}, "
        ingredient_string = (ingredient_string).rstrip(", ")
        nutri = get_nutrition(ingredient_string)

        aggregated_recipe = {
            "keyword": recipe['labels'],
            "title": recipe['title'],
            "ingredients": ingredient_string,
            "servings": recipe['servings'],
            "instructions": recipe['instructions'],
            "nutrition": nutri
        }

        add_nutri_per_serv(aggregated_recipe)

        existing_recipes.append(aggregated_recipe)

        doc_id = str(uuid.uuid4())
        
        es.index(index="recipe_box_v2", body=aggregated_recipe, id=doc_id)

        with open("final_recipes_v2_elastic_clean.ndjson", "w", encoding="utf-8") as out:
            doc = {
                "_index": "recipe_box_v2",
                "_id": doc_id,
                "_score": 1,
                "_source": aggregated_recipe
            }
            out.write(json.dumps(doc) + "\n")

        print(f"\nRecipe '{aggregated_recipe['title']}' have been appended to {output_file}")
    else:
        print(f"Recipe '{aggregated_recipe['title']}' already exists; skipping duplicate.")
    # Write the combined list back to the JSON file
    with open(output_file, "w") as outfile:
        json.dump(existing_recipes, outfile, indent=2)

@app.route('/recipe_box_v2/search', methods=['POST'])
def search_recipes():
    try:
        data = request.get_json()
        query = data.get("query", "")
        filters = data.get("filters", [])  # Get the filters array
        user_id = data.get("user_id")

        if not query:
            return jsonify({"error": "No search query provided"}), 400

        es_query = {
            "query": {
                "bool": {
                    "must": [
                        {"match": {"title": query}}  # Ensure title matches the query
                    ],
                    "should": [
                        {"match": {"keyword": "public"}}
                    ],  # Initialize should array for optional conditions
                    "minimum_should_match": 1  # At least one of the should conditions must match
                }
            },
            "_source": True
        }

        if user_id:  # Check if user_id is not None
            es_query["query"]["bool"]["should"].append({"match": {"keyword": user_id}})  # Ensure keyword contains user_id

        if filters:
            es_query["query"]["bool"]["filter"] = []

            for filter_item in filters:
                filter_type = filter_item.get("type")
                min_val = filter_item.get("min")
                max_val = filter_item.get("max")
                
                    # Convert display filter type to the actual document field name
                field_name = field_mapping.get(filter_type, filter_type)

                # Build a range query on per-serving nutrition values
                range_query = {"range": {f"nutrition_per_serving.{field_name}": {}}}
                if min_val != "":
                    range_query["range"][f"nutrition_per_serving.{field_name}"]["gte"] = float(min_val)
                if max_val != "":
                    range_query["range"][f"nutrition_per_serving.{field_name}"]["lte"] = float(max_val)


                es_query["query"]["bool"]["filter"].append(range_query)

        results = es.search(index="recipe_box_v2", body=es_query)
        recipes = [hit["_source"] for hit in results["hits"]["hits"]]

        # Optionally, if no recipes are found in ES, you could fall back to fetching from API-Ninjas:
        # recipes = fetch_recipes(query, filters)

        return jsonify(recipes)

    except Exception as e:
        print("Error processing request:", e)
        return jsonify({"error": "An error occurred"}), 500

@app.route('/pantry', methods=['POST'])
def get_pantry():
    user_id = request.get_json().get("user_id")

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
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        return jsonify({"error": "Elasticsearch Error"}), 400

    return jsonify({ "pantry": pantry_list }), 200

@app.route('/add_recipe', methods=['POST'])
def add_recipe():

    data = request.get_json()
    recipe = data.get("recipe")
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "No search user_id provided"}), 400

    recipe['labels'].append(user_id)

    try:  # Store updated list
        process_new_recipe(recipe)
        print(f"Successfully added: {recipe['title']}")
        return jsonify({"Success": f"Successfully added {recipe['title']}"}), 200
    except Exception as e:
        print("Error querying Elasticsearch:", e)
        return jsonify({"error": "Elasticsearch Error"}), 400

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
        print(f"Successfully removed: {name}")
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
        
# Add this function to execute the shell script
def run_elastic_dump():
    try:
        result = subprocess.run(['sh', '/app/ES_data/elasticdump.sh'], 
                              capture_output=True,
                              text=True,
                              check=True)
        return True
    except subprocess.CalledProcessError as e:
        print("Error running elastic dump:", e)
        print("Error output:", e.stderr)
        return False
    
def create_es_client():
    """Create an Elasticsearch client with retries."""
    es = Elasticsearch(ES_HOST, basic_auth=(ES_USER, ES_PASS))
    
    # Keep trying to ping Elasticsearch until successful or 5 second timeout
    start_time = time.time()
    while time.time() - start_time < 10:
        try:
            if es.ping():
                print("This is server.py: Successfully connected to Elasticsearch!")

                if run_elastic_dump():
                    print("Initial data load completed")
                else:
                    print("Warning: Initial data load failed")

                return es
        except Exception as e:
            print(f"Error connecting to Elasticsearch: {e}")
            time.sleep(1)  # Wait a bit before trying again
    print("Failed to connect to Elasticsearch within 10 seconds.")
    return None  # Return None if connection fails

def cleanup():
    """Function to run cleanup tasks before exiting."""
    print("Running cleanup script...")
    try:
        result = subprocess.run(['sh', '/ES_data/update_json.sh'], 
                                capture_output=True,
                                text=True,
                                check=True)
        print("Cleanup script executed successfully.")
        with open('./test.txt', 'w') as file:
            file.write("Output: " + result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error running cleanup script:", e)
        print("Error output:", e.stderr)

def signal_handler(sig, frame):
    """Handle termination signals."""
    cleanup()
    sys.exit(0)

# Add SIGINT to the signal handling
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)  
@app.route('/enhance_recipe', methods=['POST'])
def enhance_recipe():
    try:
        data = request.get_json()
        print("📥 Incoming Data:", data)

        recipe = data.get("recipe", {})
        user_priority = data.get("userGoals", "")

        if not recipe or not user_priority:
            print("❌ Missing data")
            return jsonify({"error": "Missing recipe or user goals"}), 400

        title = recipe.get("title", "Untitled Recipe")
        ingredients = recipe.get("ingredients", [])
        nutrition = recipe.get("nutrition", {})

        macros = {
            "calories": nutrition.get("Calories", 0),
            "protein_g": nutrition.get("Protein", 0),
            "sugar_g": nutrition.get("Sugar", 0),
            "carbohydrates_total_g": nutrition.get("Total carbs", 0),
            "sodium_mg": nutrition.get("Sodium", 0)
        }

        print("🧪 Recipe title:", title)
        print("🧪 Macros:", macros)
        print("🧪 Ingredients:", ingredients)
        print("🧪 User Goals:", user_priority)

        suggestion_text = suggest_modifications(
            recipe_name=title,
            ingredients=ingredients,
            macros=macros,
            user_priority=user_priority
        )

        return jsonify({"suggestions": suggestion_text}), 200

    except Exception as e:
        print("🔥 Error in enhance_recipe route:", e)
        return jsonify({"error": "Failed to enhance recipe"}), 500

es = create_es_client()

if __name__ == '__main__':
        
    app.run(debug=True, host='0.0.0.0', port=5001)
