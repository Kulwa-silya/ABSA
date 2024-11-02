// frontend/src/components/SourceInput.tsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";

interface SourceSuggestion {
  id: number;
  name: string;
  usage_count: number;
}

interface SourceInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourceInput({ value, onChange }: SourceInputProps) {
  const [suggestions, setSuggestions] = useState<SourceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const searchSources = async () => {
      if (value.length >= 2) {
        try {
          const response = await api.searchSources(value);
          setSuggestions(response);
        } catch (error) {
          console.error("Error fetching sources:", error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(searchSources, 300);
    return () => clearTimeout(debounce);
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Example: '@instagram_account'"
        className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        required
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => {
                onChange(suggestion.name);
                setShowSuggestions(false);
              }}
            >
              <span>{suggestion.name}</span>
              <span className="text-sm text-gray-500">
                Used {suggestion.usage_count} times
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
