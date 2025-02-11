import { 
  Box, Text, Flex, useDisclosure, Modal, ModalOverlay, 
  ModalContent, ModalCloseButton, ModalBody, UnorderedList, ListItem 
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Recipe from "./recipe";

const MotionBox = motion(Box);

const RecipeCard = ({ recipe, hasNutrition }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (hasNutrition) {
    return (
      <>
        <MotionBox
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          borderColor="accent.green"
          cursor="pointer"
          bg="primary.medium"
          whileHover={{ scale: 1.05 }}
          transition="0.2s"
          onClick={onOpen}
          w="100%"
          maxW="300px"
        >
          <Text fontWeight="bold" fontSize="lg" mb={2}>
            {recipe.title}
          </Text>
          <Text fontSize="sm">Protein: {recipe.macros.protein_g}g</Text>
          <Text fontSize="sm">Fat: {recipe.macros.fat_total_g}g</Text>
          <Text fontSize="sm">Carbs: {recipe.macros.carbohydrates_total_g}g</Text>
          <Text fontSize="sm" fontWeight="bold">Calories: {recipe.macros.calories}</Text>
        </MotionBox>

        {/* Modal for full recipe */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent bg="primary.medium">
            <ModalCloseButton />
            <ModalBody>
              <Recipe recipe={recipe} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <>
      <MotionBox
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        borderColor="accent.green"
        cursor="pointer"
        bg="primary.medium"
        whileHover={{ scale: 1.05 }}
        transition="0.2s"
        onClick={onOpen}
        w="100%"
        maxW="300px"
      >
        <Text fontWeight="bold" fontSize="lg" mb={2}>
          {recipe.title}
        </Text>
        <Text fontSize="sm">Servings: {recipe.servings}</Text>
      </MotionBox>

      {/* Modal for full recipe */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="primary.medium" p={4}>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="xl" fontWeight="bold">{recipe.title}</Text>
            <Text fontSize="md" mt={2} fontWeight="bold">Ingredients:</Text>
            <UnorderedList>
              {recipe.ingredients.split('|').map((ingredient, index) => (
                <ListItem key={index}>{ingredient}</ListItem>
              ))}
            </UnorderedList>
            <Text fontSize="md" mt={4} fontWeight="bold">Instructions:</Text>
            <Text>{recipe.instructions}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RecipeCard;
