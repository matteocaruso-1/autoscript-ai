import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TextInput from '../components/forms/TextInput';
import TextArea from '../components/forms/TextArea';
import TagInput from '../components/forms/TagInput';
import FileUpload from '../components/forms/FileUpload';
import StepIndicator from '../components/ui/StepIndicator';
import { WizardContainer, WizardStep } from '../components/ui/Wizard';
import LoadingAnimation from '../components/LoadingAnimation';
import { Slider } from '../components/ui/slider';

type FormData = {
  contentType: 'video' | 'text';
  videoFile: (File & { url?: string; timestamp?: string }) | null;
  videoUrl: string;
  scriptText: string;
  profileUrl: string;
  targetAudience: string;
  tweetCount: number;
  maxCharsPerTweet: number;
  niche: string[];
  tweetStyles: string[];
  tone: string;
  hobbies: string;
  age: number | '';
  gender: string;
  extraContext: string;
  uploadProgress: number;
};

type ValidationErrors = {
  videoUrl?: string;
  scriptText?: string;
  profileUrl?: string;
  targetAudience?: string;
};

const defaultFormData: FormData = {
  contentType: 'text',
  videoFile: null,
  videoUrl: '',
  scriptText: '',
  profileUrl: '',
  targetAudience: '',
  tweetCount: 5,
  maxCharsPerTweet: 150,
  niche: [],
  tweetStyles: [],
  tone: 'Casual',
  hobbies: '',
  age: '',
  gender: '',
  extraContext: '',
  uploadProgress: 0,
};

const tweetCountOptions = [5,6,7,8,9,10,11,12,13,14,15,20,25,30,40,50];
const tweetStyleSuggestions = [
  'Mini Lessons','Myth Busting','Quotes + Take',
  'Thread Starters','Hot Takes','Case Studies'
];
const genderOptions = ['Male','Female'];

