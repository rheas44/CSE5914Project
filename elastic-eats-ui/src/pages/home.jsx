import { Box, Flex, Heading, Text, Grid, Divider, VStack, Button, Input, Select, IconButton } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import RecipeCard from '../components/recipe-card';
import { useState } from 'react';
import Recipe from '../components/recipe';

const mockRecipes = [
  {
    title: "Grilled Chicken Salad",
    labels: ["Chicken", "Salad"],
    rating: 0,
    ingredients: {
      "Mixed Greens": { qty: 2, unit: "cups" },
      "Cherry Tomatoes": { qty: 0.5, unit: "cup" },
      "Sliced Cucumber": { qty: 0.25, unit: "cup" },
      "Crumbled Feta Cheese": { qty: 0.25, unit: "cup" },
      "Grilled Chicken Breast": { qty: 1, unit: "piece" },
      "Balsamic Vinaigrette": { qty: 2, unit: "tbsp" }
    },
    macros: {
      calories: 350,
      fat_total_g: 12,
      protein_g: 35,
      carbohydrates_total_g: 15
    },
    instructions: [
      "Wash and prepare the vegetables.",
      "Grill the chicken breast until fully cooked.",
      "Slice the chicken into thin strips.",
      "Combine greens, tomatoes, cucumber, and feta cheese in a large bowl.",
      "Top the salad with the grilled chicken slices.",
      "Drizzle balsamic vinaigrette over the salad and serve."
    ]
  },
  {
    title: "Salmon with Quinoa",
    labels: ["Fish", "Healthy"],
    rating: 0,
    ingredients: {
      "Salmon Fillet": { qty: 1, unit: "piece" },
      "Quinoa": { qty: 0.5, unit: "cup" },
      "Steamed Broccoli": { qty: 1, unit: "cup" },
      "Olive Oil": { qty: 1, unit: "tbsp" },
      "Lemon Juice": { qty: 1, unit: "tsp" }
    },
    macros: {
      calories: 500,
      fat_total_g: 18,
      protein_g: 40,
      carbohydrates_total_g: 25
    },
    instructions: [
      "Cook quinoa according to package instructions.",
      "Grill or bake salmon until cooked through.",
      "Steam broccoli and drizzle with olive oil and lemon juice.",
      "Serve salmon over quinoa with broccoli on the side."
    ]
  },
  {
    title: "Vegetable Stir Fry",
    labels: ["Vegetarian", "Quick Meal"],
    rating: 0,
    ingredients: {
      "Mixed Bell Peppers": { qty: 1, unit: "cup" },
      "Sliced Carrots": { qty: 0.5, unit: "cup" },
      "Snap Peas": { qty: 0.5, unit: "cup" },
      "Tofu or Chicken": { qty: 0.5, unit: "cup" },
      "Soy Sauce": { qty: 2, unit: "tbsp" },
      "Sesame Oil": { qty: 1, unit: "tsp" }
    },
    macros: {
      calories: 400,
      fat_total_g: 10,
      protein_g: 25,
      carbohydrates_total_g: 30
    },
    instructions: [
      "Heat sesame oil in a wok.",
      "Add vegetables and stir-fry for 5 minutes.",
      "Add protein of choice and cook until done.",
      "Pour soy sauce over the mixture and stir well.",
      "Serve hot with rice or noodles."
    ]
  }
]

const Home = () => {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({
      type: 'calories',
      min: '',
      max: '',
  });

  const handleDeleteFilter = (index) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
  };

  const handleAddFilter = () => {
      setFilters([...filters, newFilter]);
      setNewFilter({ type: 'calories', min: '', max: '' });
  };

  const handleFilterChange = (event) => {
      setNewFilter({ ...newFilter, [event.target.name]: event.target.value });
  };

  const handleSearch = async () => {
      if (!query.trim()) return;

      try {
          const response = await fetch("http://localhost:5001/recipes/search", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  query,
                  filters,
              }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log("API Response:", data);
          setRecipes(data);
      } catch (error) {
          console.error("Search error:", error);
          setRecipes([]);
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
              {mockRecipes.map((recipe, index) => (
                  <RecipeCard key={index} recipe={recipe} hasNutrition={true} />
              ))}
          </Grid>

          <Divider my={6} borderColor='text.dark' />

          <Heading size="md" my={4}>
              <Text color='accent.green'>
                  Enter keywords to search for recipes
              </Text>
          </Heading>

          <VStack spacing={4} mb={6}>
              <Input
                  placeholder="Search for recipes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  width="100%"
                  bg="white"
              />
              <Button colorScheme="green" onClick={handleSearch}>
                  Search
              </Button>
              <Button colorScheme="green" onClick={() => setIsFilterOpen(true)}>
                  Filter
              </Button>
          </VStack>

          <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Filter Nutrition Facts</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Flex>
                            <Select name="type" value={newFilter.type} onChange={handleFilterChange} flex="6">
                                <option value="calories">Calories</option>
                                <option value="protein_g">Protein</option>
                                <option value="carbohydrates_total_g">Carbs</option>
                                <option value="fat_total_g">Fat</option>
                            </Select>
                            <Input
                                type="number"
                                name="min"
                                placeholder="Min"
                                value={newFilter.min}
                                onChange={handleFilterChange}
                                flex="3"
                                ml={2}
                            />
                            <Input
                                type="number"
                                name="max"
                                placeholder="Max"
                                value={newFilter.max}
                                onChange={handleFilterChange}
                                flex="3"
                                ml={2}
                            />
                            <Button colorScheme="green" onClick={handleAddFilter} ml={2}>
                                Add Filter
                            </Button>
                        </Flex>

                        {filters.map((filter, index) => (
                          <Flex 
                              key={index} 
                              p={2} 
                              borderWidth="1px" 
                              borderRadius="md" 
                              alignItems="center" 
                              justifyContent="space-between"
                          >
                              <Text>
                                  {filter.type}: {filter.min || "Any"} - {filter.max || "Any"}
                              </Text>
                              <IconButton
                                  icon={<DeleteIcon />}
                                  aria-label="Delete filter"
                                  size="sm"
                                  onClick={() => handleDeleteFilter(index)}
                              />
                          </Flex>
                      ))}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="green" onClick={() => { setIsFilterOpen(false); handleSearch(); }}>
                        Apply Filters
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

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
                          <RecipeCard key={index} recipe={recipe} hasNutrition={true} />
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
