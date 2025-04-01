import { 
  Box, Text, useDisclosure, Modal, ModalOverlay, 
  ModalContent, ModalCloseButton, ModalBody, VStack, Input, useToast, Button, Textarea
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Recipe from "./recipe";
import { useState } from "react";

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

  const [userGoals, setUserGoals] = useState("");
const [modifications, setModifications] = useState("");
const [isLoading, setIsLoading] = useState(false);
const toast = useToast();

const handleEnhance = async () => {
  if (!userGoals.trim()) {
    toast({ title: "Please enter health goals.", status: "warning" });
    return;
  }

  setIsLoading(true);
  try {
    const res = await fetch("http://localhost:5001/enhance_recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipe,
        userGoals,
      }),
    });
    const data = await res.json();
    setModifications(data.suggestions);
  } catch (error) {
    toast({ title: "Failed to enhance recipe.", status: "error" });
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};


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

            <VStack
              bg="primary.light"
              borderRadius="md"
              px={4}
              py={3}
              mt={6}
              spacing={4}
              align="stretch"
            >
              <Text
                fontWeight="semibold"
                fontSize="md"
                color="text.basic"
                textAlign="center"
              >
                Enter your health goals:
              </Text>

              <Input
                placeholder="e.g. high protein, low sugar"
                value={userGoals}
                onChange={(e) => setUserGoals(e.target.value)}
                bg="primary.medium"
                color="text.basic"
                _placeholder={{ color: "text.highlight" }}
              />

              <Button
                variant="customButton"
                bg="accent.green"
                color="primary.light"
                onClick={handleEnhance}
                isLoading={isLoading}
                alignSelf="center"
              >
                Enhance with Elastic Eats AI
              </Button>
              {console.log(modifications)}
              {modifications && (
                <VStack
                  spacing={2}
                  bg="primary.medium"
                  p={4}
                  borderRadius="md"
                  align="stretch"
                  maxHeight="240px"
                  overflowY="auto"
                >
                  {modifications
                    .split(/\n(?=\d+\.)/) // splits on lines like "1. ", "2. ", etc.
                    .filter(Boolean)
                    .map((mod, idx) => (
                      <Box
                        key={idx}
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="md"
                        color="text.highlight"
                        _hover={{
                          cursor: "pointer",
                          color: "text.basic",
                          transition: "all 0.125s",
                        }}
                      >
                        {mod.trim()}
                      </Box>
                    ))}
                </VStack>
              )}

            </VStack>

          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RecipeCard;
