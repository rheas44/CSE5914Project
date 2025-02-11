import { Box, Text, Flex, useDisclosure, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, Button, UnorderedList, ListItem } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const RecipeCard = ({ recipe }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <MotionBox
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        borderColor='accent.green'
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
