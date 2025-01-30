#!/bin/bash
echo "Waiting for Elasticsearch..."
until curl -s http://elasticsearch:9200 >/dev/null; do
  sleep 5
done
echo "Elasticsearch is up!"
exec "$@"