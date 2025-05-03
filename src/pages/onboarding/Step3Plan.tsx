// src/pages/onboarding/Step3Plan.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const plans = [
  { id: 'starter', label: 'Starter', desc: 'Basic feature set' },
  { id: 'creator', label: 'Creator', desc: 'All you need to create' },
  { id: 'pro',     label: 'Pro',     desc: 'Unlimited everything' },
];

const Step3Plan: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br from-gray-900 via-black to-purple-900/30
        p-12
        flex flex-col items-center
      "
    >
      {/* Title */}
      <h1 className="text-4xl font-bold text-white">
        Which plan would you like?
      </h1>

      {/* Pricing Grid */}
      <div
        className="
          grid grid-cols-1 md:grid-cols-3
          gap-8
          w-full max-w-5xl
          mt-10
        "
      >
        {plans.map(plan => {
          const isActive = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`
                flex flex-col justify-between
                h-64
                p-8
                rounded-2xl
                bg-white/10 backdrop-blur-lg
                border ${
                  isActive
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-white/20 hover:border-purple-400'
                }
                transition
              `}
            >
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {plan.label}
                </h2>
                <p className="text-gray-300 mt-2">
                  {plan.desc}
                </p>
              </div>
              <div
                className={`
                  self-end
                  w-6 h-6
                  border-2 rounded-full
                  ${
                    isActive
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-500'
                  }
                `}
              />
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div
        className="
          mt-12
          w-full max-w-5xl
          flex justify-between
        "
      >
        <button
          onClick={() => navigate('/onboarding/step1')}
          className="
            px-6 py-3
            bg-white/10 backdrop-blur-md
            text-white
            rounded-lg
            hover:bg-white/20
            transition
          "
        >
          ← Back
        </button>

        <button
          onClick={() => navigate('/onboarding/step4')}
          disabled={!selected}
          className={`
            px-6 py-3
            text-white font-semibold
            rounded-lg
            ${
              selected
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90'
                : 'bg-gray-600/50 cursor-not-allowed'
            }
            transition
          `}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Step3Plan;