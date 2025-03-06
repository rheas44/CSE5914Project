
JSON_DIR="."

ES_HOST="http://localhost:9200"
ES_USER="elastic"
ES_PASSWORD="$ELASTICSEARCH_PW"  
ES_HOST_AUTH="$ES_USER:$ES_PASSWORD@$ES_HOST"

for json_file in "$JSON_DIR"/*.json; do
    index_name=$(basename "$json_file" _index.json)

    elasticdump --input="$json_file" --output="$ES_HOST/$index_name" --type=data

    echo "Dumped $json_file into index $index_name"
done