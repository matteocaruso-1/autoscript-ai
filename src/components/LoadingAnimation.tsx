// src/components/LoadingAnimation.tsx
import React from 'react';

const LoadingAnimation: React.FC = () => (
  <>
    <style>
      {`
        @keyframes barWave {
          0%,100% { transform: scaleY(0.3); }
          50%      { transform: scaleY(1); }
        }
        @keyframes stubWave {
          0%,100% { transform: scaleX(0.3); }
          50%      { transform: scaleX(1); }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform: translateY(0); }
          40%         { transform: translateY(-4px); }
        }
        @keyframes pulseText {
          0%,100% { opacity: 0.6; }
          50%     { opacity: 1; }
        }
      `}
    </style>

    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center space-y-12">

        {/* Title */}
        <h1
          className="text-5xl font-bold bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #D8B4FE, #A78BFA, #C084FC)',
          }}
        >
          AutoScript AI
        </h1>

        {/* Refined Equalizer Bars */}
        <div className="flex items-center justify-center space-x-4 h-48">
          {/* Left stub */}
          <div
            className="bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 rounded-full origin-center will-change-transform"
            style={{
              width: '24px',
              height: '48px',
              transform: 'scaleX(0.3)',
              animation: 'stubWave 1.4s ease-in-out infinite',
              animationDelay: '0s',
              animationFillMode: 'both',
            }}
          />
          {/* Small bar */}
          <div
            className="bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 rounded-full origin-center will-change-transform"
            style={{
              width: '24px',
              height: '96px',
              transform: 'scaleY(0.3)',
              animation: 'barWave 1.4s ease-in-out infinite',
              animationDelay: '0.2s',
              animationFillMode: 'both',
            }}
          />
          {/* Medium bar */}
          <div
            className="bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 rounded-full origin-center will-change-transform"
            style={{
              width: '24px',
              height: '144px',
              transform: 'scaleY(0.3)',
              animation: 'barWave 1.4s ease-in-out infinite',
              animationDelay: '0.4s',
              animationFillMode: 'both',
            }}
          />
          {/* Tall bar */}
          <div
            className="bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 rounded-full origin-center will-change-transform"
            style={{
              width: '24px',
              height: '192px',
              transform: 'scaleY(0.3)',
              animation: 'barWave 1.4s ease-in-out infinite',
              animationDelay: '0.6s',
              animationFillMode: 'both',
            }}
          />
          {/* Medium bar */}
          <div
            className="bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 rounded-full origin-center will-change-transform"
            style={{
              width: '24px',
              height: '144px',
              transform: 'scaleY(0.3)',
              animation: 'barWave 1.4s ease-in-out infinite',
              animationDelay: '0.8s',
              animationFillMode: 'both',
            }}
          />
          {/* Small bar */}
          <div
            className="bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 rounded-full origin-center will-change-transform"
            style={{
              width: '24px',
              height: '96px',
              transform: 'scaleY(0.3)',
              animation: 'barWave 1.4s ease-in-out infinite',
              animationDelay: '1.0s',
              animationFillMode: 'both',
            }}
          />
          {/* Right stub */}
          <div
            className="bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 rounded-full origin-center will-change-transform"
            style={{
              width: '12px',
              height: '48px',
              transform: 'scaleX(0.3)',
              animation: 'stubWave 1.4s ease-in-out infinite',
              animationDelay: '1.2s',
              animationFillMode: 'both',
            }}
          />
        </div>

        {/* Status + three-dot bounce (dots aligned to baseline) */}
        <div className="flex items-baseline justify-center space-x-1">
          <span
            className="text-2xl font-medium bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #D8B4FE, #A78BFA, #C084FC)',
              animation: 'pulseText 2s ease-in-out infinite',
            }}
          >
            Generating Scripts
          </span>
          {['0s', '0.2s', '0.4s'].map((delay, i) => (
            <span
              key={i}
              className="inline-block rounded-full"
              style={{
                width: '0.25em',
                height: '0.25em',
                backgroundImage:
                  'linear-gradient(90deg, #D8B4FE, #A78BFA, #C084FC)',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                animation: `dotBounce 1s ${delay} ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </>
);

export default LoadingAnimation;