// frontend/src/services/auth.ts
import axios from "axios";
import { AuthCredentials, AuthResponse, User } from "../types/auth";

// const API_URL = "http://185.137.122.217";
const API_URL = "http://185.137.122.217";

export const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token to requests if it exists
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `JWT ${token}`;
  }
  return config;
});

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await authClient.post("/auth/jwt/create/", credentials);
      const { access: token } = response.data;

      // Get user data
      const userResponse = await authClient.get("/auth/users/me/", {
        headers: { Authorization: `JWT ${token}` },
      });

      return {
        token,
        user: userResponse.data,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  },

  async logout(): Promise<void> {
    // JWT is stateless, so we just remove the token
    localStorage.removeItem("token");
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await authClient.get("/auth/users/me/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to get user data",
      );
    }
  },
};
