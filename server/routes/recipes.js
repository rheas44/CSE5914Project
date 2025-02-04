const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");

const router = express.Router();

// Initialize Elasticsearch client
const ELASTIC_USERNAME = 'elastic'; // Replace with your username
const ELASTIC_PASSWORD = 'p5FE3c=alPhGd20o14bx'; // Replace with your password
const ELASTIC_HOST = 'http://localhost:9200'; // Change if hosted elsewhere

const client = new Client({
    node: ELASTIC_HOST,
    auth: {
        username: ELASTIC_USERNAME,
        password: ELASTIC_PASSWORD,
    }
});

module.exports = client;

// Route to get all recipes from JSON file
router.get("/get", (req, res) => {
    fs.readFile("./recipes.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read recipes file." });
        }
        try {
            const recipes = JSON.parse(data);
            res.json(recipes);
        } catch (parseError) {
            return res.status(500).json({ error: "Failed to parse recipes JSON." });
        }
    });
});

// Route to search recipes using Elasticsearch
router.get("/search", async (req, res) => {
    const { query } = req.query; // Get the search term from query params

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const result = await client.search({
            index: "recipes", // Change to your Elasticsearch index name
            body: {
                query: {
                    multi_match: {
                        query,
                        fields: ["title^2", "ingredients", "description"], // Adjust fields as needed
                    },
                },
            },
        });

        res.json(result.hits.hits.map(hit => hit._source)); // Return search results
    } catch (error) {
        console.error("Elasticsearch error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

module.exports = router;
