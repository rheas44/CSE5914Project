import { Box, Heading, Text, Badge, VStack, HStack, Divider, Stack } from "@chakra-ui/react"


const Recipe = ({ recipe }) => {
  
  return (
    <Box
      bg="primary.medium"
      boxShadow="lg"
      borderRadius="lg"
      p={6}
      m={4}
      maxW="600px"
      mx="auto"
    >
      <Heading size="lg" textAlign='center' color="accent.green" mb={4} fontFamily="heading">
        {recipe.title}
      </Heading>

      <VStack align="start" spacing={3} mb={6}>
        <Heading size="md" color="text.basic">Ingredients</Heading>
        {Object.entries(recipe.ingredients).map(([name, details], index) => (
          <Text key={index} fontSize="md" color="text.basic">
            - {details.qty} {details.unit} {name}
          </Text>
        ))}
      </VStack> 

      <Divider mb={6} borderColor='text.basic' />

      <VStack align="start" spacing={3} mb={6}>
        <Heading size="md" color="text.basic">Macros</Heading>
        <HStack wrap="wrap" spacing={4}>
          <Badge colorScheme="green" variant="solid" fontSize="sm" textTransform="capitalize" px={4} py={2}>Protein: {recipe.macros.protein_g}g</Badge>
          <Badge colorScheme="green" variant="solid" fontSize="sm" textTransform="capitalize" px={4} py={2}>Fat: {recipe.macros.fat_total_g}g</Badge>
          <Badge colorScheme="green" variant="solid" fontSize="sm" textTransform="capitalize" px={4} py={2}>Carbs: {recipe.macros.carbohydrates_total_g}g</Badge>
          <Badge colorScheme="green" variant="solid" fontSize="sm" textTransform="capitalize" px={4} py={2} fontWeight="bold">Calories: {recipe.macros.calories}</Badge>
        </HStack>
      </VStack>

      <Divider mb={6} borderColor='text.basic' />

      <VStack align="start" spacing={4}>
        <Heading size="md" color="text.basic">
          Instructions
        </Heading>
        {recipe.instructions.map((instruction, index) => (
          <Text key={index} fontSize="md" textAlign='start' color="text.basic">
            Step {index + 1}: {instruction}
          </Text>
        ))}
      </VStack>
    </Box>
  )
}

export default Recipe