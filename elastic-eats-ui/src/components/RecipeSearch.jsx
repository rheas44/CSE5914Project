import { useState } from 'react';
import {
  Flex,
  Input,
  IconButton,
  VStack,
  Select,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { SearchIcon, HamburgerIcon, AddIcon, EditIcon, CheckIcon, DeleteIcon } from '@chakra-ui/icons';

const RecipeSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({
    type: 'Calories',
    min: '',
    max: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleFilterChange = (event) => {
    setNewFilter({ ...newFilter, [event.target.name]: event.target.value });
  };

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
    setNewFilter({ type: 'Calories', min: '', max: '' });
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

      // Pass back both the query and the results to the parent
      onSearch(query, data);
    } catch (error) {
      console.error("Search error:", error);
      // Even if there’s an error, pass the query back with empty results
      onSearch(query, []);
    }
  };

  return (
    <>
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
          <ModalHeader>Filter Nutrition Facts (Per Serving)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.500">
                Filters are applied to per serving nutritional values.
              </Text>
              <Flex>
                {/* Updated filter options to match new data keys */}
                <Select name="type" value={newFilter.type} onChange={handleFilterChange} flex="6">
                  <option value="Calories">Calories</option>
                  <option value="Protein (g)">Protein (g)</option>
                  <option value="Carbs (g)">Carbs (g)</option>
                  <option value="Fat (g)">Fat (g)</option>
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
    </>
  );
};

export default RecipeSearch;
