import { Box, Flex, Heading, Button, Text, Link, Image } from '@chakra-ui/react'

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
          <Link href="#about" color="text.basic">
            About
          </Link>
          <Link href="#features" color="text.basic">
            Features
          </Link>
          <Link href="#contact" color="text.basic">
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
        <Heading size="2xl" color="accent.green" mb={4} fontFamily="heading">
          Welcome to Elastic Eats
        </Heading>
        <Text fontSize="lg" mb={6}>
          Discover personalized recipes tailored to your tastes, goals, and lifestyle.
        </Text>
       
      </Flex>
    </>
)}

export default LandingHeader