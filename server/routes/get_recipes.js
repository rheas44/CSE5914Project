const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', (req, res) => {  // The path is now relative to /recipes in server.js
  fs.readFile('./recipes.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read recipes file.' });
    }
    try { // Added a try-catch block for JSON parsing
      const recipes = JSON.parse(data);
      res.json(recipes);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse recipes JSON.' });
    }
  });
});

module.exports = router;