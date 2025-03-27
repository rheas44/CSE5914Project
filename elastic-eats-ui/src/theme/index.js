import { extendTheme } from "@chakra-ui/react";
import colors from "./colors";
import fonts from "./fonts";
import fontSizes from "./fontSizes";

// Import our custom Button config
import Button from "./components/button";

const components = {
  Button
};

const customTheme = extendTheme({
  colors,
  fonts,
  fontSizes,
  components
});

export default customTheme;
