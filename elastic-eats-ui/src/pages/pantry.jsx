import { useState, useEffect } from 'react';
import { 
  Box, Text, Input, Button, Image, VStack, HStack, 
  IconButton, useToast, Flex 
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useUser } from "../components/UserContext";
import LoginCard from "../components/login-card";

const Pantry = () => {
  const { user } = useUser();
  const [loginModalOpen, setLoginModalOpen] = useState(true); // Start with login modal open
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', expirationDate: '' });
  const toast = useToast();

  useEffect(() => {
    if (user.username) {
      setLoginModalOpen(false); // Close modal when user logs in
    }
  }, [user]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.expirationDate) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill out all fields.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setPantryItems([...pantryItems, newItem]);
    setNewItem({ name: '', quantity: '', expirationDate: '' });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = pantryItems.filter((_, i) => i !== index);
    setPantryItems(updatedItems);
  };

  return (
    <Box maxW="800px" mx="auto" mt={8} p={4}>
      {/* Show login modal if the user is not signed in and hasn't closed it */}
      <LoginCard isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {!user.username && !loginModalOpen ? (
        <VStack spacing={4} mt={8}>
          <Text fontSize="3xl" color="black">
            Please sign in to view your pantry.
          </Text>
        </VStack>
      ) : (
        <>
          {/* Pantry UI */}
          <Text fontSize="2xl" mb={4} textAlign="center" fontWeight="bold">Your Pantry</Text>

          {/* Input for adding new items */}
          <VStack spacing={4} mb={8} align="stretch">
            <Flex gap={2}>
              <Input
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <Input
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
              <Input
                type="date"
                value={newItem.expirationDate}
                onChange={(e) => setNewItem({ ...newItem, expirationDate: e.target.value })}
              />
              <Button colorScheme="green" onClick={handleAddItem}>Add</Button>
            </Flex>
          </VStack>

          {/* Pantry Items Display */}
          <VStack spacing={4} align="stretch">
            {pantryItems.length === 0 ? (
              <Text textAlign="center" fontSize="lg" color="gray.500">
                Your pantry is empty. Start adding items!
              </Text>
            ) : (
              pantryItems.map((item, index) => (
                <HStack key={index} w="100%" p={4} borderWidth="1px" borderRadius="md" justifyContent="space-between">
                  <Text flex="1" ml={4} fontWeight="bold">{item.name}</Text>
                  <Text>{item.quantity}</Text>
                  <Text>{new Date(item.expirationDate).toLocaleDateString()}</Text>
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleRemoveItem(index)}
                  />
                </HStack>
              ))
            )}
          </VStack>
        </>
      )}
    </Box>
  );
};

export default Pantry;
