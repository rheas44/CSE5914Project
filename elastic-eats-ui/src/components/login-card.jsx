import { useEffect } from 'react';
import { useDisclosure, Box, Text, VStack } from '@chakra-ui/react';
import { useUser } from "../components/UserContext";
import LoginCard from "../components/login-card";

const Pantry = () => {
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });
  const { user } = useUser();

  // Automatically trigger login modal if user is not signed in
  useEffect(() => {
    if (!user.username) {
      onOpen();
    }
  }, [user, onOpen]);

  // If the user is not signed in, show the login modal at the top
  if (!user.username) {
    return (
      <>
        <LoginCard isOpen={true} onClose={() => {}} /> {/* Modal always stays open */}
        <VStack spacing={4} mt={8}>
          <Text fontSize="xl">You must be signed in to access your pantry.</Text>
        </VStack>
      </>
    );
  }

  // Pantry UI for signed-in users
  return (
    <Box maxW="600px" mx="auto" mt={8} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <Text fontSize="2xl" mb={4} textAlign="center">Your Pantry</Text>
      <Text textAlign="center">Manage your ingredients here!</Text>
    </Box>
  );
};

export default Pantry;
