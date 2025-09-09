/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Existing colors
        'primary-brown': '#815536',
        'secondary-brown': '#c9baa8',
        'accent-brown': '#a67c52',
        'dark-brown': '#6d4429',
        'light-brown': '#b8a494',
        
        // NEW: Admin Panel Colors
        admin: {
          primary: '#4A90E2', // A vibrant blue for primary actions/highlights
          'primary-dark': '#2F6DBA', // Darker shade for hover/active states
          secondary: '#50E3C2', // A bright teal for secondary elements
          background: '#1A202C', // Dark background for the admin panel
          sidebar: '#2D3748', // Slightly lighter dark for sidebar
          card: '#4A5568', // Background for cards/sections
          border: '#424B5A', // Border color
          text: '#E2E8F0', // Light text for readability
          'text-dark': '#CBD5E0', // Slightly darker text
          'text-light': '#A0AEC0', // Lighter text for secondary info
          danger: '#E53E3E', // Red for destructive actions
          success: '#48BB78', // Green for success messages
          warning: '#ECC94B', // Yellow for warnings
        },
      },
    },
  },
  plugins: [],
};
