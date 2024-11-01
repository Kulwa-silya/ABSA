// frontend/src/components/MainApp.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { QAForm } from "./QAForm";
import { Login } from "./Login";
import { LoadingSpinner } from "./LoadingSpinner";

export function MainApp() {
  const { auth } = useAuth();

  if (auth.loading) {
    return <LoadingSpinner />;
  }

  return auth.isAuthenticated ? <QAForm /> : <Login />;
}
