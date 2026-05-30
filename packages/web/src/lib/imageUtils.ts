// Utility to handle image URLs across environments

// Always use the API server URL for images
const API_URL = 'http://127.0.0.1:4000';

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // Already a full URL or data URL
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Relative path - prepend API URL
  return `${API_URL}${path}`;
};

// Convert full URL to relative path for MySQL storage
export const getRelativeImageUrl = (fullUrl: string): string => {
  if (!fullUrl) return '';
  
  // Already a relative path
  if (fullUrl.startsWith('/')) {
    return fullUrl;
  }
  
  // Extract path from full URL
  try {
    const url = new URL(fullUrl);
    return url.pathname;
  } catch {
    return fullUrl;
  }
};
