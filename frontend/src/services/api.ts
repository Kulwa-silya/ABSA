// frontend/src/services/api.ts
import { AxiosError } from "axios";
import { authClient } from "./auth";
import { ApiError, PostDTO } from "../types/api";

const handleApiError = (error: AxiosError): never => {
  const apiError: ApiError = {
    message: error.message || "An error occurred",
    status: error.response?.status || 500,
    errors: error.response?.data?.errors,
  };
  throw apiError;
};

export const api = {
  async getAllPosts() {
    try {
      const response = await authClient.get<PostDTO[]>("api/posts/");
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async createPost(post: Omit<PostDTO, "id" | "created_at">) {
    try {
      const response = await authClient.post<PostDTO>("api/posts/", post);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async updatePost(id: number, post: Omit<PostDTO, "id" | "created_at">) {
    try {
      const response = await authClient.put<PostDTO>(`api/posts/${id}/`, post);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async deletePost(id: number) {
    try {
      await authClient.delete(`/posts/${id}/`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async exportCsv() {
    try {
      const response = await authClient.get("api/posts/export_csv/", {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  async searchSources(query: string) {
    try {
      const response = await authClient.get<SourceSuggestion[]>(
        `api/sources/search/?q=${encodeURIComponent(query)}`,
      );
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  async getDashboardStats() {
    try {
      const response = await authClient.get("api/posts/dashboard_stats/");
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};
