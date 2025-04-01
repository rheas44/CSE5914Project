import { Box, Text } from "@chakra-ui/react";

const PantryItemCard = ({ item }) => {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor="accent.green"
      bg="primary.medium"
      w="100%"
      maxW="300px"
    >
      <Text fontWeight="bold" fontSize="lg" mb={2}>
        {item.name}
      </Text>
      <Text fontSize="sm">
        Quantity: {item.qty} {item.unit}
      </Text>
      <Text fontSize="sm">Expires: {item.exp_date}</Text>
    </Box>
  );
};

export default PantryItemCard;
