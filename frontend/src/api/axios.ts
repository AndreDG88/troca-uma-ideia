import axios from "axios";

// Cria uma instância de axios com baseURL vinda do .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
