
/**
 * SafePlace API Service
 * Optimized for local development in VS Code.
 */

// If you are running your backend in VS Code on port 5000, this is the correct URL.
const BASE_URL = 'http://localhost:5000/api'; 

const getHeaders = () => {
  const token = localStorage.getItem('safeplace_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  /**
   * Simple check to see if the backend is awake
   */
  checkHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/chat`, { method: 'GET', headers: getHeaders() });
      return res.ok;
    } catch {
      return false;
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Server Error: ${res.status}`);
      return result;
    } catch (error: any) {
      if (error.message.includes('fetch')) {
        throw new Error('BACKEND OFFLINE: Please run "node server.js" in your VS Code terminal.');
      }
      throw error;
    }
  },
  
  get: async (endpoint: string) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Server Error: ${res.status}`);
      return result;
    } catch (error: any) {
      throw error;
    }
  }
};
