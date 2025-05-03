import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import TextInput from '@/components/forms/TextInput';
import DashboardPreview from '@/components/DashboardPreview';
import { supabase } from '@/lib/supabase';

const OnboardingStep1: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError('');

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) throw signUpError;
      navigate('/onboarding/step3');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/30">
      <div className="container mx-auto min-h-screen flex">
        {/* LEFT HALF: full-height form */}
        <div className="flex-1 p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md glass-panel p-8 md:p-12 animate-fadeIn">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white">
                Welcome! Let's create your account
              </h2>
              <p className="text-gray-400">
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/onboarding/signin')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="mt-8 space-y-6">
              <TextInput
                id="displayName"
                label="Your Name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />

              <TextInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="e.g. your.awesome@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />

              <TextInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />

              <div
                className="flex items-center space-x-2 text-gray-300 cursor-pointer select-none"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
                <span>Show password</span>
              </div>

              <button
                onClick={handleSignUp}
                disabled={!(name.trim() && email.trim() && password) || isLoading}
                className="btn-primary w-full py-3"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account →'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT HALF: dashboard preview */}
        <div className="hidden md:flex flex-1 p-8 items-center justify-center">
          <DashboardPreview displayName={name.trim() || 'Your Name'} />
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep1;