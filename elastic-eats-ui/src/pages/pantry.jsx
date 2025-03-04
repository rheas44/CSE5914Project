import { Box, Heading, Text, Divider} from '@chakra-ui/react';
import { useUser } from "../components/UserContext";

const Pantry = () => {
    const { user } = useUser();

    const handleSubmit = async (event) => {
        try {
            const response = await fetch(`http://localhost:5001/pantry`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user.user_id }),
            });
            const data = await response.json();
    
            if (response.status === 400) {
              console.error("Pantry Retrival error:", data.error);
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
        user.username ? (
            <Box maxW="600px" mx="auto" textAlign="center" p={6}>
                <Heading size="2xl" color="accent.green" mb={4}>
                    Personal Pantry
                </Heading>
                <Text fontSize="lg" color="text.dark" mb={6}>
                    Welcome to your perosnal pantry! Keep track of all your ingredients here.
                </Text>
                <Divider my={6} />
                <Text id="error" color="red.500" fontSize="sm"></Text>

                            
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
