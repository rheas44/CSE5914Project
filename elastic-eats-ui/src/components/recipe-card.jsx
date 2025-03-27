import { 
  Box, Text, useDisclosure, Modal, ModalOverlay, 
  ModalContent, ModalCloseButton, ModalBody
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Recipe from "./recipe";

const MotionBox = motion.create(Box);

const RecipeCard = ({ recipe, hasNutrition }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // If servings is a string like "4 Servings", parse out the number 4.
  // Fallback to 1 if the string doesn't match or is missing.
  let servingCount = 1;
  if (recipe.servings) {
    const match = recipe.servings.match(/(\d+)/);
    if (match) {
      servingCount = parseInt(match[1], 10) || 1;
    }
  }

  // Safely handle nutrition fields (in case some are missing)
  const nutrition = recipe.nutrition || {};
  const totalCalories = nutrition.Calories || 0;
  const totalProtein = nutrition.Protein || 0;
  const totalFat = nutrition["Total fat"] || 0;
  const totalCarbs = nutrition["Total carbs"] || 0;

  // Compute macros per serving
  const calsPerServing = totalCalories / servingCount;
  const proteinPerServing = totalProtein / servingCount;
  const fatPerServing = totalFat / servingCount;
  const carbsPerServing = totalCarbs / servingCount;

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

        {/* Note about per-serving */}
        <Text fontSize="xs" mt={1} color="primary.dark" fontStyle="italic">
          Nutrition per serving
        </Text>

        {/* Show macros per serving */}
        <Text fontSize="sm">Protein: {Math.trunc(proteinPerServing)}g</Text>
        <Text fontSize="sm">Fat: {Math.trunc(fatPerServing)}g</Text>
        <Text fontSize="sm">Carbs: {Math.trunc(carbsPerServing)}g</Text>
        <Text fontSize="sm" fontWeight="bold">
          Calories: {Math.trunc(calsPerServing)}
        </Text>

        {/* Show how many servings total */}
        <Text fontSize="xs" mt={1} color="accent.green">
          ({servingCount} serving{servingCount !== 1 ? "s" : ""} total)
        </Text>
      </MotionBox>

      {/* Modal for full recipe */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="primary.light">
          <ModalCloseButton />
          <ModalBody>
            <Recipe recipe={recipe} servingCount={servingCount} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RecipeCard;
