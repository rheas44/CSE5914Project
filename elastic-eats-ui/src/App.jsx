import { Box, Spinner, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Recipe from "./components/recipe"; // Handles rendering recipes
import LandingHeader from "./components/landing-header";
import LandingFooter from "./components/landing-footer";

function App() {
  const [recipes, setRecipes] = useState([]); // State to store the fetched recipes
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch recipes from the API
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("http://localhost:5000/recipes"); // Adjust API URL if needed
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        console.log(data); // Log the fetched data // For debugging
        setRecipes(data); // Assuming the API returns an array of recipes
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <Box bg="primary.light" minH="100vh" fontFamily="body">
      {/* Landing Header */}
      <LandingHeader />

      {/* Main Content */}
      <Box p="4">
        {isLoading ? (
          // Show a spinner while loading
          <Box textAlign="center" mt="10">
            <Spinner size="xl" color="teal.500" />
            <Text mt="4">Loading recipes...</Text>
          </Box>
        ) : error ? (
          // Show error message if fetching fails
          <Box textAlign="center" mt="10" color="red.500">
            <Text>{error}</Text>
          </Box>
        ) : (
          // Render the Recipe component with the fetched recipes
          <Recipe recipes={recipes[1]} />
        )}
      </Box>

      {/* Landing Footer */}
      <LandingFooter />
    </Box>
  );
}

export default App;
