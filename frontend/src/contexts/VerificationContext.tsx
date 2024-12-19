// frontend/src/contexts/VerificationContext.tsx
import React, { createContext, useContext, useReducer } from "react";
import { PostDTO } from "../types/api";
import { api } from "../services/api";

interface VerificationState {
  post: PostDTO | null;
  history: PostDTO[];
  currentIndex: number;
  isSaving: boolean;
  error: string | null;
}

type VerificationAction =
  | { type: "SET_POST"; payload: PostDTO }
  | { type: "UPDATE_POST"; payload: PostDTO }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "START_SAVING" }
  | { type: "END_SAVING" }
  | { type: "SET_ERROR"; payload: string };

const initialState: VerificationState = {
  post: null,
  history: [],
  currentIndex: -1,
  isSaving: false,
  error: null,
};

function verificationReducer(
  state: VerificationState,
  action: VerificationAction,
): VerificationState {
  switch (action.type) {
    case "SET_POST":
      return {
        ...state,
        post: action.payload,
        history: [action.payload],
        currentIndex: 0,
        error: null,
      };

    case "UPDATE_POST":
      const newHistory = [
        ...state.history.slice(0, state.currentIndex + 1),
        action.payload,
      ];
      return {
        ...state,
        post: action.payload,
        history: newHistory,
        currentIndex: newHistory.length - 1,
        error: null,
      };

    case "UNDO":
      if (state.currentIndex <= 0) return state;
      return {
        ...state,
        post: state.history[state.currentIndex - 1],
        currentIndex: state.currentIndex - 1,
      };

    case "REDO":
      if (state.currentIndex >= state.history.length - 1) return state;
      return {
        ...state,
        post: state.history[state.currentIndex + 1],
        currentIndex: state.currentIndex + 1,
      };

    case "START_SAVING":
      return {
        ...state,
        isSaving: true,
        error: null,
      };

    case "END_SAVING":
      return {
        ...state,
        isSaving: false,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isSaving: false,
      };

    default:
      return state;
  }
}

interface VerificationContextType {
  state: VerificationState;
  setPost: (post: PostDTO) => void;
  updatePost: (post: PostDTO) => void;
  undo: () => void;
  redo: () => void;
  saveChanges: (post: PostDTO) => Promise<void>;
}

const VerificationContext = createContext<VerificationContextType | undefined>(
  undefined,
);

export function VerificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(verificationReducer, initialState);

  const setPost = (post: PostDTO) => {
    dispatch({ type: "SET_POST", payload: post });
  };

  const updatePost = (post: PostDTO) => {
    dispatch({ type: "UPDATE_POST", payload: post });
  };

  const undo = () => {
    dispatch({ type: "UNDO" });
  };

  const redo = () => {
    dispatch({ type: "REDO" });
  };

  const saveChanges = async (post: PostDTO) => {
    try {
      dispatch({ type: "START_SAVING" });

      // First update the post
      await api.updatePost(post.id!, post);

      // Then mark it as reviewed if it wasn't already
      if (post.status === "unreviewed") {
        await api.reviewPost(post.id!);
      }

      dispatch({ type: "END_SAVING" });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to save changes",
      });
      throw error;
    }
  };

  return (
    <VerificationContext.Provider
      value={{ state, setPost, updatePost, undo, redo, saveChanges }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error(
      "useVerification must be used within a VerificationProvider",
    );
  }
  return context;
}
