import { Flex, useDisclosure } from '@chakra-ui/react';
import LandingHeader from './components/landing-header';
import LandingFooter from './components/landing-footer';
import About from './pages/about';
import Contact from './pages/contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/home";
import LoginCard from './components/login-card';
import { useEffect } from "react";
import Signup from './pages/signup';

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (window.location.pathname === "/modal") {
      onOpen();
    }
  }, [onOpen]);

  return (
    <Flex
      direction="column"
      minH="100vh"
      bg="primary.light"
      fontFamily="body"
    >
      <Router>
        <LandingHeader />

        <Flex as="main" flex="1" justify="center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Flex>

        <LandingFooter />
      </Router>
    </Flex>
  );
}

export default App;
