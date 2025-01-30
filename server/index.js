const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Import routes
const getRecipesRoute = require('./routes/get_recipes');

// Use routes
app.use('/recipes', getRecipesRoute); // Mount the fetchRecipes route under /recipes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});