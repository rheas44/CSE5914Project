from elasticsearch import Elasticsearch

ES_HOST = "http://localhost:9200"
es = Elasticsearch(ES_HOST)

def search_recipes(keyword):
    """Search for recipes in Elasticsearch."""
    query = {
        "query": {
            "match": {
                "title": keyword  # Searches in the recipe title field
            }
        }
    }
    
    results = es.search(index="recipes", body=query)
    return results["hits"]["hits"]

# Example search
search_results = search_recipes("soup")

for recipe in search_results:
    print(recipe["_source"])
