import { Flex } from '@chakra-ui/react';
import LandingHeader from './components/landing-header';
import LandingFooter from './components/landing-footer';
import About from './pages/about';
import Contact from './pages/contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/home";

function App() {
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
          </Routes>
        </Flex>

        <LandingFooter />
      </Router>
    </Flex>
  );
}

export default App;
