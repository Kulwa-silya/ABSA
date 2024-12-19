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

  async updatePost(id: number, post: PostDTO) {
    try {
      // Remove fields that shouldn't be sent
      const {
        id: _,
        created_at,
        reviewed_at,
        reviewed_by,
        username,
        ...updateData
      } = post;

      // Clean up comments and aspects
      const cleanedData = {
        ...updateData,
        comments: updateData.comments.map((comment) => ({
          ...comment,
          aspects: comment.aspects.map((aspect) => ({
            // Only include existing numeric IDs
            ...(typeof aspect.id === "number" ? { id: aspect.id } : {}),
            aspect_name: aspect.aspect_name,
            aspect_text: aspect.aspect_text || "",
            sentiment: aspect.sentiment,
          })),
        })),
      };

      const response = await authClient.put<PostDTO>(
        `api/posts/${id}/`,
        cleanedData,
      );
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

  // new entries
  async getUnreviewedPosts() {
    try {
      const response = await authClient.get<PostDTO[]>("api/posts/unreviewed/");
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async getReviewedPosts() {
    try {
      const response = await authClient.get<PostDTO[]>("api/posts/reviewed/");
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async reviewPost(postId: number) {
    try {
      const response = await authClient.post<PostDTO>(
        `api/posts/${postId}/review/`,
      );
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};
