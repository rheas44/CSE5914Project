from elasticsearch import Elasticsearch
import requests
import json
# ... other imports ...

def main():
    # Your connection code
    elasticsearch_host = "http://localhost:9200"
    elasticsearch_username = "elastic"
    elasticsearch_password = "p5FE3c=alPhGd20o14bx"

    es = Elasticsearch(elasticsearch_host, basic_auth=(elasticsearch_username, elasticsearch_password))
    
    # Your functions and operations here
    if es.ping():
        print("Successfully connected to Elasticsearch!")
    else:
        print("Failed to connect to Elasticsearch.")

if __name__ == "__main__":
    main() 