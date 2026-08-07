/**
 * SafePlace API Service
 */

// In dev, Vite runs on :3000 and the backend runs separately on :5000.
// In production (Vercel), frontend and API share one domain, so a relative
// path is enough and there's no CORS/URL to configure.
const BASE_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

const getHeaders = () => {
  const token = localStorage.getItem('safeplace_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  /**
   * Simple check to see if the backend is awake
   */
  checkHealth: async () => {
    try {
      // Use the public API root which is reachable without authentication
      const res = await fetch(`${BASE_URL}`, { method: 'GET' });
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
