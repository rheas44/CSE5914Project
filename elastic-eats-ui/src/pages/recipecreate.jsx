import { useState, useEffect } from 'react';
import { 
  Box, Text, Input, Button, Image, VStack, HStack, 
  IconButton, useToast, Flex, Textarea
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useUser } from "../components/UserContext";
import LoginCard from "../components/login-card";


const RecipeCreate = () => {
  const { user } = useUser();
  const [loginModalOpen, setLoginModalOpen] = useState(true);

  const [newRecipe, setNewRecipe] = useState({
    title: '',
    labels: [],
    ingredients: [],
    instructions: '',
    servings: 1
  });
  const [newLabel, setNewLabel] = useState('');
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '' });

  const toast = useToast();

  useEffect(() => {
    if (user.username) {
      setLoginModalOpen(false);
    }
  }, [user]);

  const handleAddNewRecipe = async () => {
    if (user.user_id) {
      try {
        const response = await fetch('http://localhost:5001/add_recipe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe: newRecipe,
            user_id: user.user_id
          }),
        });
        const data = await response.json();
        console.log(data.Success)
        if (data.Success) {
          setNewRecipe({
            title: '',
            labels: [],
            ingredients: [],
            instructions: '',
            servings: 1
          });
        }
      } catch (error) {
        console.error('Error fetching pantry items:', error);
      }
    }
  };

  const handleAddIngred = async () => {
    if (!newItem.name || !newItem.quantity) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill out all fields.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setNewRecipe(prevState => ({
      ...prevState,
      ingredients: [...prevState.ingredients, newItem]
    }));
    setNewItem({ name: '', quantity: '', unit: ''});

  };

  const handleRemoveIngredient = (index) => {
    setNewRecipe(prevState => ({
      ...prevState,
      ingredients: prevState.ingredients.filter((_, i) => i !== index) // Remove from newRecipe as well
    }));
  };

  const handleAddLabel = () => {
    if (!newLabel) {
      toast({
        title: 'Incomplete information',
        description: 'Please enter a label.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setNewRecipe(prevState => ({
      ...prevState,
      labels: [...prevState.labels, newLabel],
    }));
    setNewLabel(''); // Clear the input field
  };

  const handleRemoveLabel = (index) => {
    setNewRecipe(prevState => ({
      ...prevState,
      labels: prevState.labels.filter((_, i) => i !== index), // Remove label from newRecipe
    }));
  };

  return (
    <Box maxW="900px" mx="auto" mt={8} p={4}>
      <LoginCard isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {!user.username && !loginModalOpen ? (
        <VStack spacing={4} mt={8}>
          <Text fontSize="3xl" color="black">
            Please sign in to add recipes.
          </Text>
        </VStack>
      ) : (
        <>
          <Text fontSize="2xl" mb={4} textAlign="center" fontWeight="bold">Create your own recipe.</Text>

          {/* Input for the title of the recipe */}
          <Input
            placeholder="Recipe Title"
            value={newRecipe.title}
            onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value})}
          />

          {/* Displaying the list of labels */}
          <HStack spacing={2} my={4} wrap="wrap">
            {newRecipe.labels.map((label, index) => (
              <Box 
                key={index} 
                border="1px" 
                borderColor="gray.300" 
                borderRadius="md" 
                p={2} // Padding around the label
              >
                <HStack spacing={1} align="center">
                  <Text>{label}</Text>
                  <IconButton 
                    size="xs" // Smaller button size
                    icon={<DeleteIcon />} 
                    onClick={() => handleRemoveLabel(index)} 
                    aria-label="Delete label" 
                  />
                </HStack>
              </Box>
            ))}
          </HStack>

          {/* Input for adding labels */}
          <Flex gap={2} mb={4} direction="row" align="center">
            <Input
              placeholder="Label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <Button colorScheme="blue" onClick={handleAddLabel}>Add Label</Button>
          </Flex>

          {/* Input for setting the number of servings */}
          <Flex direction="row" align="center" mb={4}>
          <Text fontSize="lg" mb={1} mr={2} fontWeight="bold">Servings</Text>
            <Input
              placeholder="Number of Servings"
              type="number" // Set input type to number
              value={newRecipe.servings}
              onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })} // Update servings value
            />
          </Flex>

          {/* Displaying the list of ingredients */}
          {newRecipe.ingredients.length > 0 && (
            <Flex direction="column">
              <Text fontSize="lg" mb={1} fontWeight="bold">Ingredients</Text>
              <Box 
                border="1px" 
                borderColor="gray.300" 
                borderRadius="md" 
                p={1}
                mb={3}>
                <VStack spacing={4} my={4}>
                  {newRecipe.ingredients.map((ingredient, index) => (
                    <HStack key={index} spacing={1}>
                      <Text>{ingredient.quantity} {ingredient.unit} {ingredient.name}</Text>
                      <IconButton 
                        icon={<DeleteIcon />} 
                        onClick={() => handleRemoveIngredient(index)} 
                        aria-label="Delete ingredient" 
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Flex>
          )}

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
            <Button colorScheme="green" onClick={handleAddIngred}>Add</Button>
          </Flex>

          {/* Label for the instructions */}
          <Text fontSize="lg" mb={1} fontWeight="bold">Instructions</Text> {/* Added label for instructions */}

          {/* Input for the instructions of the recipe */}
          <Textarea
            placeholder="Instructions"
            value={newRecipe.instructions}
            onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })} // Update instructions value
            size="lg" // Set size to large for a bigger text box
            mt={3} // Add margin top for spacing
          />

          {/* Button to add new recipe */}
          <Button colorScheme="green" size="lg" mt={4} onClick={handleAddNewRecipe}>Add New Recipe</Button>
        </>
      )}
    </Box>
  );
};

export default RecipeCreate;