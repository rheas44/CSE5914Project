import { Flex } from '@chakra-ui/react';
import LandingHeader from './components/landing-header';
import LandingFooter from './components/landing-footer';
import About from './pages/about';
import Contact from './pages/contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/home";
import Pantry from "./pages/pantry";
import { UserProvider } from "./components/UserContext";

function App() {
  return (
    <UserProvider> {/* Wrap the entire application */}
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
              <Route path="/pantry" element={<Pantry />} />
            </Routes>
          </Flex>

          <LandingFooter />
        </Router>
      </Flex>
    </UserProvider>
  );
}

export default App;
