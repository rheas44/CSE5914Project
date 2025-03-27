import json
import uuid

input_file = "final_recipes_v2_clean.json"
output_file = "final_recipes_v2_elastic_clean.ndjson"
index_name = "recipe_box_v2"

with open(input_file, "r", encoding="utf-8") as f:
    recipes = json.load(f)

with open(output_file, "w", encoding="utf-8") as out:
    for recipe in recipes:
        doc_id = str(uuid.uuid4())
        doc = {
            "_index": index_name,
            "_id": doc_id,
            "_score": 1,
            "_source": recipe
        }
        out.write(json.dumps(doc) + "\n")

print(f"Converted {len(recipes)} recipes to NDJSON in {output_file}")
