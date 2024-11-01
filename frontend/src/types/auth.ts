export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  key?: string;
  detail?: string;
  error?: string;
  user?: {
    username: string;
    id: number;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    username: string;
    id: number;
  } | null;
  loading: boolean;
  error: string | null;
}
