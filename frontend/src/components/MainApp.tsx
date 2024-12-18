// frontend/src/components/MainApp.tsx
import { ClipboardCheck } from "lucide-react"; // Add this import at the top
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { QAForm } from "./QAForm";
import { Dashboard } from "./Dashboard";
import { Login } from "./Login";
import { LoadingSpinner } from "./LoadingSpinner";
import { Navbar } from "./Navbar";
import { VerificationHome } from "./DataVerification/VerificationHome";

export function MainApp() {
  const { auth } = useAuth();
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "form" | "verification"
  >("dashboard");

  if (auth.loading) {
    return <LoadingSpinner />;
  }

  if (!auth.isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      {/* <main className="py-6">
        {currentPage === "dashboard" ? <Dashboard /> : <QAForm />}
      </main> */}
      <main className="py-6">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "form" && <QAForm />}
        {currentPage === "verification" && <VerificationHome />}
      </main>
    </div>
  );
}
