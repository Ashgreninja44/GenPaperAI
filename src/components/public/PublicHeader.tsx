import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Menu, 
  X, 
  BookOpen, 
  HelpCircle, 
  Info, 
  Mail, 
  FileText, 
  GraduationCap,
  Layers,
  ArrowRight,
  User as UserIcon
} from 'lucide-react';
import Logo from '../Logo';

interface PublicHeaderProps {
  onOpenAuth?: () => void;
  onEnterGuestMode?: () => void;
  isLoggedIn?: boolean;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  onOpenAuth,
  onEnterGuestMode,
  isLoggedIn = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Blueprint Guide', path: '/guide' },
    { label: 'Syllabus & Boards', path: '/curriculum' },
    { label: 'FAQ & Help', path: '/faq' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/60 border-b border-white/10 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <Logo className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-105 shadow-md shadow-purple-900/40" />
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-2xl tracking-tight bg-gradient-to-r from-purple-200 via-white to-amber-200 bg-clip-text text-transparent">
              GenPaperAI
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400 hidden sm:block">
              Assessment Generator
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                isActive(item.path)
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-white text-[#3C128D] shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              Open Dashboard
            </button>
          ) : (
            <>
              {onEnterGuestMode && (
                <button
                  onClick={onEnterGuestMode}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Try without creating an account"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Guest Mode</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (location.pathname === '/') {
                    document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {onEnterGuestMode && !isLoggedIn && (
            <button
              onClick={onEnterGuestMode}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30"
            >
              Guest
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl px-4 py-6 space-y-3 animate-fade-in shadow-2xl">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.path)
                    ? 'bg-purple-600/30 text-white border border-purple-400/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onEnterGuestMode) onEnterGuestMode();
                  }}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Continue as Guest</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (location.pathname === '/') {
                      document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/');
                      setTimeout(() => {
                        document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 flex items-center justify-center gap-2"
                >
                  <span>Sign In / Register</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full py-3 px-4 rounded-xl text-sm font-black bg-white text-[#3C128D] flex items-center justify-center gap-2"
              >
                <span>Open Dashboard</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
