import { useState } from "react";
import { Box, Button, Input, Flex, Text, List, ListItem, IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useUser } from "../components/UserContext";

const Pantry = () => {
  const { user } = useUser();
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (newItem.trim()) {
      setPantryItems([...pantryItems, newItem]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = pantryItems.filter((_, i) => i !== index);
    setPantryItems(updatedItems);
  };

  if (!user.username) {
    return (
      <Box textAlign="center" mt={10}>
        <Text fontSize="xl" color="red.500">You must be signed in to access your pantry.</Text>
      </Box>
    );
  }

  return (
    <Box maxW="600px" mx="auto" mt={8} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <Text fontSize="2xl" mb={4} textAlign="center">Your Pantry</Text>
      <Flex gap={2} mb={4}>
        <Input 
          placeholder="Enter item name..." 
          value={newItem} 
          onChange={(e) => setNewItem(e.target.value)} 
        />
        <Button colorScheme="green" onClick={handleAddItem}>Add</Button>
      </Flex>
      <List spacing={3}>
        {pantryItems.map((item, index) => (
          <ListItem 
            key={index} 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            p={2} 
            bg="gray.100" 
            borderRadius="md"
          >
            {item}
            <IconButton 
              icon={<DeleteIcon />} 
              colorScheme="red" 
              size="sm" 
              onClick={() => handleRemoveItem(index)} 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Pantry;
