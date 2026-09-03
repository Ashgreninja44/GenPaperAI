import React, { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  MessageSquare, 
  ShieldCheck,
  User,
  ArrowLeft
} from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { setPageMetadata } from '../../utils/seo';

interface ContactPageProps {
  onEnterGuestMode?: () => void;
  isLoggedIn?: boolean;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onEnterGuestMode, isLoggedIn }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry / Feedback',
    message: ''
  });

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setPageMetadata(
      "Contact & Educator Support | GenPaperAI",
      "Get in touch with the GenPaperAI academic support and engineering team for feedback, school onboarding, and curriculum suggestions.",
      "/contact"
    );
  }, []);

  const supportEmail = "pendyaladarshit4@gmail.com";

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(supportEmail).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    // Open default mail client with pre-filled content
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(`[GenPaperAI] ${formData.subject}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <PublicHeader onEnterGuestMode={onEnterGuestMode} isLoggedIn={isLoggedIn} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-widest">
            <Mail className="w-4 h-4" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Contact GenPaperAI
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have questions, feedback, or need help creating assessments for your institution? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Direct Contact Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-3xl bg-white/5 border border-white/10 space-y-5">
              <h2 className="text-xl font-black text-white">Direct Communication</h2>
              
              <div className="space-y-4 text-sm text-slate-300">
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300">Official Support Email</span>
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/20 border border-white/10 font-mono text-xs text-white">
                    <span className="truncate">{supportEmail}</span>
                    <button
                      onClick={handleCopyEmail}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy email address"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-purple-300">Project Leadership & Creator</span>
                  <p className="text-xs text-slate-300 leading-normal">
                    <strong>Sri Darshit Pendyala</strong> & <strong>Sri Venkatesh Pendyala</strong><br />
                    Lead Architect & Educational Software Developer
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">Response Window</span>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Inquiries answered within 24 to 48 hours</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Privacy Guaranteed</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  We will never share or sell your email address. It is strictly used for correspondence regarding your inquiry.
                </p>
              </div>
            </div>
          </div>

          {/* Contact / Feedback Form */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Send Us a Message</h2>
                  <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Educator Feedback & Support</p>
                </div>
              </div>

              {formSubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-xl font-black text-white">Opening Email Client...</h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Your message has been pre-filled in your default email client. If it did not open automatically, you can send an email directly to <strong className="text-white">{supportEmail}</strong>.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-4 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Your Name *</label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Prof. R. Sharma"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:ring-2 focus:ring-purple-400 outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Your Email Address *</label>
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="teacher@school.edu"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:ring-2 focus:ring-purple-400 outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Subject Category</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/20 text-white text-sm focus:ring-2 focus:ring-purple-400 outline-none transition-all"
                    >
                      <option value="General Inquiry / Feedback">General Inquiry / Feedback</option>
                      <option value="Curriculum / Syllabus Question">Curriculum / Syllabus Blueprint Question</option>
                      <option value="Technical Support / PDF Issue">Technical Support / PDF Export Issue</option>
                      <option value="Feature Request">Feature Request / Enhancement</option>
                      <option value="School / Institutional Partnership">School / Institutional Partnership</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Your Message *</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Please describe your question, topic, or feedback in detail..."
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:ring-2 focus:ring-purple-400 outline-none transition-all placeholder:text-slate-500 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white font-black text-sm shadow-xl hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Message via Email</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter onEnterGuestMode={onEnterGuestMode} />
    </div>
  );
};

export default ContactPage;
