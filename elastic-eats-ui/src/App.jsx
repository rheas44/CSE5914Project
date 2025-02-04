import { Box, Input, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import Recipe from './components/recipe';
import LandingHeader from './components/landing-header';
import LandingFooter from './components/landing-footer';
import About from './pages/about';
import Contact from './pages/contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

      {/* Display Search Results */}
      {recipes.length > 0 ? (
        recipes.map((recipe, index) => <Recipe key={index} recipe={recipe} />)
      ) : (
        <Text>No recipes found. Try a different search.</Text>
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
