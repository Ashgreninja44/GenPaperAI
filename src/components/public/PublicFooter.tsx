import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  FileText, 
  HelpCircle, 
  Info, 
  Compass, 
  Layers, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Logo from '../Logo';

interface PublicFooterProps {
  onOpenAuth?: () => void;
  onEnterGuestMode?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onOpenAuth, onEnterGuestMode }) => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 text-white pt-12 pb-6 px-4 relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 shadow-lg shadow-purple-900/50" />
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-purple-200 via-white to-amber-200 bg-clip-text text-transparent">
                GenPaperAI
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-amber-400">
                Academic Assessment Platform
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            GenPaperAI empowers teachers, educators, and schools to design curriculum-aligned, balanced question papers adhering to Bloom's Taxonomy and board blueprints with automated formatting and instant print-ready export.
          </p>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Educator-in-the-Loop AI Standard</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              AI serves as an intelligent drafting assistant. Educators retain full editorial review and final authority over all assessments.
            </p>
          </div>
        </div>

        {/* Platform & Tools */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-amber-300">
            Platform & Tools
          </h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <button 
                onClick={() => {
                  if (onEnterGuestMode) onEnterGuestMode();
                  else navigate('/');
                }} 
                className="hover:text-white hover:underline transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <span>Question Paper Generator</span>
              </button>
            </li>
            <li>
              <Link to="/guide" className="hover:text-white hover:underline transition-colors">
                Blueprint & Assessment Guide
              </Link>
            </li>
            <li>
              <Link to="/curriculum" className="hover:text-white hover:underline transition-colors">
                Syllabus & Board Support
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white hover:underline transition-colors">
                Bloom's Taxonomy Framework
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources & Help */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-purple-300">
            Resources & Help
          </h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/faq" className="hover:text-white hover:underline transition-colors flex items-center gap-1">
                <span>Frequently Asked Questions</span>
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white hover:underline transition-colors">
                About the Platform & Creator
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white hover:underline transition-colors">
                Contact & Technical Support
              </Link>
            </li>
            <li>
              <a 
                href="mailto:pendyaladarshit4@gmail.com" 
                className="hover:text-amber-300 hover:underline transition-colors flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Support Email</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Legal & Trust */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
            Trust & Legal
          </h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/privacy" className="hover:text-white hover:underline transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white hover:underline transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/about#ethics" className="hover:text-white hover:underline transition-colors">
                AI Transparency & Ethics
              </Link>
            </li>
            <li>
              <Link to="/privacy#cookies" className="hover:text-white hover:underline transition-colors">
                Cookie & Ad Policies
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Attribution Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>
          © {new Date().getFullYear()} GenPaperAI. All Rights Reserved. Designed & Developed by Sri Darshit & Sri Venkatesh Pendyala.
        </p>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
