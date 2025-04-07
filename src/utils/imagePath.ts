import { AstroConfig } from 'astro';

// Get the base path from the Astro config
const getBasePath = () => {
  // In development, we can access the base path from the URL
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/strategic')) {
      return '/strategic';
    }
  }
  return '';
};

// Function to get the correct image path
export const getImagePath = (path: string) => {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}; 