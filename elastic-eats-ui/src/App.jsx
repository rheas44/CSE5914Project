import { Box, Input, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import Recipe from './components/recipe';
import LandingHeader from './components/landing-header';
import LandingFooter from './components/landing-footer';
import About from './pages/about';
import Contact from './pages/contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const mockRecipe = {
  title: "Grilled Chicken Salad",
  ingredients: [
    "2 cups mixed greens",
    "1/2 cup cherry tomatoes",
    "1/4 cup sliced cucumber",
    "1/4 cup crumbled feta cheese",
    "1 grilled chicken breast, sliced",
    "2 tbsp balsamic vinaigrette",
  ],
  macros: {
    protein: "35g",
    fat: "12g",
    carbs: "15g",
    fiber: "4g",
    sodium: "450mg",
  },
  instructions: [
    "Wash and prepare the vegetables.",
    "Grill the chicken breast until fully cooked.",
    "Slice the chicken into thin strips.",
    "Combine greens, tomatoes, cucumber, and feta cheese in a large bowl.",
    "Top the salad with the grilled chicken slices.",
    "Drizzle balsamic vinaigrette over the salad and serve.",
  ],
};

// Builds the homepage
function Home() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  // Function to fetch search results
  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/recipes/search?query=${query}`);
      const data = await response.json();
      setRecipes(data); // Update state with search results
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <Box textAlign="center" p={6}>
      <Heading size="2xl" color="accent.green" mb={4} fontFamily="heading">
        Welcome to Elastic Eats
      </Heading>
      <Text fontSize="lg" mb={6}>
        Discover personalized recipes tailored to your tastes, goals, and lifestyle.
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

      {/* Display Search Results or Mock Recipe */}
      {recipes.length > 0 ? (
        recipes.map((recipe, index) => <Recipe key={index} recipe={recipe} />)
      ) : (
        <Recipe recipe={mockRecipe} />
      )}
    </Box>
  );
}

function App() {
  return (
    <Box bg="primary.light" minH="100vh" fontFamily="body">
      <Router>
        <LandingHeader />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <LandingFooter />
      </Router>
    </Box>
  );
}

export default App;
