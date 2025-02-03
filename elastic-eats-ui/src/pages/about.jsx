import { Box, Heading, Text, List, ListItem, ListIcon, Divider } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const About = () => {
  return (
    <Box maxW="800px" mx="auto" textAlign="center" p={6}>
      <Heading size="2xl" color="accent.green" mb={4}>
        About Elastic Eats
      </Heading>
      <Text fontSize="lg" color="text.dark" mb={6}>
        Elastic Eats is a cutting-edge recipe management system that leverages modern web technologies
        to deliver a fast, user-friendly, and personalized cooking experience. 
      </Text>

      <Divider my={6} />

      <Heading size="lg" color="text.basic" mb={4}>
        Technologies Used
      </Heading>
      <List spacing={3} textAlign="left" mx="auto" maxW="600px">
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="accent.green" />
          <strong>Vite</strong> - Lightning-fast development bundler for modern web applications.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="accent.green" />
          <strong>React</strong> - A powerful front-end library for building user interfaces.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="accent.green" />
          <strong>Chakra UI</strong> - A flexible and accessible component library for styling.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="accent.green" />
          <strong>Docker</strong> - Used to containerize and manage the application efficiently.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="accent.green" />
          <strong>Elasticsearch</strong> - Provides high-performance search capabilities.
        </ListItem>
      </List>

      <Divider my={6} />

      <Text fontSize="lg" color="text.dark" mt={4}>
        Our goal is to simplify meal planning and help users discover new recipes tailored to their dietary preferences. 
        Elastic Eats leverages cutting-edge technology to provide a seamless, enjoyable cooking experience.
      </Text>
    </Box>
  );
};

export default About;
