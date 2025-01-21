import { Box, Flex, Heading, Button, Text, Link, Image } from '@chakra-ui/react';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Box bg="gray.50" minH="100vh" p={4}>
      {/* Header Section */}
      <Flex as="header" justify="space-between" align="center" bg="white" p={4} boxShadow="md">
        <Heading size="lg" color="teal.500">
          Elastic Eats
        </Heading>
        <Flex gap={4}>
          <Link href="#about" color="teal.500" fontWeight="bold">
            About
          </Link>
          <Link href="#features" color="teal.500" fontWeight="bold">
            Features
          </Link>
          <Link href="#contact" color="teal.500" fontWeight="bold">
            Contact
          </Link>
        </Flex>
      </Flex>

      {/* Hero Section */}
      <Flex
        as="main"
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        mt={10}
        p={6}
        bg="white"
        boxShadow="lg"
        borderRadius="lg"
      >
        <Heading size="2xl" color="teal.600" mb={4}>
          Welcome to Elastic Eats
        </Heading>
        <Text fontSize="lg" color="gray.600" mb={6}>
          Discover personalized recipes tailored to your tastes, goals, and lifestyle.
        </Text>
        <Button
          colorScheme="teal"
          size="lg"
          onClick={() => setCount((count) => count + 1)}
        >
          Get Started
        </Button>
        <Text mt={4} color="gray.500">
          Button clicked <strong>{count}</strong> times
        </Text>
      </Flex>

      {/* Logos Section */}
      <Flex justify="center" align="center" mt={8} gap={6}>
        <Link href="https://vite.dev" isExternal>
          <Image src={viteLogo} alt="Vite logo" boxSize="100px" />
        </Link>
        <Link href="https://react.dev" isExternal>
          <Image src={reactLogo} alt="React logo" boxSize="100px" />
        </Link>
      </Flex>

      {/* Footer Section */}
      <Box as='footer' mt={12} py={4} bg="gray.200" textAlign="center">
        <Text color="gray.600">© 2025 Elastic Eats. All rights reserved.</Text>
      </Box>
    </Box>
  )
}

export default App;
