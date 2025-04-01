import { useState, useEffect } from 'react';
import { 
  Box, Text, Input, Button, Image, VStack, HStack, 
  IconButton, useToast, Flex 
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useUser } from "../components/UserContext";
import LoginCard from "../components/login-card";
import PantryItemCard from "../components/pantry-item";


const Pantry = () => {
  const { user } = useUser();
  const [loginModalOpen, setLoginModalOpen] = useState(true);
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', expirationDate: '', unit: '' });
  const toast = useToast();

  useEffect(() => {
    if (user.username) {
      setLoginModalOpen(false);
      fetchPantryItems();
    }
  }, [user]);

  const fetchPantryItems = async () => {
    if (user.user_id) {
      try {
        const response = await fetch('http://localhost:5001/pantry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.user_id,
          }),
        });
        const data = await response.json();
        setPantryItems(data.pantry);
      } catch (error) {
        console.error('Error fetching pantry items:', error);
      }
    }
  };

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

      const data = await response.json();
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
    <Box maxW="900px" mx="auto" mt={8} p={4}>
      <LoginCard isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {!user.username && !loginModalOpen ? (
        <VStack spacing={4} mt={8}>
          <Text fontSize="3xl" color="black">
            Please sign in to view your pantry.
          </Text>
        </VStack>
      ) : (
        <>
          <Text fontSize="2xl" mb={4} textAlign="center" fontWeight="bold">Your Pantry</Text>

          {/* Compact, horizontal form for adding items */}
          <Flex gap={2} mb={8} direction="row" align="center" flexWrap="nowrap">
            <Input
              placeholder="Item Name"
              value={newItem.name}
              width="160px"
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <Input
              placeholder="Quantity"
              value={newItem.quantity}
              width="100px"
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
            <Input
              placeholder="Unit"
              value={newItem.unit}
              width="100px"
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            />
            <Input
              type="date"
              value={newItem.expirationDate}
              width="170px"
              onChange={(e) => setNewItem({ ...newItem, expirationDate: e.target.value })}
            />
            <Button colorScheme="green" onClick={handleAddItem}>Add</Button>
          </Flex>

          {/* Pantry items displayed in a card grid */}
          <Flex wrap="wrap" gap={4} justifyContent="center">
            {pantryItems.length === 0 ? (
              <Text textAlign="center" fontSize="lg" color="gray.500">
                Your pantry is empty. Start adding items!
              </Text>
            ) : (
              pantryItems.map((item, index) => (
                <Box key={index} position="relative">
                  <PantryItemCard item={item} />
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    size="sm"
                    position="absolute"
                    top="8px"
                    right="8px"
                    onClick={() => handleRemoveItem(index)}
                    aria-label={`Remove ${item.name}`}
                  />
                </Box>
              ))
            )}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Pantry;