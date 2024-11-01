// --- frontend/src/hooks/usePost.ts ---

import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { PostDTO, ApiError } from '../types/api';

interface UsePostReturn {
  posts: PostDTO[];
  loading: boolean;
  error: ApiError | null;
  createPost: (post: Omit<PostDTO, 'id' | 'created_at'>) => Promise<void>;
  fetchPosts: () => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  exportCsv: () => Promise<void>;
}

export const usePost = (): UsePostReturn => {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (post: Omit<PostDTO, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newPost = await api.createPost(post);
      setPosts(prev => [...prev, newPost]);
    } catch (err) {
      setError(err as ApiError);
      throw err; // Re-throw to handle in the UI
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await api.deletePost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportCsv = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const blob = await api.exportCsv();
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'posts_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    loading,
    error,
    createPost,
    fetchPosts,
    deletePost,
    exportCsv,
  };
};