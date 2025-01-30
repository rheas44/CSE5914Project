from elasticsearch import Elasticsearch
import os

# Get Elasticsearch host and credentials from environment variables
elasticsearch_host = os.getenv("ELASTICSEARCH_HOST", "http://elasticsearch:9200")
elasticsearch_username = os.getenv("ELASTICSEARCH_USERNAME", "elastic")  # Set your username
elasticsearch_password = os.getenv("ELASTICSEARCH_PASSWORD", "p5FE3c=alPhGd20o14bx")  # Set your password

# Connect to Elasticsearch
try:
    es = Elasticsearch(
        [elasticsearch_host], basic_auth=(elasticsearch_username, elasticsearch_password)  # Use HTTP Basic Auth
    )
    if es.ping():
        print("Successfully connected to Elasticsearch!")
    else:
        print("Failed to connect to Elasticsearch.")
except Exception as e:
    print(f"Error connecting to Elasticsearch: {e}")
