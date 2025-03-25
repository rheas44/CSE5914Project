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
  const [newItem, setNewItem] = useState({ name: '', quantity: '', expirationDate: '', unit: '' });
  const toast = useToast();

  useEffect(() => {
    if (user.username) {
      setLoginModalOpen(false); // Close modal when user logs in
    }
  }, [user]);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.unit || !newItem.expirationDate) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill out all fields.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/add_item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItem.name,
          qty: newItem.quantity,
          unit: newItem.unit,
          exp_date: newItem.expirationDate,
          user_id: user.user_id,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      const data = await response.json();
      console.log(data.pantry);
      setPantryItems(data.pantry);
      setNewItem({ name: '', quantity: '', unit: '', expirationDate: '' });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveItem = async (index) => {
    const item = pantryItems[index];
    try {
      const response = await fetch('http://localhost:5001/remove_item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.name,
          user_id: user.user_id,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      const data = await response.json();
      setPantryItems(data.pantry);
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
                placeholder="Unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
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
                  <Text>{item.qty} {item.unit}</Text>
                  <Text>{item.exp_date}</Text>
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
