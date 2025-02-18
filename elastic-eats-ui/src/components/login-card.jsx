import { 
    Box, Text, Flex, Modal, ModalOverlay, 
    ModalContent, ModalCloseButton, ModalBody, Input, Button
  } from "@chakra-ui/react";
  import { motion } from "framer-motion";
  import { useState } from 'react';
  
  const MotionBox = motion.create(Box);
  
  const LoginCard = ({ isOpen, onClose }) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) return;

        try {
            const response = await fetch(`http://localhost:5001/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            
            console.log("Login Successful!", data);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
      <>
          {/* Modal for login modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent bg="primary.medium" p={4}>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" align="center">
                <Text fontSize="xl" color="accent.green" fontWeight="bold">Sign in to Your Account</Text>
                <Text fontSize="sm" mt={2}>Don't have an account? Sign up here.</Text>
              </Flex>
              <Box mt={4} />
              <Flex direction="column" gap={4}>
                <Flex direction="column">
                    <Text fontSize="sm" fontWeight="bold">Username</Text>
                    <Input placeholder="Enter your username" onChange={(e) => setUsername(e.target.value)} />
                </Flex>
                <Flex direction="column">
                    <Text fontSize="sm" fontWeight="bold">Password</Text>
                    <Input placeholder="Enter your password" type="password" onChange={(e) => setPassword(e.target.value)}/>
                </Flex>
              </Flex>
              <Button colorScheme="green" mt={4} onClick={handleLogin}>Login</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  };
  
  export default LoginCard;