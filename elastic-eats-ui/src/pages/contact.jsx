import { Box, Heading, Text, List, ListItem, Link, Divider, Flex } from '@chakra-ui/react';

const teamMembers = [
  { name: "Avery Doctor", email: "doctor.26@osu.edu" },
  { name: "Adam Flis", email: "flis.14@osu.edu" },
  { name: "Brian Foster", email: "foster.1373@osu.edu" },
  { name: "Rhea Supekar", email: "supekar.4@osu.edu" },
  { name: "Nathan Zarif", email: "zarif.3@osu.edu" },
];

const Contact = () => {
  return (
    <Box maxW="600px" mx="auto" textAlign="center" p={6}>
      <Heading size="2xl" color="accent.green" mb={4}>
        Contact the Team
      </Heading>
      <Text fontSize="lg" color="text.dark" mb={6}>
        Have any questions or feedback? Feel free to reach out to any of our team members.
      </Text>

      <Divider my={6} />

      <Heading size="lg" color="text.basic" mb={4}>
        Team Members
      </Heading>
      <List spacing={4} mx="auto" maxW="500px">
        {teamMembers.map((member, index) => (
          <ListItem key={index} py={3} borderBottom="1px solid #ddd">
            <Flex direction="column" align="center">
              <Text fontSize="lg" fontWeight="bold">{member.name}</Text>
              <Link href={`mailto:${member.email}`} color="accent.green" fontSize="md">
                {member.email}
              </Link>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Contact;


