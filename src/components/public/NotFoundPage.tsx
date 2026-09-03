import React, { useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home, HelpCircle, BookOpen } from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { setPageMetadata } from '../../utils/seo';

interface NotFoundPageProps {
  onEnterGuestMode?: () => void;
  isLoggedIn?: boolean;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onEnterGuestMode, isLoggedIn }) => {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setPageMetadata(
      "404 - Page Not Found | GenPaperAI",
      "The page you are looking for could not be found. Navigate back to GenPaperAI assessments.",
      "/404"
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <PublicHeader onEnterGuestMode={onEnterGuestMode} isLoggedIn={isLoggedIn} />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-400/20 text-purple-300">
          <Compass className="w-16 h-16 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-black text-white">404</h1>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
          <Link
            to="/guide"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Assessment Guide</span>
          </Link>
          <Link
            to="/faq"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </Link>
        </div>
      </main>

      <PublicFooter onEnterGuestMode={onEnterGuestMode} />
    </div>
  );
};

export default NotFoundPage;
