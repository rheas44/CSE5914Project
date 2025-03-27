// theme/components/button.js

const Button = {
    baseStyle: {
      fontWeight: "bold",
      borderRadius: "md"
    },
    sizes: {
      // You can define custom sizes or reuse Chakra defaults (xs, sm, md, lg, etc.)
      md: {
        fontSize: "md",
        px: 4,
        py: 2
      }
    },
    variants: {
      // A generic custom variant that can handle any text or icon
      customButton: {
        bg: "background.primary",
        color: "text.dark",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        // If you often include icons, you can add spacing logic:
        // svg: { marginRight: "0.5rem" },
        _hover: {
          bg: "background.inverted",
          color: "primary.light"
        },
        _active: {
          bg: "primary.dark",
        }
      }
    },
    defaultProps: {
      // optional: set default variant or size if you want
      // variant: "customButton",
      // size: "md"
    }
  };
  
  export default Button
  