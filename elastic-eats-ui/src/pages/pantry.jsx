import { useEffect, useState } from 'react';
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text, VStack, Box, Input, Flex, List, ListItem, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../components/UserContext";

const Pantry = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { user } = useUser();

  // State for pantry items
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  // Automatically trigger login modal if user is not signed in
  useEffect(() => {
    if (!user.username) {
      onOpen();
    }
  }, [user, onOpen]);

  const handleLogin = () => {
    onClose();
    navigate('/login'); // Redirect to login page
  };

  const handleSignUp = () => {
    onClose();
    navigate('/signup'); // Redirect to sign-up page
  };

  // Add item to the pantry
  const handleAddItem = () => {
    if (newItem.trim()) {
      setPantryItems([...pantryItems, newItem]);
      setNewItem("");
    }
  };

  // Remove item from the pantry
  const handleRemoveItem = (index) => {
    const updatedItems = pantryItems.filter((_, i) => i !== index);
    setPantryItems(updatedItems);
  };

  // If user is not signed in, show the modal
  if (!user.username) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent p={4} textAlign="center">
          <ModalHeader>Sign In Required</ModalHeader>
          <ModalBody>
            <Text>You must be signed in to access your pantry.</Text>
          </ModalBody>
          <ModalFooter display="flex" justifyContent="center" gap={4}>
            <Button colorScheme="blue" onClick={handleLogin}>
              Log In
            </Button>
            <Button variant="outline" onClick={handleSignUp}>
              Sign Up
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  // Render the pantry content for signed-in users
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
