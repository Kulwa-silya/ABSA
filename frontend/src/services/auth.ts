import axios from "axios";
import { AuthCredentials, AuthResponse } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login/`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Failed to login" };
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout/`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (error: any) {
      throw error.response?.data || { error: "Failed to logout" };
    }
  },

  async checkAuth(): Promise<AuthResponse> {
    try {
      const response = await axios.get(`${API_URL}/api/auth/user/`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Failed to check auth status" };
    }
  },
};
