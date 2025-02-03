import { Box, Flex, Heading, Button, Text, Link, Image } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom';

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
        <Heading size="lg" color="accent.green" fontFamily="heading">
          Elastic Eats
        </Heading>
        <Flex gap={4}>
          <Link as={RouterLink} to="/about" color="text.basic">
            About
          </Link>
          <Link as={RouterLink} to="/contact" color="text.basic">
            Contact
          </Link>
        </Flex>
      </Flex>

      <Flex
        as="main"
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        mt={10}
        p={6}
        bg="primary.light"
        color="text.basic"
        borderRadius="lg"
      >
       
      </Flex>
    </>
)}

export default LandingHeader