import { Box, Heading, Text, Divider} from '@chakra-ui/react';
import { useUser } from "../components/UserContext";

const Pantry = () => {
    const { user } = useUser();

    return (
        user.username ? (
            <Box maxW="600px" mx="auto" textAlign="center" p={6}>
                <Heading size="2xl" color="accent.green" mb={4}>
                    Personal Pantry
                </Heading>
                <Text fontSize="lg" color="text.dark" mb={6}>
                    Have any questions or feedback? Feel free to reach out to any of our team members.
                </Text>

                <Divider my={6} />

                            
            </Box>
        ) : (
            <Box maxW="600px" mx="auto" textAlign="center" p={6}>
                <Heading size="2xl" color="accent.green" mb={4}>
                    Personal Pantry
                </Heading>

                <Divider my={6} />

                <Text fontSize="lg" color="text.dark" mb={6}>
                    Login in to view your personal pantry.
                </Text>
            </Box>
        )
    );
};

export default Pantry;
