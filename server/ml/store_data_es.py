from elasticsearch import Elasticsearch, helpers
import csv
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
ES_HOST = os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")
API_KEY = os.getenv("RECIPE_API_KEY")  # Ensure API key is set in .env
ES_PASS = os.getenv("ELASTICSEARCH_PW")
ES_USER = "elastic"

# Initialize Elasticsearch client
es = Elasticsearch(ES_HOST, basic_auth=(ES_USER, ES_PASS))

# Open CSV file and bulk upload
with open('data/RAW_recipes.csv', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    actions = [
        {"_index": "kaggle_recipes", "_source": row} for row in reader
    ]
    helpers.bulk(es, actions)