const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Route to retrieve all recipes
app.get('/recipes', (req, res) => {
  fs.readFile('./recepies.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read recipes file.' });
    }
    const recipes = JSON.parse(data);
    res.json(recipes);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
