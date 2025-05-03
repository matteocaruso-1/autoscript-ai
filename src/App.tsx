import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Onboarding from './pages/Onboarding';
import GenerateTweets from './pages/GenerateTweets';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Router>
        <Routes>
          {/* Default route redirects to create account */}
          <Route path="/" element={<Navigate to="/onboarding/step1" replace />} />

          {/* Onboarding flow */}
          <Route path="/onboarding/*" element={<Onboarding />} />

          {/* Tweet-generation wizard */}
          <Route path="/generate" element={<GenerateTweets />} />

          {/* Dashboard overview */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Catch-all → redirect to create account */}
          <Route path="*" element={<Navigate to="/onboarding/step1" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;