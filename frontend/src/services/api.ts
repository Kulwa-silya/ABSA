import axios, { AxiosError } from "axios";
import { ApiError, PostDTO } from "../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleApiError = (error: AxiosError): never => {
  const apiError: ApiError = {
    message: error.message,
    status: error.response?.status || 500,
    errors: error.response?.data?.errors,
  };
  throw apiError;
};

export const api = {
  async getAllPosts() {
    try {
      const response = await apiClient.get<PostDTO[]>("/posts/");
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async createPost(post: Omit<PostDTO, "id" | "created_at">) {
    try {
      const response = await apiClient.post<PostDTO>("api/posts/", post);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async getPost(id: number) {
    try {
      const response = await apiClient.get<PostDTO>(`/posts/${id}/`);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async updatePost(id: number, post: Omit<PostDTO, "id" | "created_at">) {
    try {
      const response = await apiClient.put<PostDTO>(`/posts/${id}/`, post);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async deletePost(id: number) {
    try {
      await apiClient.delete(`/posts/${id}/`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async exportCsv() {
    try {
      const response = await apiClient.get("/posts/export_csv/", {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};
