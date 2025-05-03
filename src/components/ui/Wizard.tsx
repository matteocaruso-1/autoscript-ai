// src/components/ui/Wizard.tsx
import React, { ReactNode } from 'react';

interface WizardContainerProps {
  children: ReactNode;
}

interface WizardStepProps {
  title: string;
  children: ReactNode;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({ children }) => {
  return (
    <div
      className="
        w-full max-w-4xl mx-auto
        bg-gray-900/60 border border-purple-600/40
        backdrop-blur-xl rounded-2xl p-8 space-y-8
        shadow-[0_4px_30px_rgba(0,0,0,0.5)]
      "
    >
      {children}
    </div>
  );
};

export const WizardStep: React.FC<WizardStepProps> = ({ title, children }) => {
  return (
    <div className="animate-fadeIn space-y-6">
      <h2
        className="
          text-2xl font-extrabold
          text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]
        "
      >
        {title}
      </h2>
      {children}
    </div>
  );
};

// default export for compatibility
export default { WizardContainer, WizardStep };