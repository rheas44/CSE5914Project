import { Box, Heading, Text, Badge, VStack, HStack, Divider, Stack } from "@chakra-ui/react"


const Recipe = ({ recipes }) => {

  if (!recipes || recipes.length === 0) {
    return <Text>No recipes available.</Text>;
  }

  return (
    <Box>
      {recipes.map((recipe, index) => (
      <Box key = {index}
        bg="primary.medium"
        boxShadow="lg"
        borderRadius="lg"
        p={6}
        m={4}
        maxW="600px"
        mx="auto" >
    
      <Heading size="lg" color="accent.green" mb={4} textAlign="center">
        {recipes.title}
      </Heading>

      <VStack align="start" spacing={3} mb={6}>
        <Heading size="md" color="text.basic">
          Ingredients
        </Heading>
        {recipe.ingredients.map((ingredient, index) => (
          <Text key={index} fontSize="md" color="text.basic">
            - {ingredient}
          </Text>
        ))}
      </VStack>

      <Divider mb={6} borderColor='text.basic' />

      <VStack align="start" spacing={3} mb={6}>
        <Heading size="md" color="text.basic">
          Macros
        </Heading>
        <HStack wrap="wrap" spacing={4}>
          {Object.entries(recipe.macros).map(([key, value]) => (
            <Badge
              key={key}
              colorScheme="green"
              variant="solid"
              fontSize="sm"
              px={4}
              py={2}
              textTransform="capitalize"
            >
              {key}: {value}
            </Badge>
          ))}
        </HStack>
      </VStack>

      <Divider mb={6} borderColor='text.basic' />

      <VStack align="start" spacing={4}>
        <Heading size="md" color="text.basic">
          Instructions
        </Heading>
        {recipe.instructions.map((instruction, index) => (
          <Text key={index} fontSize="md" color="text.basic">
            Step {index + 1}: {instruction}
          </Text>
        ))}
      </VStack>
    </Box>
    ))}
    </Box>
  )
}

export default Recipe