const WEBHOOK_URL = 'https://hook.us2.make.com/1d3jjckjoh3ju3c9ocadrwlxwsji608n';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`;
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}$/;
const TWITTER_URL_REGEX = /^https?:\/\/(www\.)?(twitter|x)\.com\/[\w_]+\/?$/;

const GenerateTweets: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState<'url'|'file'>('file');
  const [userSession, setUserSession] = useState<any>(null);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Require login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return navigate('/onboarding/signin');
      setUserSession(session);
    });
  }, [navigate]);

  const validateField = (field: keyof FormData, value: any): string|undefined => {
    switch (field) {
      case 'videoUrl':
        if (formData.contentType==='video' && videoMode==='url') {
          if (!value) return 'Video URL is required';
          if (!YOUTUBE_URL_REGEX.test(value)) return 'Please enter a valid YouTube URL';
        }
        break;
      case 'scriptText':
        if (formData.contentType==='text') {
          if (!value) return 'Script text is required';
          if (value.length<300) return 'Script must be at least 300 characters';
        }
        break;
      case 'profileUrl':
        if (!value) return 'Profile URL is required';
        if (!TWITTER_URL_REGEX.test(value)) return 'Please enter a valid Twitter/X profile URL';
        break;
      case 'targetAudience':
        if (!value) return 'Target audience is required';
        if (value.length<10) return 'Please provide more detail about your target audience';
        break;
    }
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};
    (['videoUrl','scriptText','profileUrl','targetAudience'] as (keyof FormData)[])
      .forEach(key => {
        const err = validateField(key, formData[key]);
        if (err) errors[key as keyof ValidationErrors] = err;
      });
    setValidationErrors(errors);
    return Object.keys(errors).length===0;
  };

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    if (field === 'maxCharsPerTweet') {
      const benchmarkValue = Math.round(value as number / 10) * 10;
      const clampedValue = Math.max(50, Math.min(250, benchmarkValue));
      setFormData(prev => ({ ...prev, [field]: clampedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    const err = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: err }));
  };

  const uploadToCloudinary = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => {
        if (!e.lengthComputable) return;
        const pct = Math.round((e.loaded / e.total) * 100);
        handleChange('uploadProgress', pct as any);
        if (pct === 100) {
          setShowUploadSuccess(true);
          setTimeout(() => setShowUploadSuccess(false), 3000);
        }
      };
      xhr.onload = () =>
        xhr.status === 200
          ? resolve(JSON.parse(xhr.responseText).secure_url)
          : reject(new Error('Upload failed'));
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.open('POST', CLOUDINARY_URL);
      xhr.send(form);
    });
  };

  const handleFileChange = async (file: (File & { url?:string; timestamp?:string }) | null) => {
    setUploadError(null);
    handleChange('contentType', file ? 'video' : 'text');
    handleChange('videoFile', file as any);
    handleChange('videoUrl','');
    handleChange('uploadProgress',0 as any);
    setShowUploadSuccess(false);
    if (file) {
      handleChange('scriptText','');
      try {
        const url = await uploadToCloudinary(file);
        handleChange('videoUrl', url as any);
      } catch {
        setUploadError('Failed to upload video');
      }
    }
  };

  const isStep1Valid = () => {
    if (!formData.profileUrl || !TWITTER_URL_REGEX.test(formData.profileUrl)) return false;
    if (!formData.targetAudience || formData.targetAudience.length < 10) return false;
    if (formData.contentType === 'video') {
      if (videoMode === 'file') {
        return !uploadError && formData.uploadProgress === 100 && !!formData.videoUrl;
      }
      return !!formData.videoUrl && YOUTUBE_URL_REGEX.test(formData.videoUrl);
    }
    return formData.scriptText.length >= 300;
  };

  const handleSubmit = async () => {
    if (currentStep === 1) {
      if (!validateForm()) return;
      if (isStep1Valid()) {
        setCurrentStep(2);
      }
      return;
    }

    setIsSubmitting(true);
    const start = Date.now();

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_email: userSession.user.email,
          user_id: userSession.user.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate tweets');
      }

      const elapsed = Date.now() - start;
      if (elapsed < 20_000) {
        await new Promise(r => setTimeout(r, 20_000 - elapsed));
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setUploadError('Failed to generate tweets. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!userSession) return null;
  if (isSubmitting) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition"
          >
            Go to Dashboard →
          </button>
        </div>

        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            AutoScript AI
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Transform your content into engaging tweets that convert
          </p>
        </header>

        {/* Outer Panel */}
        <div className="bg-[#000000] backdrop-blur-sm rounded-2xl border border-gray-800 shadow-md p-8">
          <WizardContainer>
            <div className="mb-12">
              <StepIndicator
                steps={['Starter Info','Advanced Options']}
                currentStep={currentStep}
              />
            </div>

            {/* Inner Panel */}
            <div className="bg-[#000000] backdrop-blur-xl rounded-2xl border border-gray-800 shadow-lg p-8 space-y-8">
              {currentStep === 1 && (
                <WizardStep title="Starter Info (required)">
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => { handleChange('contentType', 'video'); setVideoMode('file'); }}
                      className={`px-4 py-2 rounded-lg transition ${
                        formData.contentType === 'video'
                          ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Upload / Paste Video
                    </button>
                    <button
                      onClick={() => handleChange('contentType', 'text')}
                      className={`px-4 py-2 rounded-lg transition ${
                        formData.contentType === 'text'
                          ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Paste Script
                    </button>
                  </div>

                  {/* Video or Script */}
                  {formData.contentType === 'video' && (
                    <div className="space-y-4">
                      <div className="flex gap-4 mb-4">
                        <button
                          onClick={() => setVideoMode('url')}
                          className={`px-4 py-2 rounded-lg transition ${
                            videoMode === 'url'
                              ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          Paste URL
                        </button>
                        <button
                          onClick={() => setVideoMode('file')}
                          className={`px-4 py-2 rounded-lg transition ${
                            videoMode === 'file'
                              ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          Upload File
                        </button>
                      </div>

                      {videoMode === 'url' ? (
                        <TextInput
                          id="videoUrl"
                          label="YouTube Video URL"
                          value={formData.videoUrl}
                          onChange={e => handleChange('videoUrl', e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          error={validationErrors.videoUrl}
                        />
                      ) : (
                        <>
                          <FileUpload
                            accept=".mp4,.mov,.avi,.webm"
                            value={formData.videoFile}
                            onChange={handleFileChange}
                            placeholder="Upload your video"
                            error={uploadError || undefined}
                          />
                          <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-0 rounded-full transition-all duration-300 bg-purple-600"
                              style={{ width: `${formData.uploadProgress}%` }}
                            />
                          </div>
                          {showUploadSuccess && formData.uploadProgress === 100 && (
                            <div className="flex items-center gap-2 text-green-400 animate-fadeIn">
                              <div className="relative">
                                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                                <Check size={16} className="relative z-10" />
                              </div>
                              <span className="font-medium">Upload complete!</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {formData.contentType === 'text' && (
                    <TextArea
                      id="scriptText"
                      label="Script / Main Points"
                      value={formData.scriptText}
                      onChange={e => handleChange('scriptText', e.target.value)}
                      placeholder="Paste at least 300 characters"
                      rows={6}
                      minLength={300}
                      showCharCount
                      error={validationErrors.scriptText}
                    />
                  )}

                  <TextInput
                    id="profileUrl"
                    label="X Profile URL"
                    value={formData.profileUrl}
                    onChange={e => handleChange('profileUrl', e.target.value)}
                    placeholder="https://x.com/yourprofile"
                    error={validationErrors.profileUrl}
                  />

                  <TextArea
                    id="targetAudience"
                    label="Target Audience"
                    value={formData.targetAudience}
                    onChange={e => handleChange('targetAudience', e.target.value)}
                    placeholder="Who are you speaking to?"
                    rows={3}
                    error={validationErrors.targetAudience}
                  />

                  <div className="mt-6">
                    <label className="block text-sm text-gray-400 mb-1">
                      Number of Tweets
                    </label>
                    <select
                      value={formData.tweetCount}
                      onChange={e => handleChange('tweetCount', +e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 shadow-inner"
                    >
                      {tweetCountOptions.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-6 space-y-4">
                    <label className="block text-sm text-gray-400">
                      Maximum Characters per Tweet
                    </label>
                    <Slider
                      defaultValue={[formData.maxCharsPerTweet]}
                      min={50}
                      max={250}
                      step={10}
                      showTooltip
                      tooltipContent={(value) => `${value} chars`}
                      onValueChange={([value]) => handleChange('maxCharsPerTweet', value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>50</span>
                      <span>60</span>
                      <span>70</span>
                      <span>80</span>
                      <span>90</span>
                      <span>100</span>
                      <span>110</span>
                      <span>120</span>
                      <span>130</span>
                      <span>140</span>
                      <span>150</span>
                      <span>160</span>
                      <span>170</span>
                      <span>180</span>
                      <span>190</span>
                      <span>200</span>
                      <span>210</span>
                      <span>220</span>
                      <span>230</span>
                      <span>240</span>
                      <span>250</span>
                    </div>
                  </div>
                </WizardStep>
              )}

              {currentStep === 2 && (
                <WizardStep title="Advanced Options">
                  <div className="space-y-6">
                    <TagInput
                      label="Tweet Styles"
                      value={formData.tweetStyles}
                      onChange={vals => handleChange('tweetStyles', vals)}
                      suggestions={tweetStyleSuggestions}
                    />

                    <TextInput
                      id="tone"
                      label="Tone / Voice"
                      value={formData.tone}
                      onChange={e => handleChange('tone', e.target.value)}
                      placeholder="e.g. Friendly, Professional"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <TextInput
                        id="hobbies"
                        label="Hobbies"
                        value={formData.hobbies}
                        onChange={e => handleChange('hobbies', e.target.value)}
                      />
                      <TextInput
                        id="age"
                        label="Age"
                        value={formData.age as string}
                        onChange={e => handleChange('age', e.target.value ? +e.target.value : '')}
                        type="number"
                      />
                    </div>

                    <select
                      value={formData.gender}
                      onChange={e => handleChange('gender', e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 shadow-inner"
                    >
                      <option value="">Select Gender…</option>
                      {genderOptions.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>

                    <TextArea
                      id="extraContext"
                      label="Any Other Context"
                      value={formData.extraContext}
                      onChange={e => handleChange('extraContext', e.target.value)}
                      rows={4}
                    />
                  </div>
                </WizardStep>
              )}

              <div className="flex justify-between mt-12">
                {currentStep > 1 ? (
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 bg-gray-800 text-gray-400 rounded-lg shadow hover:bg-gray-700 transition"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleSubmit}
                  disabled={(currentStep === 1 && !isStep1Valid()) || isSubmitting}
                  className={[
                    'px-6 py-2 rounded-lg transition-all duration-300',
                    (currentStep === 1 && !isStep1Valid()) || isSubmitting
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  ].join(' ')}
                >
                  {currentStep < 2 ? 'Next →' : 'Generate Tweets'}
                </button>
              </div>
            </div>
          </WizardContainer>
        </div>
      </div>
    </div>
  );
};

export default GenerateTweets;