import { Box, Flex, Heading, Button, Text, Link, Image } from '@chakra-ui/react'
import { useState } from 'react'
import Recipe from './components/recipe'
import LandingHeader from './components/landing-header'
import LandingFooter from './components/landing-footer'

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

function App() {
  const [count, setCount] = useState(0)

  return (
    <Box bg="primary.light" minH="100vh" fontFamily="body">

      <LandingHeader />

      <Recipe recipe={mockRecipe} />

      <LandingFooter />
    </Box>
  )
}

export default App
