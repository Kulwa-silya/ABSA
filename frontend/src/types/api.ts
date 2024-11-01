// --- frontend/src/types/api.ts ---
// These are our backend API types
export interface AspectDTO {
  id?: number;
  aspect_name: string;
  aspect_text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface CommentDTO {
  id?: number;
  text: string;
  general_sentiment: 'positive' | 'neutral' | 'negative';
  aspects: AspectDTO[];
  created_at?: string;
}

export interface PostDTO {
  id?: number;
  caption: string;
  comments: CommentDTO[];
  created_at?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}