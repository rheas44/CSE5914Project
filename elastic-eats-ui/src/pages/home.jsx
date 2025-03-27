import { useState, useEffect } from 'react';
import { Flex, Heading, Text, Grid, Divider, VStack, Button, Input, Select, IconButton } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { DeleteIcon, SearchIcon, HamburgerIcon, AddIcon, EditIcon, CheckIcon } from '@chakra-ui/icons';
import RecipeCard from '../components/recipe-card';

const Home = () => {
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState([]);
    const [newFilter, setNewFilter] = useState({
        type: 'calories',
        min: '',
        max: '',
    });
    const [editingIndex, setEditingIndex] = useState(null);

    // Fetch three random recipes on component mount
    useEffect(() => {
        async function fetchTopRecipes() {
            try {
                const response = await fetch("http://localhost:5001/recipe_box_v2/random", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Top Recipes API Response:", data);
                setRecipes(data);
            } catch (error) {
                console.error("Error fetching top recipes:", error);
                setRecipes([]);
            }
        }
        fetchTopRecipes();
    }, []);

    const handleDeleteFilter = (index) => {
        const updatedFilters = filters.filter((_, i) => i !== index);
        setFilters(updatedFilters);
    };

    const handleSaveFilter = () => {
        if (newFilter.min < 0 || newFilter.max < 0) {
            alert("Please enter valid positive numbers for min and max values.");
            return;
        } else if (newFilter.min === '' || newFilter.max === '') {
            alert("Please enter numerical values for min and max values.");
            return;
        }
    
        if (editingIndex !== null) {
            const updatedFilters = [...filters];
            updatedFilters[editingIndex] = newFilter;
            setFilters(updatedFilters);
            setEditingIndex(null);
        } else {
            if (filters.some(filter => filter.type === newFilter.type)) {
                alert(`Filter for ${newFilter.type} already exists. Please edit it instead.`);
                return;
            }
            setFilters([...filters, newFilter]);
        }
        setNewFilter({ type: 'calories', min: '', max: '' });
    };

    const handleFilterChange = (event) => {
        setNewFilter({ ...newFilter, [event.target.name]: event.target.value });
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            const response = await fetch("http://localhost:5001/recipe_box_v2/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query,
                    filters,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data);
            setRecipes(data);
        } catch (error) {
            console.error("Search error:", error);
            setRecipes([]);
        }
    };

    return (
        <Flex
            as="main"
            direction="column"
            align="center"
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
                Search for recipes and discover new dishes tailored to your tastes.
            </Text>

            <Heading size="md" mt={4}>
                <Text color='accent.green'>
                    Top Recipes Today
                </Text>
            </Heading>

            <Divider my={6} borderColor='text.dark' />

            <Grid
                templateColumns={{ base: "1fr", sm: "1fr", lg: "repeat(3, 1fr)" }}
                gap={6}
                w="100%"
                maxW="900px"
                justifyContent="center"
                justifyItems="center"
                mx="auto"
            >
                {recipes.length > 0
                  ? recipes.map((recipe, index) => (
                      <RecipeCard key={index} recipe={recipe} hasNutrition={true} />
                    ))
                  : <Text>No recipes to display.</Text>}
            </Grid>

            <Divider my={6} borderColor='text.dark' />

            <Heading size="md" my={4}>
                <Text color='accent.green'>
                    Enter keywords to search for recipes
                </Text>
            </Heading>

            <VStack spacing={4} mb={6} width="100%">
                <Flex width="100%">
                    <Input
                        placeholder="Search for recipes..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        bg="white"
                    />
                    <IconButton
                        aria-label="Search"
                        icon={<SearchIcon />}
                        colorScheme="green"
                        onClick={handleSearch}
                        ml={2}
                    />
                    <IconButton
                        aria-label="Filter"
                        icon={<HamburgerIcon />}
                        colorScheme="green"
                        onClick={() => setIsFilterOpen(true)}
                        ml={2}
                    />
                </Flex>
            </VStack>

            <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Filter Nutrition Facts</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Flex>
                                <Select name="type" value={newFilter.type} onChange={handleFilterChange} flex="6">
                                    <option value="calories">Calories</option>
                                    <option value="protein_g">Protein</option>
                                    <option value="carbohydrates_total_g">Carbs</option>
                                    <option value="fat_total_g">Fat</option>
                                </Select>
                                <Input
                                    type="number"
                                    name="min"
                                    placeholder="Min"
                                    value={newFilter.min}
                                    onChange={handleFilterChange}
                                    flex="3"
                                    ml={2}
                                />
                                <Input
                                    type="number"
                                    name="max"
                                    placeholder="Max"
                                    value={newFilter.max}
                                    onChange={handleFilterChange}
                                    flex="3"
                                    ml={2}
                                />
                                <IconButton 
                                    colorScheme="green" 
                                    onClick={handleSaveFilter} 
                                    icon={editingIndex !== null ? <CheckIcon /> : <AddIcon />} 
                                    aria-label={editingIndex !== null ? "Save filter" : "Add filter"} 
                                    ml={2} 
                                />
                            </Flex>

                            {filters.map((filter, index) => (
                                <Flex key={index} p={2} align="center" justify="space-between" bg="gray.100" borderRadius="md">
                                    <Text flex="1">{filter.type}: {filter.min} - {filter.max}</Text>
                                    <IconButton
                                        aria-label="Edit filter"
                                        icon={<EditIcon />}
                                        colorScheme="blue"
                                        onClick={() => {
                                            setNewFilter(filter);
                                            setEditingIndex(index);
                                        }}
                                        mr={2}
                                    />
                                    <IconButton
                                        aria-label="Delete filter"
                                        icon={<DeleteIcon />}
                                        colorScheme="red"
                                        onClick={() => handleDeleteFilter(index)}
                                    />
                                </Flex>
                            ))}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        {filters.length > 0 && editingIndex === null && (
                            <Button colorScheme="green" onClick={() => { setIsFilterOpen(false); handleSearch(); }}>
                                Apply
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default Home;
