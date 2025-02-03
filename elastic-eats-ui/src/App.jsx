import { Box, Flex, Heading, Button, Text, Link, Image } from '@chakra-ui/react'
import { useState } from 'react'
import Recipe from './components/recipe'
import LandingHeader from './components/landing-header'
import LandingFooter from './components/landing-footer'
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
}

//builds the homepage
function Home() {
  return (
    <Box textAlign="center" p={6}>
        <Heading size="2xl" color="accent.green" mb={4} fontFamily="heading">
          Welcome to Elastic Eats
        </Heading>
        <Text fontSize="lg" mb={6}>
          Discover personalized recipes tailored to your tastes, goals, and lifestyle.
        </Text>
      <Recipe recipe={mockRecipe} />
    </Box>
  );
}

function App() {
  return (
    <Box bg="primary.light" minH="100vh" fontFamily="body">
      <Router>
        <LandingHeader />

        {/* Routes for different pages */}
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

export default App
