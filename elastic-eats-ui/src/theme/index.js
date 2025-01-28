import { extendTheme } from "@chakra-ui/react"
import colors from "./colors"
import fonts from "./fonts"
//import components from "./components"

const customTheme = extendTheme({
    colors,   
    fonts
  })  //Add components in the future
  
export default customTheme;