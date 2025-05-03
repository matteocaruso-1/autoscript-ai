import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OnboardingStep1 from './onboarding/OnboardingStep1';
import SignIn from './onboarding/SignIn';
import ResetPassword from './onboarding/ResetPassword';
import Step3Plan from './onboarding/Step3Plan';
import Step4Start from './onboarding/Step4Start';

const Onboarding: React.FC = () => (
  <div className="min-h-screen bg-black">
    <Routes>
      <Route path="step1" element={<OnboardingStep1 onNext={() => {}} />} />
      <Route path="signin" element={<SignIn />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="step3" element={<Step3Plan />} />
      <Route path="step4" element={<Step4Start />} />
      {/* default to signin */}
      <Route path="*" element={<Navigate to="signin" replace />} />
    </Routes>
  </div>
);

export default Onboarding;