/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 color tokens - Minimal white/grey palette
        // Main theme colors
        "primary": "#424242", // Darker grey as primary
        "primary-container": "#F5F5F5", // Very light grey
        "on-primary": "#FFFFFF",
        "on-primary-container": "#212121",
        
        "secondary": "#757575", // Medium grey
        "secondary-container": "#EEEEEE", // Light grey
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#212121",
        
        "tertiary": "#9E9E9E", // Light-medium grey
        "tertiary-container": "#F9F9F9", // Almost white
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#212121",
        
        // Error colors - Keeping subtly red for errors
        "error": "#B00020", // Less vibrant red
        "error-container": "#FFEAEE", // Very light pink
        "on-error": "#FFFFFF",
        "on-error-container": "#410002",
        
        // Background colors
        "surface": "#FFFFFF", // Pure white
        "surface-container": "#F8F9FA", // Very light grey
        "surface-container-low": "#FAFAFA", // Almost white
        "surface-container-high": "#F1F3F4", // Light grey
        "surface-container-highest": "#ECEFF1", // Slightly darker light grey
        "surface-variant": "#F5F5F5", // Very light grey
        "on-surface": "#212121", // Very dark grey (not pure black)
        "on-surface-variant": "#757575", // Medium grey for secondary text
        
        // Other utility colors
        "outline": "#E0E0E0", // Light grey for borders
        "outline-variant": "#EEEEEE", // Very light grey for subtle borders
        "inverse-surface": "#212121", // Dark grey
        "inverse-on-surface": "#F5F5F5", // Very light grey
      },
      fontSize: {
        // Material 3 typography scale
        "display-large": ["57px", { lineHeight: "64px", letterSpacing: "-0.25px" }],
        "display-medium": ["45px", { lineHeight: "52px" }],
        "display-small": ["36px", { lineHeight: "44px" }],
        
        "headline-large": ["32px", { lineHeight: "40px" }],
        "headline-medium": ["28px", { lineHeight: "36px" }],
        "headline-small": ["24px", { lineHeight: "32px" }],
        
        "title-large": ["22px", { lineHeight: "28px" }],
        "title-medium": ["16px", { lineHeight: "24px", letterSpacing: "0.15px", fontWeight: "500" }],
        "title-small": ["14px", { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" }],
        
        "body-large": ["16px", { lineHeight: "24px", letterSpacing: "0.15px" }],
        "body-medium": ["14px", { lineHeight: "20px", letterSpacing: "0.25px" }],
        "body-small": ["12px", { lineHeight: "16px", letterSpacing: "0.4px" }],
        
        "label-large": ["14px", { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" }],
        "label-medium": ["12px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" }],
        "label-small": ["11px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" }],
      }
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.m3-elevation-1': {
          'box-shadow': '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 1px 3px 1px rgba(0, 0, 0, 0.05)'
        },
        '.m3-elevation-2': {
          'box-shadow': '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 2px 6px 2px rgba(0, 0, 0, 0.05)'
        },
        '.m3-elevation-3': {
          'box-shadow': '0px 4px 8px 3px rgba(0, 0, 0, 0.07), 0px 1px 3px rgba(0, 0, 0, 0.1)'
        },
        '.m3-elevation-4': {
          'box-shadow': '0px 6px 10px 4px rgba(0, 0, 0, 0.07), 0px 2px 3px rgba(0, 0, 0, 0.1)'
        },
        '.m3-elevation-5': {
          'box-shadow': '0px 8px 12px 6px rgba(0, 0, 0, 0.07), 0px 4px 4px rgba(0, 0, 0, 0.1)'
        },
        '.m3-state-layer': {
          'position': 'relative',
          'overflow': 'hidden',
          '&::after': {
            'content': '""',
            'position': 'absolute',
            'inset': '0',
            'pointer-events': 'none',
            'background-color': 'transparent',
            'transition': 'background-color 0.15s ease-in-out',
          },
          '&:hover::after': {
            'background-color': 'currentColor',
            'opacity': '0.05',
          },
          '&:active::after': {
            'background-color': 'currentColor',
            'opacity': '0.08',
          }
        }
      })
    }
  ],
}