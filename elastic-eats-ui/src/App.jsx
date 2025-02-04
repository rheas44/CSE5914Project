import { Box, Input, Button, Heading, Text, VStack, Code } from '@chakra-ui/react';
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

function Home() {
  const [query, setQuery] = useState('');
  const [responseData, setResponseData] = useState(null); // Store API response

  // Fetch data from Flask API
  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/recipes/search?query=${query}`);
      const data = await response.json();
      
      console.log("API Response:", data); // ✅ Log response to console
      setResponseData(data); // ✅ Store raw JSON response
    } catch (error) {
      console.error('Search error:', error);
      setResponseData({ error: "Failed to fetch recipes." });
    }
  };

  return (
    <Box textAlign="center" p={6}>
      <Heading size="2xl" color="accent.green" mb={4} fontFamily="heading">
        Welcome to Elastic Eats
      </Heading>
      <Text fontSize="lg" mb={6}>
        Search for recipes and view raw JSON responses.
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

      {/* Display Raw API JSON Response */}
      {responseData && (
        <Box textAlign="left" p={4} border="1px solid gray" borderRadius="md" bg="gray.100">
          <Text fontWeight="bold">API Response:</Text>
          <Code as="pre" colorScheme="gray">
            {JSON.stringify(responseData, null, 2)}
          </Code>
        </Box>
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