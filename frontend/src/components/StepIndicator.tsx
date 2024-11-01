import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index < currentStep
                  ? 'bg-indigo-600 text-white'
                  : index === currentStep
                  ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              className={`ml-2 text-sm hidden sm:inline ${
                index === currentStep ? 'text-indigo-600 font-medium' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}