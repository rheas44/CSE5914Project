import { Box, Flex, Heading, Text, Grid, Divider, VStack, Button, Input } from '@chakra-ui/react';
import RecipeCard from '../components/recipe-card';
import { useState } from 'react';

const Home = () => {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]); // Store search results

  const handleSearch = async () => {
    if (!query.trim()) return;
  
    try {
      const response = await fetch(`http://localhost:5001/recipes/search?query=${query}`);
      const data = await response.json();
      
      console.log("API Response:", data);
      setRecipes(data); // Update state with search results
    } catch (error) {
      console.error('Search error:', error);
      setRecipes([]); // Clear recipes on error
    }
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

      {/* Search Bar */}
      <VStack spacing={4} mb={6}>
        <Input
          placeholder="Search for recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          width="50%"
          bg="white"
        />
        <Button colorScheme="green" onClick={handleSearch}>
          Search
        </Button>
      </VStack>

      {/* Recipe Cards Grid */}
      {recipes.length > 0 ? (
        <>
          <Heading size="md" mt={8} color="accent.green">
            Search Results
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
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </Grid>
        </>
      ) : (
        <Text fontSize="lg" color="gray.500" mt={6}>
          No recipes found. Try searching for something else!
        </Text>
      )}
    </Flex>
  );
};

export default Home;
