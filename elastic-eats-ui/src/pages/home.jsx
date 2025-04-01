import { useState, useEffect } from 'react';
import { Flex, Heading, Text, Grid, Divider } from '@chakra-ui/react';
import RecipeCard from '../components/recipe-card';
import RecipeSearch from '../components/RecipeSearch';

const Home = () => {
  // State for top recipes
  const [recipes, setRecipes] = useState([]);

  // State for search
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch three random recipes on component mount
  useEffect(() => {
    async function fetchTopRecipes() {
      try {
        const response = await fetch("http://localhost:5001/recipe_box_v2/random", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Top Recipes API Response:", data);
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching top recipes:", error);
        setRecipes([]);
      }
    }
    fetchTopRecipes();
  }, []);

  // Handle search callback from RecipeSearch
  const handleSearch = (query, results) => {
    setSearchQuery(query);
    setSearchResults(results);
  };

  return (
    <Flex
      as="main"
      direction="column"
      align="center"
      textAlign="center"
      mt={10}
      p={6}
      bg="primary.light"
      color="text.basic"
      borderRadius="lg"
    >
      <Heading size="2xl" color="accent.green" mb={4} fontFamily="heading">
        Welcome to Elastic Eats
      </Heading>
      <Text fontSize="lg" mb={6}>
        Search for recipes and discover new dishes tailored to your tastes.
      </Text>

      {/* Top Recipes Section */}
      <Heading size="md" mt={4}>
        <Text color='accent.green'>
          Top Recipes Today
        </Text>
      </Heading>
      <Divider my={6} borderColor='text.dark' />

      <Grid
        templateColumns={{ base: "1fr", sm: "1fr", lg: "repeat(3, 1fr)" }}
        gap={6}
        w="100%"
        maxW="900px"
        justifyContent="center"
        justifyItems="center"
        mx="auto"
      >
        {recipes.length > 0
          ? recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} hasNutrition={true} />
            ))
          : <Text>No recipes to display.</Text>}
      </Grid>

      {/* The search bar + filters */}
      <Divider my={6} borderColor='text.dark' />

      <Heading size="md" my={4}>
        <Text color='accent.green'>
          Enter keywords to search for recipes
        </Text>
      </Heading>

      {/* Use the new RecipeSearch component and pass the handleSearch callback */}
      <RecipeSearch onSearch={handleSearch} />

      {/* Show search results if there are any */}
      {searchResults?.length > 0 && (
        <>
          <Divider my={6} borderColor='text.dark' />

          <Heading size="md" my={4}>
            <Text color='accent.green'>
              Results for "{searchQuery}"
            </Text>
          </Heading>

          <Grid
            templateColumns={{ base: "1fr", sm: "1fr", lg: "repeat(3, 1fr)" }}
            gap={6}
            w="100%"
            maxW="900px"
            justifyContent="center"
            justifyItems="center"
            mx="auto"
          >
            {searchResults.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} hasNutrition={true} />
            ))}
          </Grid>
        </>
      )}
    </Flex>
  );
};

export default Home;
