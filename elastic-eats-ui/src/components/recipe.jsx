import { 
  Box, Heading, Text, VStack, Divider, SimpleGrid, 
  Button, Flex, HStack
} from "@chakra-ui/react";
import { useState } from "react";

const Recipe = ({ recipe, servingCount }) => {
  // Convert ingredients to an array if it's a string
  const ingredientsList = typeof recipe.ingredients === 'string'
    ? recipe.ingredients.split(',').map(ing => ing.trim())
    : recipe.ingredients;

  // Safely handle nutrition fields
  const nutrition = recipe.nutrition || {};
  const totalProtein = nutrition.Protein || 0;
  const totalFat = nutrition["Total fat"] || 0;
  const totalCarbs = nutrition["Total carbs"] || 0;
  const totalCalories = nutrition.Calories || 0;
  const saturatedFat = nutrition["Saturated fat"] || 0;
  const transFat = nutrition["Trans fat"] || 0;
  const polyFat = nutrition["Polyunsaturated fat"] || 0;
  const monoFat = nutrition["Monounsaturated fat"] || 0;
  const cholesterol = nutrition["Cholesterol"] || 0;
  const sodium = nutrition["Sodium"] || 0;
  const fiber = nutrition["Fiber"] || 0;
  const sugar = nutrition["Sugar"] || 0;

  // Compute per-serving values
  const proteinPerServing = totalProtein / servingCount;
  const fatPerServing = totalFat / servingCount;
  const carbsPerServing = totalCarbs / servingCount;
  const calsPerServing = totalCalories / servingCount;
  const saturatedPerServing = saturatedFat / servingCount;
  const transPerServing = transFat / servingCount;
  const polyPerServing = polyFat / servingCount;
  const monoPerServing = monoFat / servingCount;
  const cholPerServing = cholesterol / servingCount;
  const sodiumPerServing = sodium / servingCount;
  const fiberPerServing = fiber / servingCount;
  const sugarPerServing = sugar / servingCount;

  // Toggle between Total vs Per Serving
  const [showPerServing, setShowPerServing] = useState(false);
  // Toggle between Simple vs Detailed nutrition
  const [showDetailed, setShowDetailed] = useState(false);

  // Decide which values to display based on toggles
  const displayProtein = showPerServing ? proteinPerServing : totalProtein;
  const displayFat = showPerServing ? fatPerServing : totalFat;
  const displayCarbs = showPerServing ? carbsPerServing : totalCarbs;
  const displayCals = showPerServing ? calsPerServing : totalCalories;
  const displaySaturated = showPerServing ? saturatedPerServing : saturatedFat;
  const displayTrans = showPerServing ? transPerServing : transFat;
  const displayPoly = showPerServing ? polyPerServing : polyFat;
  const displayMono = showPerServing ? monoPerServing : monoFat;
  const displayChol = showPerServing ? cholPerServing : cholesterol;
  const displaySodium = showPerServing ? sodiumPerServing : sodium;
  const displayFiber = showPerServing ? fiberPerServing : fiber;
  const displaySugar = showPerServing ? sugarPerServing : sugar;
  const displayServings = showPerServing ? 1 : servingCount;

  return (
    <Box
      bg="primary.light"
      boxShadow="lg"
      borderRadius="lg"
      p={6}
      m={4}
      maxW="600px"
      mx="auto"
    >
      {/* Title */}
      <Heading
        size="lg"
        textAlign="center"
        color="accent.green"
        mb={4}
        fontFamily="heading"
      >
        {recipe.title}
      </Heading>

      <Divider mb={6} borderColor="text.basic" />


      {/* Ingredients */}
      <Heading size="md" textAlign='center' mb={4} color="text.basic">
          ingredients
        </Heading>

      <VStack bg='background.primary' 
      borderRadius="md"
      align="center" 
      spacing={3} 
      px={2}
      py={1}
      mb={6}
       >
        {ingredientsList.map((ingredient, index) => (
          <Text
            key={index}
            fontSize="md"
            color="text.highlight"
            px={2}
            py={1}
            borderRadius="md"
            _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}
          >
            - {ingredient}
          </Text>
        ))}

      </VStack>

      <Divider mb={6} borderColor="text.basic" />

      {/* Nutrition Section with Toggles */}
      <VStack align="start" spacing={3} mb={6} w="full">
      <Flex direction="column" align="start" alignItems='center' w="full">
        <Heading textAlign='center' size="md" color="text.basic">
          {showPerServing ? "nutrition per serving" : "total nutrition"}
        </Heading>
        <HStack spacing={2} align="start" mt={2}>
          <Button 
            variant='customButton'            
            size="sm"
            onClick={() => setShowPerServing(!showPerServing)}
          >
            {showPerServing ? "show total nutrition" : "show nutrition per serving"}
          </Button>
          <Button 
            variant='customButton' 
            size="sm"
            onClick={() => setShowDetailed(!showDetailed)}
          >
            {showDetailed ? "show simple macros" : "show detailed macros"}
          </Button>
        </HStack>
      </Flex>


        <Box bg="primary.medium" p={4} borderRadius="md" w="full">
          {showDetailed ? (
            // Detailed view: Show all 12 nutrition fields (plus servings)
            <SimpleGrid columns={2} spacingY={2} spacingX={1}>
              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ color:"text.basic", transition:"all 0.125s" }}>
                servings:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {displayServings}
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                protein:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayProtein)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                total fat:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayFat)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                saturated fat:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displaySaturated)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                trans fat:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayTrans)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                polyunsaturated fat:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayPoly)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                monounsaturated fat:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayMono)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                cholesterol:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayChol)} mg
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                sodium:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displaySodium)} mg
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                carbs:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayCarbs)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                fiber:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayFiber)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                sugar:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displaySugar)} g
              </Text>

              <Text fontSize="md" color="text.highlight" textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}>
                calories:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayCals)}
              </Text>
            </SimpleGrid>
          ) : (
            // Simple view: only show servings, protein, fat, carbs, calories
            <SimpleGrid columns={2} spacingY={2} spacingX={1}>
              <Text 
                fontSize="md" 
                color="text.highlight" 
                textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}
              >
                servings:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {displayServings}
              </Text>

              <Text 
                fontSize="md" 
                color="text.highlight" 
                textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}
              >
                protein:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayProtein)} g
              </Text>

              <Text 
                fontSize="md" 
                color="text.highlight" 
                textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}
              >
                fat:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayFat)} g
              </Text>

              <Text 
                fontSize="md" 
                color="text.highlight" 
                textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}
              >
                carbs:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayCarbs)} g
              </Text>

              <Text 
                fontSize="md" 
                color="text.highlight" 
                textAlign="right"
                _hover={{ cursor:"pointer", color:"text.basic", transition:"all 0.125s" }}
              >
                calories:
              </Text>
              <Text fontWeight="bold" color="accent.green" textAlign="left">
                {Math.trunc(displayCals)}
              </Text>
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      <Divider mb={6} borderColor="text.basic" />

      <Heading size="md" textAlign='center' mb={4} color="text.basic">
          instructions
        </Heading>
      
      {/* Instructions */}
      <VStack align="center" borderRadius="md"
      bg="background.primary"
      spacing={3} 
      px={2}
      py={1}
      mb={6}>
        {typeof recipe.instructions === 'string'
          ? (
            <Text fontSize="md" textAlign="start"
            color="text.highlight"
            px={2}
            py={1}
            borderRadius="md"
            >
              {recipe.instructions}
            </Text>
          ) : (
            recipe.instructions.map((instruction, index) => (
              <Text key={index} fontSize="md" textAlign="start" color="text.basic">
                Step {index + 1}: {instruction}
              </Text>
            ))
          )
        }
      </VStack>
    </Box>
  )
}

export default Recipe;
