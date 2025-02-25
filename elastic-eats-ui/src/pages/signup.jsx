import { Box, Heading, Text, Input, Divider, Button, Link } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import LoginCard from '../components/login-card';
import { useDisclosure } from '@chakra-ui/react';
import React, { useState } from 'react';

const Signup = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [successSignup, setSuccessSignup] = useState(false); // Added state variable for successSignup

  // State variables for input fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    if (!username.trim() || !password.trim()) return;

    try {
        const response = await fetch(`http://localhost:5001/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, firstName, lastName, email }), // Include new fields
        });
        const data = await response.json();

        if (response.status === 400) {
          console.error("Signup error:", data.error);
          document.getElementById('error').innerText = `${data.error}`;
        } else if (response.status === 500) {
            console.error("Signup error:", data.error);
            document.getElementById('error').innerText = `${data.error}`;
        }
    
        if (data.message) {
            console.log("Signup Successful!", data.message);
            setSuccessSignup(true); // Set successSignup to true if signup is successful
        }
    } catch (error) {
        console.error('Login error:', error);
    }
  };

  return (
    successSignup ? (
      <Text textAlign="center" fontSize="xl" color="accent.green">
        Successfully signed up!
      </Text>
    ) : (
      <Box maxW="800px" mx="auto" textAlign="center" p={6}>
        <Heading size="2xl" color="accent.green" mb={4}>
          Sign Up
        </Heading>
        <Text fontSize="lg" color="text.dark" mb={6}>
          Sign up for Elastic Eats to enjoy a personalized pantry and to store your own recipes. 
        </Text>

        <Divider my={6} />

        <Box>
          <Text id="error" color="red.500" fontSize="sm"></Text>
          <form onSubmit={handleSubmit}>
            <Box mb={4}>
              <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </Box>
            <Box mb={4}>
              <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </Box>
            <Box mb={4}>
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Box>
            <Box mb={4}>
              <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </Box>
            <Box mb={4}>
              <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Box>
            <Button colorScheme="green" type="submit">
              Sign Up
            </Button>
          </form>
        </Box>

        <Divider my={6} />

        <Text fontSize="lg" color="text.dark" mt={4}>
          Already have an account? <Link 
              to="#" 
              color="accent.green" 
              onClick={onOpen} 
            >
              Sign-in
            </Link>
        </Text>
        <LoginCard isOpen={isOpen} onClose={onClose} />
      </Box> 
    )
  );}

export default Signup;
