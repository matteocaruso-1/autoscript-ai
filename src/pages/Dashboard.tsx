import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  User,
  Settings as SettingsIcon,
  LogOut,
  List,
  Grid,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { GeneratedTweet } from '../lib/supabase';

const WEBHOOK_URL = 'https://hook.us2.make.com/h6twj111ekbh0wf4glyq1df38atrvuhi';
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEFAULT_THEME = 'dark';
const DEFAULT_ACCENT = '#7E57C2';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data + UI state
  const [tweets, setTweets] = useState<GeneratedTweet[]>([]);
  const [displayName, setDisplayName] = useState<string>('');
  const [plan, setPlan] = useState<string>('Free');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  // Committed settings
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [accent, setAccent] = useState<string>('#A855F7');

  // Temporary settings inside modal
  const [tempTheme, setTempTheme] = useState<'light' | 'dark'>(theme);
  const [tempAccent, setTempAccent] = useState<string>(accent);
  const [tempPlan, setTempPlan] = useState<string>(plan);

  // Selection & modals
  const [selectedTweet, setSelectedTweet] = useState<GeneratedTweet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Delete flow
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [tweetToDelete, setTweetToDelete] = useState<GeneratedTweet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Format the tweet content for display
  const formatTweetContent = (content: string) => {
    try {
      // If it's already HTML, return as is
      if (content.trim().startsWith('<')) {
        return content;
      }
      // Otherwise, convert newlines to <br> and wrap in paragraphs
      return content
        .split('\n\n')
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
    } catch (e) {
      return '<p>Error displaying content</p>';
    }
  };

  // Apply committed theme & accent globally
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.setProperty('--accent', accent);
  }, [theme, accent]);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/onboarding/signin');
        return;
      }

      // Try to load existing preferences
      const { data: prefs, error } = await supabase
        .from('user_preferences')
        .select('theme, accent_color')
        .eq('user_email', session.user.email)
        .limit(1)
        .maybeSingle();

      if (prefs) {
        // Apply saved preferences
        setTheme(prefs.theme as 'light' | 'dark' || DEFAULT_THEME);
        setAccent(prefs.accent_color || DEFAULT_ACCENT);
        setTempTheme(prefs.theme as 'light' | 'dark' || DEFAULT_THEME);
        setTempAccent(prefs.accent_color || DEFAULT_ACCENT);
      } else {
        // Create default preferences
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_email: session.user.email,
            theme: DEFAULT_THEME,
            accent_color: DEFAULT_ACCENT
          });

        if (!insertError) {
          setTheme(DEFAULT_THEME);
          setAccent(DEFAULT_ACCENT);
          setTempTheme(DEFAULT_THEME);
          setTempAccent(DEFAULT_ACCENT);
        }
      }
    };

    loadPreferences();
  }, [navigate]);

  // Fetch session & scripts
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate('/onboarding/signin');
        return;
      }
      const meta = session.user.user_metadata as any;
      setDisplayName(meta.full_name || meta.name || session.user.email);
      setPlan(meta.plan || 'Free');

      const { data, error } = await supabase
        .from('generated_tweets')
        .select('*')
        .eq('user_email', session.user.email)
        .order('created_at', { ascending: false });
      if (!error) setTweets(data || []);
    })();
  }, [navigate]);

  // Compute last generation date
  const lastGenDate =
    tweets[0]?.created_at
      ? new Date(tweets[0].created_at).toLocaleDateString()
      : 'N/A';

  // Prepare chart data
  const chartData = useMemo(() => {
    const counts = Array(7).fill(0);
    tweets.forEach(t => {
      const d = new Date(t.created_at).getDay();
      const idx = d === 0 ? 6 : d - 1;
      counts[idx]++;
    });
    return WEEK_DAYS.map((day, i) => ({ day, count: counts[i] }));
  }, [tweets]);

  // Handlers
  const handleViewTweet = (t: GeneratedTweet) => {
    setSelectedTweet(t);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (t: GeneratedTweet) => {
    setTweetToDelete(t);
    setDeleteError(null);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tweetToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('generated_tweets')
        .delete()
        .eq('id', tweetToDelete.id);
      if (error) throw error;

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tweetToDelete.id }),
      });
      if (!res.ok) throw new Error('Webhook notification failed');

      setTweets(prev => prev.filter(t => t.id !== tweetToDelete.id));
      setIsConfirmOpen(false);
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openSettings = () => {
    // Initialize modal fields from committed settings
    setTempTheme(theme);
    setTempAccent(accent);
    setTempPlan(plan);
    setShowSettings(true);
  };

  const handleSettingsSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Save to database
    await supabase
      .from('user_preferences')
      .upsert({
        user_email: session.user.email,
        theme: tempTheme,
        accent_color: tempAccent
      });

    // Update local state
    setTheme(tempTheme);
    setAccent(tempAccent);
    setShowSettings(false);
  };

  const handleSettingsReset = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Reset to defaults
    await supabase
      .from('user_preferences')
      .upsert({
        user_email: session.user.email,
        theme: DEFAULT_THEME,
        accent_color: DEFAULT_ACCENT
      });

    // Update all states
    setTheme(DEFAULT_THEME);
    setAccent(DEFAULT_ACCENT);
    setTempTheme(DEFAULT_THEME);
    setTempAccent(DEFAULT_ACCENT);
    setShowSettings(false);
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-r border-gray-200 dark:border-black/50 p-6 flex flex-col shadow-lg">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8">
          <img src="https://i.imgur.com/6290ZhH.png" alt="Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold text-[var(--accent)]">AutoScript AI</span>
        </Link>
        <nav className="flex-1 space-y-2">
          <NavItem label="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} iconSrc="https://i.imgur.com/6290ZhH.png" />
          <NavItem label="My Scripts" to="/scripts" active={location.pathname === '/scripts'} icon={<FileText size={18} />} />
          <NavItem label="Generate New" to="/generate" active={location.pathname === '/generate'} icon={<Sparkles size={18} />} />
          <NavItem label="Profile" to="/profile" active={location.pathname === '/profile'} icon={<User size={18} />} />
          <button
            onClick={openSettings}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-[var(--accent)] hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <SettingsIcon size={18} /> Settings
          </button>
        </nav>
        <NavItem label="Logout" to="/logout" active={false} icon={<LogOut size={18} />} className="mt-auto" />
      </aside>

      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold">Welcome, {displayName}</h2>
          <Link
            to="/generate"
            className="px-5 py-2 bg-gradient-to-r from-[var(--accent)] to-blue-500 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-[var(--accent)] transition"
          >
            + New Script
          </Link>
        </header>

        {/* Stats Cards with improved spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 dark:bg-black/90 p-6 rounded-lg border border-gray-200 dark:border-black/50 shadow">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Scripts
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {tweets.length}
            </p>
          </div>
          
          <div className="bg-white/90 dark:bg-black/90 p-6 rounded-lg border border-gray-200 dark:border-black/50 shadow">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Current Plan
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {plan}
            </p>
          </div>
          
          <div className="bg-white/90 dark:bg-black/90 p-6 rounded-lg border border-gray-200 dark:border-black/50 shadow">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Last Generation
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {lastGenDate}
            </p>
          </div>
        </div>

        {/* Activity Chart */}
        <section className="mb-10">
          <h3 className="text-xl font-bold mb-4">Activity</h3>
          <div className="bg-white/90 dark:bg-black/90 p-6 rounded-xl border border-gray-200 dark:border-black/50 shadow">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={1} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid className="dark:stroke-[rgba(255,255,255,0.1)]" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="day" className="dark:stroke-gray-400" />
                <YAxis hide domain={[0, 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 0 6px rgba(128,90,213,0.5)',
                    color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="url(#chartGrad)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, stroke: accent, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Scripts */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Recent Scripts</h3>
            <div className="flex gap-2">
              <button onClick={() => setLayout('list')} className={layout === 'list' ? 'text-[var(--accent)]' : 'text-gray-400 hover:text-[var(--accent)]'}>
                <List size={18} />
              </button>
              <button onClick={() => setLayout('grid')} className={layout === 'grid' ? 'text-[var(--accent)]' : 'text-gray-400 hover:text-[var(--accent)]'}>
                <Grid size={18} />
              </button>
            </div>
          </div>
          <div className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : ''}>
            {tweets.length > 0 ? (
              tweets.map(t => (
                <div
                  key={t.id}
                  className={
                    layout === 'grid'
                      ? 'bg-white/90 dark:bg-black/90 p-4 rounded-lg shadow'
                      : 'grid grid-cols-3 gap-4 items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-900 transition'
                  }
                >
                  <div>
                    <p className="font-medium">{t.script_title || 'Untitled Script'}</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    t.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : t.status === 'failed'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                  }`}>
                    {t.status}
                  </span>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleViewTweet(t)} className="px-3 py-1 bg-gradient-to-r from-[var(--accent)] to-blue-500 text-white rounded shadow hover:shadow-lg">
                      View
                    </button>
                    <button onClick={() => handleDeleteClick(t)} disabled={isDeleting} className="px-3 py-1 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded shadow hover:shadow-lg disabled:opacity-50">
                      {isDeleting && tweetToDelete?.id === t.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No scripts generated yet.</p>
                <Link to="/generate" className="mt-2 inline-block text-[var(--accent)] hover:underline">
                  Create your first script →
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* View Modal with proper HTML rendering */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTweet(null);
        }}
        title={selectedTweet?.script_title || 'Script Content'}
      >
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: selectedTweet ? formatTweetContent(selectedTweet.tweets_content) : '' 
          }}
        />
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSettingsSave}
        showSave
        title="Settings"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Theme Settings</h4>
            <button
              onClick={handleSettingsReset}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          {/* Theme Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Theme</h4>
            <div className="flex gap-4">
              {(['light', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTempTheme(t)}
                  className={`px-4 py-2 rounded-lg transition ${
                    tempTheme === t
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Accent Color</h4>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={tempAccent}
                onChange={e => setTempAccent(e.target.value)}
                className="w-16 h-8 p-0 border-0 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-400">
                Current: {tempAccent}
              </span>
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h5> </h5>
            <div>
              <button>
                
              </button>
              <div>
                
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setTweetToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Script"
        message={deleteError ?? 'Are you sure you want to delete this script? This action cannot be undone.'}
      />
    </div>
  );
};

// NavItem & StatCard
interface NavItemProps {
  icon?: React.ReactNode;
  iconSrc?: string;
  label: string;
  to: string;
  active: boolean;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, iconSrc, label, to, active, className }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? 'bg-[var(--accent)] text-white'
        : 'text-gray-600 dark:text-gray-300 hover:text-[var(--accent)] hover:bg-gray-100 dark:hover:bg-white/5'
    } ${className || ''}`}
  >
    {iconSrc ? (
      <img src={iconSrc} alt="" className="w-[18px] h-[18px]" />
    ) : (
      icon
    )}
    {label}
  </Link>
);

export default Dashboard;