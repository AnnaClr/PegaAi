import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    apikey: import.meta.env.VITE_API_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export default api;
