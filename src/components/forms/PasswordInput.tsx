@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─────────────────────────────────────────────────────────────────────────────
   BASE LAYERS
───────────────────────────────────────────────────────────────────────────── */
@layer base {
  body {
    @apply m-0 p-0 text-white bg-black;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    height: 100vh;
    overflow: hidden;
  }

  #root, .app-fullscreen {
    @apply w-full h-full;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   LAYOUT UTILITIES
───────────────────────────────────────────────────────────────────────────── */
@layer utilities {
  /* two-column fullscreen split */
  .layout-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100%;
  }
  /* center content vertically & horizontally */
  .center-flex {
    @apply flex items-center justify-center;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
@layer components {
  .card {
    @apply bg-black/80 backdrop-blur-lg rounded-2xl shadow-lg
           p-8 mx-8 animate-fadeIn;
    border: 1px solid var(--accent-30);
    max-width: 500px;
    width: 100%;
  }

  .btn-primary {
    @apply inline-flex items-center justify-center px-6 py-2
           text-white font-semibold rounded-lg
           bg-gradient-to-r from-purple-600 to-purple-800
           shadow-lg hover:shadow-accent-glow
           transition-all duration-300;
    border: 1px solid var(--accent);
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center px-6 py-2
           text-gray-400 bg-gray-800 rounded-lg
           hover:bg-gray-700 transition-all duration-200;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .input-base {
    @apply w-full px-4 py-2 rounded-lg
           bg-black/90 text-white placeholder-gray-500
           focus:outline-none focus:ring-2 focus:ring-accent
           transition-all duration-200;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .tag {
    @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
           text-white transition-all duration-200;
    background-color: var(--accent-20);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITIES (continued)
───────────────────────────────────────────────────────────────────────────── */
@layer utilities {
  .border-accent    { border-color: var(--accent) !important; }
  .bg-accent        { background-color: var(--accent) !important; }
  .bg-accent-20     { background-color: var(--accent-20) !important; }
  .bg-accent-30     { background-color: var(--accent-30) !important; }
  .shadow-accent-glow {
    box-shadow: 0 0 12px var(--accent);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
}