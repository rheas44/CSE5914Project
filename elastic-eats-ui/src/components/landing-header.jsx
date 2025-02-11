import { Box, Flex, Heading, Button, Text, Link, Image } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom';
import diningIcon from '../assets/dining.svg';

const LandingHeader = () => {
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
    </Flex>
    </Flex>
  </>
)}

export default LandingHeader