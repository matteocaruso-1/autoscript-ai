// src/pages/onboarding/Step4Start.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Step4Start: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="split-screen">
      {/* Left: final message */}
      <div className="flex flex-col justify-center p-10">
        <h1 className="text-4xl font-bold mb-6">You’re all set!</h1>
        <p className="text-gray-300 mb-8">
          Let’s get started converting your first script into X posts.
        </p>
        <button onClick={() => navigate('/generate')} className="btn-primary">
          Go to Generate →
        </button>
      </div>

      {/* Right: empty/celebration illustration */}
      <div className="flex items-center justify-center">
        <img src="/assets/celebration.png" alt="🎉" className="w-48 h-48" />
      </div>
    </div>
  );
};

export default Step4Start;