from elasticsearch import Elasticsearch
import os

# Get Elasticsearch host from environment variables
elasticsearch_host = os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")

# Connect to Elasticsearch
try:
    es = Elasticsearch([elasticsearch_host])
    if es.ping():
        print("Successfully connected to Elasticsearch!")
    else:
        print("Failed to connect to Elasticsearch.")
except Exception as e:
    print(f"Error connecting to Elasticsearch: {e}")
