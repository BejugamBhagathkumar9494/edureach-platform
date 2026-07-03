import axios from "axios";

const getBaseURL = (): string => {
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return "https://edureach-platform-6.onrender.com/api";
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default API;