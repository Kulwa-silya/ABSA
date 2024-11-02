// frontend/src/components/Navbar.tsx
import React from "react";
import { BarChart3, FormInput, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./Button";

interface NavbarProps {
  currentPage: "dashboard" | "form";
  onPageChange: (page: "dashboard" | "form") => void;
}

export function Navbar({ currentPage, onPageChange }: NavbarProps) {
  const { auth, logout } = useAuth();

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Social Media QA
              </h1>
            </div>
            <div className="ml-6 flex space-x-4">
              <button
                onClick={() => onPageChange("dashboard")}
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                  currentPage === "dashboard"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => onPageChange("form")}
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                  currentPage === "form"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FormInput className="w-5 h-5 mr-2" />
                Form
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {auth.user?.username}
            </span>
            <Button
              type="button"
              variant="secondary"
              icon={LogOut}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
