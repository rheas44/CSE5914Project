import { Box, Flex, Heading, Button, Text, Link, Image } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom';
import diningIcon from '../assets/dining.svg';
import { useDisclosure } from '@chakra-ui/react';
import LoginCard from './login-card';

const LandingHeader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>      
      <Flex
        as="header"
        justify="space-between"
        align="center"
        bg="primary.light"
        p={4}
        >
        <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
        <Flex align="center">
          <Image src={diningIcon} alt="Dining Icon" color='accent.green' boxSize="24px" mr={2} />
          <Heading size="md" color="accent.green" fontFamily="heading">
          elasticeats
          </Heading>
        </Flex>
        </Link>
        <Flex gap={4}>
          <Link as={RouterLink} to="/about" color="text.basic">
          About
          </Link>
          <Link as={RouterLink} to="/contact" color="text.basic">
          Contact
          </Link>
          <Link 
            as={RouterLink} 
            to="#" 
            color="text.basic" 
            onClick={onOpen} 
          >
            Login
          </Link>
        </Flex>
        </Flex>
        <LoginCard isOpen={isOpen} onClose={onClose} />
      </>
  )}

export default LandingHeader