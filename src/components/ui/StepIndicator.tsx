// src/components/ui/StepIndicator.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <React.Fragment key={stepNumber}>
            {/* Step circle + label */}
            <div className="flex items-center">
              <div
                className={[
                  'relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300',
                  isCompleted
                    ? 'bg-gradient-to-r from-purple-500 to-purple-700 shadow-lg'
                    : isActive
                    ? 'bg-white text-purple-700 shadow-lg'
                    : 'bg-gray-800 text-gray-500',
                ].join(' ')}
              >
                {isCompleted ? (
                  <Check size={20} className="text-white" />
                ) : (
                  <span className={`font-medium ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                    {stepNumber}
                  </span>
                )}

                {/* Underline for active/completed */}
                {(isActive || isCompleted) && (
                  <span
                    className={[
                      'absolute -bottom-1 inset-x-0 h-1 rounded-t-full',
                      isCompleted
                        ? 'bg-gradient-to-r from-purple-500 to-purple-700'
                        : isActive
                        ? 'bg-purple-500'
                        : '',
                    ].join(' ')}
                  />
                )}
              </div>

              <span
                className={`ml-3 text-sm font-semibold ${
                  isCompleted || isActive ? 'text-white' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 h-px">
                <div
                  className={[
                    'h-full transition-all duration-300',
                    isCompleted
                      ? 'bg-gradient-to-r from-purple-500 to-purple-700'
                      : 'bg-gray-700',
                  ].join(' ')}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;