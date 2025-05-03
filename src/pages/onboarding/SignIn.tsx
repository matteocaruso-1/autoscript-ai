import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import TextInput from '../../components/forms/TextInput';
import DashboardPreview from '../../components/DashboardPreview';
import VerificationModal from '../../components/ui/VerificationModal';
import { supabase } from '../../lib/supabase';

const WEBHOOK_URL = 'https://hook.us2.make.com/h6twj111ekbh0wf4glyq1df38atrvuhi';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsResetting(true);
    setError('');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code_request: 'code request'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process password reset request');
      }

      setShowVerification(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setIsResetting(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    setIsVerifying(true);
    setVerificationError('');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          code_request: 'code request'
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verifications')
        .select('status')
        .eq('email', email)
        .single();

      if (verificationError || !verificationData) {
        throw new Error('Verification failed');
      }

      if (verificationData.status === 'success') {
        setShowVerification(false);
        navigate('/onboarding/reset-password', { state: { email } });
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/30">
      {/* LEFT HALF: full-height form */}
      <div className="flex-1 h-full p-12 flex items-center justify-center">
        <div className="w-full h-full bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-600/40 p-12 flex flex-col justify-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">
              Welcome back!
            </h2>
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/onboarding/step1')}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Create one here
              </button>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <TextInput
            id="email"
            type="email"
            label="Email Address"
            placeholder="your.email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-black/50 border-gray-700 text-white placeholder-gray-500"
          />

          <TextInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-black/50 border-gray-700 text-white placeholder-gray-500"
          />

          <div
            className="flex items-center space-x-2 text-gray-300 cursor-pointer"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
            <span className="select-none">Show password</span>
          </div>

          <button
            onClick={handleSignIn}
            disabled={!(email.trim() && password)}
            className="btn-primary w-full py-3"
          >
            Sign In
          </button>

          <button
            onClick={handleForgotPassword}
            disabled={isResetting || !email.trim()}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? 'Processing...' : 'Forgot your password?'}
          </button>
        </div>
      </div>

      {/* RIGHT HALF: dashboard preview */}
      <div className="flex-1 h-full p-8 flex items-center justify-center">
        <DashboardPreview displayName="Welcome Back" />
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerifyCode}
        isLoading={isVerifying}
        error={verificationError}
        email={email}
      />
    </div>
  );
};

export default SignIn;