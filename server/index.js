const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Import routes
const recipesRoutes = require("./routes/recipes");

// Use routes under the `/recipes` namespace
app.use("/recipes", recipesRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
