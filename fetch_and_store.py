import requests
import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch

# Load environment variables
load_dotenv()
API_KEY = os.getenv("RECIPE_API_KEY")
ES_HOST = os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")

# Initialize Elasticsearch client
es = Elasticsearch(ES_HOST)

def fetch_recipes(query):
    """Fetch recipes from API-Ninjas and return JSON response."""
    api_url = f"https://api.api-ninjas.com/v1/recipe?query={query}"
    headers = {"X-Api-Key": API_KEY}
    
    response = requests.get(api_url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return []

def store_recipes_in_elasticsearch(recipes):
    """Store the fetched recipes in Elasticsearch."""
    for i, recipe in enumerate(recipes):
        es.index(index="recipes", id=i+1, document=recipe)
    print("Recipes successfully stored in Elasticsearch!")

# Example: Fetch & Store "Italian Wedding Soup"
query = "italian wedding soup"
recipes = fetch_recipes(query)

if recipes:
    store_recipes_in_elasticsearch(recipes)
