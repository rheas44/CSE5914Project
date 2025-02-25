import { 
    Box, Text, Flex, Modal, ModalOverlay, 
    ModalContent, ModalCloseButton, ModalBody, Input, Button, Link
  } from "@chakra-ui/react";
  import { motion } from "framer-motion";
  import { useState } from 'react';
  import { Link as RouterLink } from 'react-router-dom';
  
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
            
            if (response.status === 400) {
                console.error("Login error:", data.error);
                document.getElementById('error').innerText = `${data.error}`;
            } else if (response.status === 401) {
                console.error("Login error:", data.error);
                document.getElementById('error').innerText = `${data.error}`;
            }
        
            if (data.message) {
                console.log("Login Successful!", data.message);                
            }
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
                <Text fontSize="sm" mt={2}>Don't have an account? <Link as={RouterLink} to="/signup" color="accent.green" onClick={onClose}>Sign up here.</Link></Text>
                <Text id="error" color="red.500" fontSize="sm"></Text>
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