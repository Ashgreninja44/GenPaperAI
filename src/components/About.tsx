import React, { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  Sliders, 
  Printer, 
  Database, 
  ArrowLeft, 
  Cpu, 
  Clock, 
  Mail,
  Code2,
  GraduationCap,
  Calendar,
  ExternalLink,
  User,
  Heart
} from 'lucide-react';
import Logo from './Logo';
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from './BrandIcons';

interface AboutProps {
  onBack?: () => void;
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
}

const About: React.FC<AboutProps> = ({ onBack, isLoggedIn = false, onOpenAuth }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageSrcIndex, setImageSrcIndex] = useState(0);

  // Instantly reset scroll position when About page mounts or navigates
  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, []);

  // Static list of candidate photograph paths provided during development
  const photoSources = [
    '/darshit.jpg',
    '/darshit.jpeg',
    '/darshit.png',
    '/S929 (1).jpeg',
    '/S929.jpeg',
    '/assets/darshit.jpg',
    '/assets/darshit.jpeg'
  ];

  const handleImageError = () => {
    if (imageSrcIndex < photoSources.length - 1) {
      setImageSrcIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const coreFeatures = [
    {
      icon: Sparkles,
      title: "AI-Assisted Paper Generation",
      description: "Generates structured question papers with balanced marks, difficulty levels, and section distributions based on teacher configuration."
    },
    {
      icon: BookOpen,
      title: "Curriculum-Aware Selection",
      description: "Built-in support for multiple educational boards (CBSE, State Boards), classes, and specific subject chapters and topics."
    },
    {
      icon: Layers,
      title: "Subject-Specific Patterns",
      description: "Dedicated examination structures for Science (Physics, Chemistry, Biology subsections), Social Science, Telugu (Parimalam), and more."
    },
    {
      icon: Sliders,
      title: "Custom Paper Configuration",
      description: "Full control over total marks, duration, question types (MCQs, Short Answer, Long Answer, Case Studies), and custom school headers."
    },
    {
      icon: Printer,
      title: "PDF & Print-Ready Output",
      description: "Instantly preview, edit individual questions, and download cleanly formatted, print-ready question papers with matching answer keys."
    },
    {
      icon: Database,
      title: "Saved Papers & History",
      description: "Cloud-persisted paper library allowing educators to review, re-download, edit, or manage previously generated assessments anytime."
    }
  ];

  const inProgressFeatures = [
    {
      title: "Web Extract & Question Ingestion",
      status: "Under Development",
      description: "Automated extraction and formatting of question papers from web sources and uploaded reference files."
    },
    {
      title: "Deep Question Bank Integration",
      status: "Coming Later",
      description: "Direct seamless insertion of custom question bank items into automated AI paper generation workflows."
    }
  ];

  const socialLinks = [
    {
      name: "Instagram",
      handle: "@ashgreninja_44",
      url: "https://www.instagram.com/ashgreninja_44/",
      icon: InstagramIcon,
      bgColor: "hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white"
    },
    {
      name: "YouTube",
      handle: "@Darshit-The-Gamer",
      url: "https://www.youtube.com/@Darshit-The-Gamer",
      icon: YouTubeIcon,
      bgColor: "hover:bg-red-600 hover:text-white"
    },
    {
      name: "Twitter / X",
      handle: "@DarshitPendyala",
      url: "https://x.com/DarshitPendyala",
      icon: XTwitterIcon,
      bgColor: "hover:bg-black hover:text-white"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in text-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <button
          onClick={handleReturn}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold backdrop-blur-sm border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to GenPaperAI
        </button>

        {!isLoggedIn && onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="px-5 py-2 rounded-xl bg-white text-[#3C128D] text-sm font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Sign In / Register
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 pt-4">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
            <Logo className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
        </div>
        
        <span className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase tracking-widest bg-white/15 backdrop-blur-md rounded-full border border-white/20 text-amber-300">
          About GenPaperAI
        </span>
        
        <h1 className="text-3xl sm:text-5xl font-black mb-6 drop-shadow-md tracking-tight leading-tight">
          Smarter Question Paper Creation
        </h1>
        
        <p className="text-lg sm:text-xl text-white/90 leading-relaxed font-medium">
          GenPaperAI is an AI-assisted question-paper generation platform designed to help teachers create structured, curriculum-aware, and customizable assessments in seconds.
        </p>
      </div>

      {/* Why GenPaperAI Exists */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl mb-12 border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8A2CB0] to-[#EEA727] flex items-center justify-center text-white shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Why GenPaperAI?</h2>
        </div>

        <div className="space-y-4 text-white/90 text-base sm:text-lg leading-relaxed font-normal">
          <p>
            Creating high-quality question papers manually can be an exhausting and repetitive process. Educators often spend hours:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-2">
            <li className="flex items-start gap-2.5 bg-black/20 p-3.5 rounded-2xl border border-white/10">
              <span className="text-amber-400 font-bold">•</span>
              <span>Selecting appropriate questions that match target difficulty levels</span>
            </li>
            <li className="flex items-start gap-2.5 bg-black/20 p-3.5 rounded-2xl border border-white/10">
              <span className="text-amber-400 font-bold">•</span>
              <span>Balancing marks distribution across chapters and sections</span>
            </li>
            <li className="flex items-start gap-2.5 bg-black/20 p-3.5 rounded-2xl border border-white/10">
              <span className="text-amber-400 font-bold">•</span>
              <span>Following strict board and subject-specific exam blueprints</span>
            </li>
            <li className="flex items-start gap-2.5 bg-black/20 p-3.5 rounded-2xl border border-white/10">
              <span className="text-amber-400 font-bold">•</span>
              <span>Formatting and typesetting final printable documents with answer keys</span>
            </li>
          </ul>
          <p className="pt-2 text-white/80">
            GenPaperAI is built to eliminate these repetitive burdens while keeping complete academic judgment, question customization, and syllabus control in the educator's hands.
          </p>
        </div>
      </div>

      {/* Core Working Features */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Core Features</h2>
          <p className="text-white/80 text-sm sm:text-base">What you can accomplish today with GenPaperAI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="glass-panel p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all hover:-translate-y-1 shadow-xl flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] flex items-center justify-center text-white mb-4 shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">{feat.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed flex-grow">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features in Development */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-14 border border-white/15 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Upcoming Enhancements</h3>
            <p className="text-xs text-white/70">Features currently undergoing testing and development</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inProgressFeatures.map((item, idx) => (
            <div key={idx} className="bg-black/20 p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-base">{item.title}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.status}
                  </span>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CREATOR SECTION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
        {/* Left Column: Creator Profile Card */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/25 shadow-2xl flex flex-col items-center text-center">
          
          {/* Creator Photograph Frame */}
          <div className="relative mb-5">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#3C128D] via-[#8A2CB0] to-[#EEA727] opacity-75 blur-sm"></div>
            
            <div className="relative w-36 h-44 sm:w-40 sm:h-48 rounded-2xl overflow-hidden bg-gray-900 border-2 border-white/30 shadow-2xl flex items-center justify-center">
              {!imageError ? (
                <img 
                  src={photoSources[imageSrcIndex] || '/darshit.jpg'} 
                  alt="Pendyala Sri Darshit Sarma - Creator of GenPaperAI"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#3C128D] to-[#8A2CB0] text-white">
                  <div className="w-16 h-16 rounded-full bg-white/15 border border-white/20 flex items-center justify-center mb-2 shadow-inner">
                    <span className="text-2xl font-black text-amber-300">D</span>
                  </div>
                  <span className="text-xs font-bold text-white/90">Darshit Sarma</span>
                  <span className="text-[10px] text-purple-200 mt-0.5">Creator</span>
                </div>
              )}
            </div>
          </div>

          <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 mb-1">
            Built by
          </span>
          
          {/* Full Name */}
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">
            Pendyala Sri Darshit Sarma
          </h3>
          
          <p className="text-xs font-semibold text-purple-200 mb-5">
            Student • Developer • Creator of GenPaperAI
          </p>

          {/* Structured Creator Information Badges */}
          <div className="w-full space-y-2.5 mb-6 text-left">
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">School</div>
                <div className="text-xs sm:text-sm font-semibold text-white truncate" title="Aditya Birla Public School, Budawada">
                  Aditya Birla Public School, Budawada
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Age</div>
                  <div className="text-xs sm:text-sm font-semibold text-white">14 years old</div>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Role</div>
                  <div className="text-xs sm:text-sm font-semibold text-white">Student Dev</div>
                </div>
              </div>
            </div>

            {/* Email Address Contact Item */}
            <a 
              href="mailto:pendyaladarshit4@gmail.com?subject=GenPaperAI%20Inquiry"
              className="bg-black/30 hover:bg-black/40 p-3 rounded-xl border border-white/10 hover:border-white/30 flex items-center gap-3 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Email Contact</div>
                <div className="text-xs font-semibold text-white truncate">
                  pendyaladarshit4@gmail.com
                </div>
              </div>
            </a>
          </div>

          {/* Connect With Me / Social Media Section */}
          <div className="w-full pt-4 border-t border-white/15 text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-white/80 mb-3 flex items-center justify-between">
              <span>Connect with me</span>
              <span className="text-[10px] text-white/50 font-normal">Socials</span>
            </h4>

            <div className="space-y-2">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white transition-all hover:scale-[1.02] active:scale-98 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">{social.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/60 group-hover:text-white text-[11px] font-medium">
                      <span>{social.handle}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Biography & Project Journey */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/25 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] flex items-center justify-center text-white shadow-md">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Creator Story & Biography</h3>
                <p className="text-xs text-white/70">The journey behind building GenPaperAI</p>
              </div>
            </div>

            {/* Author's Source-of-Truth Biography */}
            <div className="space-y-4 text-white/90 text-sm sm:text-base leading-relaxed font-normal">
              <p className="bg-black/20 p-4 rounded-2xl border border-white/10">
                I'm <strong>Darshit</strong>, a student and technology enthusiast with a strong interest in computer hardware, software, AI, and experimenting with technology. I enjoy building projects, exploring operating systems, and creating tools that solve problems I encounter.
              </p>

              <p>
                I created <strong>GenPaperAI</strong> as a project to explore how AI could make question-paper creation faster and easier for teachers. What started as an experiment grew into a full application with AI-powered paper generation, curriculum-aware subject selection, customizable paper patterns, and print-ready output.
              </p>

              <p>
                Along the way, I've also built extensions and tools to improve the software I use, including <strong className="text-amber-300">Google AI Studio GitHub Button</strong> (to make life easier for devs after google removed the "commit changes to github button") & <strong className="text-amber-300">Memify</strong> (a fun little project where you will be shown a random meme for every 100 tabs you open). These projects have helped me explore web development, browser extensions, APIs, automation, and the practical side of software engineering.
              </p>

              <p className="text-white/80 text-sm">
                GenPaperAI is an ongoing project, and I'm continuing to improve it through testing, experimentation, and feedback from educators.
              </p>
            </div>
          </div>

          {/* Email Invitation for Questions & Feedback */}
          <div className="mt-8 pt-6 border-t border-white/15">
            <div className="bg-black/30 p-5 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8A2CB0] to-[#EEA727] flex items-center justify-center text-white shadow-md shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Questions, Ideas or Feedback?</h4>
                  <p className="text-xs text-white/70">
                    Feel free to reach out directly with your suggestions or questions.
                  </p>
                </div>
              </div>
              <a
                href="mailto:pendyaladarshit4@gmail.com?subject=GenPaperAI%20Inquiry%20from%20Website"
                className="px-5 py-2.5 rounded-xl bg-white text-[#3C128D] text-xs font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                Email Darshit
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Call to Action */}
      <div className="text-center pb-8">
        <button
          onClick={handleReturn}
          className="px-8 py-4 rounded-2xl bg-white text-[#3C128D] font-black text-base shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {isLoggedIn ? "Return to Dashboard" : "Get Started with GenPaperAI"}
        </button>
      </div>
    </div>
  );
};

export default About;

