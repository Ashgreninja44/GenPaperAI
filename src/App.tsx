
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import PaperForm from './components/PaperForm';
import PaperPreview from './components/PaperPreview';
import QuestionBankView from './components/QuestionBank';
import Settings from './components/Settings';
import Profile from './components/Profile';
import ResetPassword from './components/ResetPassword';
import BackgroundAnimation from './components/BackgroundAnimation';
import ThemeBackdrop from './components/ThemeBackdrop';
import Logo from './components/Logo';
import { PaperConfig, GeneratedPaper, QuestionBank, UserProfile } from './types';
import { generateQuestionPaper } from './services/geminiService';
import { 
  auth, 
  db, 
  googleProvider, 
  microsoftProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User, 
  handleFirestoreError, 
  OperationType,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from './firebase';
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc, getDocFromServer, getDoc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import { LogOut, User as UserIcon, Settings as SettingsIcon, Mail, Shield, Globe, Loader2, AlertCircle, CheckCircle2, Key, Eye, EyeOff } from 'lucide-react';

type View = 'dashboard' | 'create' | 'preview' | 'bank' | 'settings' | 'profile';

const THEMES: Record<string, string> = {
  default: 'linear-gradient(135deg, #3C128D 0%, #8A2CB0 60%, #EEA727 100%)',
  ocean: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
  sunset: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
  forest: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
  midnight: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
};

const ORB_THEMES: Record<string, string[]> = {
  default: ['#3C128D', '#8A2CB0', '#EEA727', '#FFF176'],
  ocean: ['#0F2027', '#203A43', '#2C5364', '#48cae4'],
  sunset: ['#FF512F', '#DD2476', '#FF8C00', '#FFD700'],
  forest: ['#134E5E', '#71B280', '#2E7D32', '#A5D6A7'],
  midnight: ['#232526', '#414345', '#000000', '#7f8c8d'],
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null); // 'google', 'microsoft', 'email'
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  
  // Email Auth Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');
  const [emailForm, setEmailForm] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [emailAuthLoading, setEmailAuthLoading] = useState(false);
  const [emailAuthError, setEmailAuthError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [history, setHistory] = useState<GeneratedPaper[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);

  const [currentPaper, setCurrentPaper] = useState<GeneratedPaper | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();

  // Paper Generation Progress Simulation
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 5;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Auth Listener
  useEffect(() => {
    console.log("App component mounted, setting up auth listener...");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser ? `User logged in: ${currentUser.uid}` : "User logged out");
      setUser(currentUser);
      
      if (currentUser) {
        try {
          console.log("Fetching user profile for:", currentUser.uid);
          const userDocRef = doc(db, 'users', currentUser.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
            return;
          }
          
          if (userDoc.exists()) {
            console.log("User profile found in Firestore");
            const data = userDoc.data() as UserProfile;
            
            // Migration: Ensure preferences exists for existing users
            if (!data.preferences) {
              console.log("Migrating user: adding default preferences");
              data.preferences = { 
                themeColor: data.selectedTheme || 'default', 
                background: 'default' 
              };
              try {
                await updateDoc(userDocRef, { preferences: data.preferences });
              } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
              }
            }
            
            setUserProfile(data);
          } else {
            console.log("No user profile found, creating new one...");
            
            // Determine provider
            let provider: 'google' | 'microsoft' | 'email' = 'google';
            if (currentUser.providerData.some(p => p.providerId === 'microsoft.com')) {
              provider = 'microsoft';
            } else if (currentUser.providerData.some(p => p.providerId === 'password')) {
              provider = 'email';
            }

            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Anonymous User',
              email: currentUser.email || '',
              profilePhoto: currentUser.photoURL,
              selectedTheme: 'default',
              preferences: {
                themeColor: 'default',
                background: 'default'
              },
              provider,
              createdAt: Date.now(),
              role: 'user',
              defaultPaperSettings: {
                board: 'CBSE',
                grade: '10th',
                subject: 'Science',
                schoolName: ''
              }
            };
            try {
              const sanitizedProfile = sanitizeForFirestore(newProfile);
              await setDoc(userDocRef, sanitizedProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
            }
            setUserProfile(newProfile);
            console.log("New user profile created successfully with default preferences");
          }
          console.log("User UID after login:", currentUser.uid);
        } catch (err) {
          console.error("Error fetching/creating user profile:", err);
          setError("Failed to load user profile. Please check your connection.");
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });

    // Check for redirect result (Microsoft fallback)
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("Redirect login success:", result.user.uid);
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        showToast(isNewUser ? "🎉 Welcome to GenPaperAI!" : "👋 Welcome back!", "success");
      }
    }).catch((err) => {
      console.error("Redirect login error:", err);
      setError("Redirect login failed: " + err.message);
      showToast("Redirect login failed: " + err.message, "error");
    });

    return () => unsubscribe();
  }, []);

  // Sync User Profile from Firestore (for real-time updates like theme changes)
  useEffect(() => {
    if (!user) return;
    console.log("Setting up real-time sync for user profile:", user.uid);
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        console.log("User profile updated in real-time");
        setUserProfile(snapshot.data() as UserProfile);
      }
    }, (err) => {
      console.error("Error syncing user profile:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // Apply Theme
  useEffect(() => {
    if (!userProfile) {
      console.log("No user profile, applying default theme");
      applyTheme('default');
      return;
    }

    const theme = userProfile.preferences?.themeColor || userProfile.selectedTheme || 'default';
    console.log("Fetched preferences:", userProfile.preferences);
    console.log("Applying theme:", theme);
    applyTheme(theme);
  }, [userProfile]);

  const applyTheme = (theme: string) => {
    setCurrentTheme(theme);
    const bgWrapper = document.querySelector('.premium-bg-wrapper') as HTMLElement;
    if (bgWrapper) {
      bgWrapper.style.background = THEMES[theme] || THEMES.default;
    }
    
    const orbs = ORB_THEMES[theme] || ORB_THEMES.default;
    orbs.forEach((color, i) => {
      const orb = document.querySelector(`.orb-${i + 1}`) as HTMLElement;
      if (orb) {
        orb.style.background = color;
      }
    });
  };

  // Sync History from Firestore
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(collection(db, 'papers'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const papers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GeneratedPaper));
      setHistory(papers.sort((a, b) => b.timestamp - a.timestamp));
    }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'papers');
    });

    return () => unsubscribe();
  }, [user]);

  // Sync Question Banks from Firestore
  useEffect(() => {
    if (!user) {
      setQuestionBanks([]);
      return;
    }

    const q = query(collection(db, 'banks'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const banks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as QuestionBank));
      setQuestionBanks(banks);
    }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'banks');
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (providerType: 'google' | 'microsoft') => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(providerType);
    setError(null);

    try {
      if (providerType === 'google') {
        console.log("Starting Google login...");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Google login success:", result.user.uid);
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        showToast(isNewUser ? "🎉 Welcome to GenPaperAI!" : "👋 Welcome back!", "success");
      } else if (providerType === 'microsoft') {
        console.log("Starting Microsoft login...");
        try {
          const result = await signInWithPopup(auth, microsoftProvider);
          console.log("Microsoft login success:", result.user.uid);
          const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
          showToast(isNewUser ? "🎉 Welcome to GenPaperAI!" : "👋 Welcome back!", "success");
        } catch (popupErr: any) {
          console.warn("Microsoft popup failed, falling back to redirect:", popupErr.message);
          // Fallback to redirect if popup fails (common in some browsers/iframes)
          await signInWithRedirect(auth, microsoftProvider);
        }
      }
    } catch (err: any) {
      console.error(`${providerType} login error:`, err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log(`${providerType} login popup closed by user`);
      } else {
        setError(`${providerType} login failed: ` + err.message);
        showToast(`${providerType} login failed: ` + err.message, "error");
      }
    } finally {
      setIsLoggingIn(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailAuthError(null);

    if (emailMode === 'signup' && emailForm.password.length < 6) {
      setEmailAuthError("Password must be at least 6 characters long.");
      return;
    }

    setEmailAuthLoading(true);
    try {
      if (emailMode === 'signup') {
        if (!emailForm.name.trim()) {
          setEmailAuthError("Please enter your name.");
          setEmailAuthLoading(false);
          return;
        }
        console.log("Starting Email signup...");
        const result = await createUserWithEmailAndPassword(auth, emailForm.email, emailForm.password);
        await updateProfile(result.user, { displayName: emailForm.name });
        console.log("Email signup success:", result.user.uid);
      } else {
        console.log("Starting Email login...");
        const result = await signInWithEmailAndPassword(auth, emailForm.email, emailForm.password);
        console.log("Email login success:", result.user.uid);
      }
      setShowEmailModal(false);
      const isNewUser = auth.currentUser?.metadata.creationTime === auth.currentUser?.metadata.lastSignInTime;
      showToast(isNewUser ? "🎉 Welcome to GenPaperAI!" : "👋 Welcome back!", "success");
      setEmailForm({ email: '', password: '', name: '' });
    } catch (err: any) {
      console.error("Email auth error:", err);
      if (err.code === 'auth/user-not-found') {
        setEmailAuthError("No user found with this email address.");
        showToast("No user found with this email address.", "error");
      } else if (err.code === 'auth/wrong-password') {
        setEmailAuthError("Incorrect password. Please try again.");
        showToast("Incorrect password. Please try again.", "error");
      } else if (err.code === 'auth/invalid-email') {
        setEmailAuthError("Please enter a valid email address.");
        showToast("Please enter a valid email address.", "error");
      } else {
        setEmailAuthError(err.message);
        showToast(err.message, "error");
      }
    } finally {
      setEmailAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailAuthError(null);
    
    if (!emailForm.email.trim()) {
      setEmailAuthError("Please enter your email address.");
      return;
    }

    setResetLoading(true);
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/reset-password',
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, emailForm.email, actionCodeSettings);
      setResetEmailSent(true);
      showToast("Password reset email sent!", "success");
    } catch (err: any) {
      console.error("Reset email error:", err);
      if (err.code === 'auth/user-not-found') {
        setEmailAuthError("No user found with this email address.");
        showToast("No user found with this email address.", "error");
      } else if (err.code === 'auth/invalid-email') {
        setEmailAuthError("Please enter a valid email address.");
        showToast("Please enter a valid email address.", "error");
      } else {
        setEmailAuthError(err.message);
        showToast(err.message, "error");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('dashboard');
    } catch (err: any) {
      setError("Logout failed: " + err.message);
      showToast("Logout failed: " + err.message, "error");
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const sanitizedUpdates = sanitizeForFirestore(updates);
      await updateDoc(doc(db, 'users', user.uid), sanitizedUpdates);
      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      setError("Failed to update profile: " + err.message);
      showToast("Failed to update profile: " + err.message, "error");
    }
  };

  const sanitizeForFirestore = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeForFirestore);
    } else if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj[key] === undefined) {
          // Default generalInstructions to empty string if undefined
          if (key === 'generalInstructions') {
            sanitized[key] = "";
          } else {
            // Remove other undefined fields
            continue;
          }
        } else {
          sanitized[key] = sanitizeForFirestore(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  const handleGenerate = async (config: PaperConfig) => {
    if (!user) {
        setError("Please login to generate papers.");
        showToast("Please login to generate papers.", "error");
        return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    try {
      const newPaper = await generateQuestionPaper(config);
      setGenerationProgress(100);
      newPaper.uid = user.uid;
      
      // Sanitize the object to remove any undefined values before saving to Firestore
      const sanitizedPaper = sanitizeForFirestore(newPaper);
      
      // Split metadata and questions
      const { questions, ...metadata } = sanitizedPaper;
      
      // Save metadata to 'papers'
      await setDoc(doc(db, 'papers', metadata.id), metadata);
      
      // Save questions to 'paperQuestions/{paperId}/questions/{questionId}'
      const batch = writeBatch(db);
      questions.forEach((q: any) => {
        const qRef = doc(db, 'paperQuestions', metadata.id, 'questions', q.question_id);
        batch.set(qRef, q);
      });
      await batch.commit();
      
      setTimeout(() => {
        setCurrentPaper(sanitizedPaper);
        setView('preview');
        setIsGenerating(false);
        showToast("Question paper generated successfully!", "success");
      }, 500);
    } catch (err: any) {
      if (err.message.includes('permission-denied')) {
        handleFirestoreError(err, OperationType.WRITE, 'papers/' + config.subject);
      }
      setError(err.message || "Failed to generate paper. Please try again.");
      showToast(err.message || "Failed to generate paper. Please try again.", "error");
      setIsGenerating(false);
    }
  };

  const handleUpdateBank = async (updatedBank: QuestionBank) => {
    if (!user) return;
    
    try {
        updatedBank.uid = user.uid;
        const sanitizedBank = sanitizeForFirestore(updatedBank);
        await setDoc(doc(db, 'banks', sanitizedBank.id), sanitizedBank);
        showToast("Question bank saved!", "success");
    } catch (err: any) {
        if (err.message.includes('permission-denied')) {
            handleFirestoreError(err, OperationType.WRITE, 'banks/' + updatedBank.id);
        }
        setError("Failed to save question bank: " + err.message);
        showToast("Failed to save question bank: " + err.message, "error");
    }
  };

  const handleUpdatePaper = async (updatedPaper: GeneratedPaper) => {
    if (!user) return;
    try {
        const sanitizedPaper = sanitizeForFirestore(updatedPaper);
        
        // Split metadata and questions
        const { questions, ...metadata } = sanitizedPaper;
        
        // Update metadata
        await setDoc(doc(db, 'papers', metadata.id), metadata);
        
        // Update questions (using batch for efficiency)
        const batch = writeBatch(db);
        questions.forEach((q: any) => {
          const qRef = doc(db, 'paperQuestions', metadata.id, 'questions', q.question_id);
          batch.set(qRef, q);
        });
        await batch.commit();
        
        setCurrentPaper(sanitizedPaper);
        showToast("Paper updated successfully!", "success");
    } catch (err: any) {
        if (err.message.includes('permission-denied')) {
            handleFirestoreError(err, OperationType.WRITE, 'papers/' + updatedPaper.id);
        }
        setError("Failed to update paper: " + err.message);
        showToast("Failed to update paper: " + err.message, "error");
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'papers', id));
        showToast("Paper deleted successfully!", "success");
        // Also delete questions (optional but good practice)
        // Note: Firestore doesn't delete subcollections automatically, 
        // but we can leave them or delete them if we have a list.
        // For now, metadata deletion is enough for the UI.
    } catch (err: any) {
        if (err.message.includes('permission-denied')) {
            handleFirestoreError(err, OperationType.DELETE, 'papers/' + id);
        }
        setError("Failed to delete paper: " + err.message);
        showToast("Failed to delete paper: " + err.message, "error");
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'banks', id));
        showToast("Question bank deleted!", "success");
    } catch (err: any) {
        if (err.message.includes('permission-denied')) {
            handleFirestoreError(err, OperationType.DELETE, 'banks/' + id);
        }
        setError("Failed to delete question bank: " + err.message);
        showToast("Failed to delete question bank: " + err.message, "error");
    }
  };

  const handleViewPaper = async (paperMetadata: GeneratedPaper) => {
    try {
      // Fetch questions for this paper
      const qSnap = await getDocs(collection(db, 'paperQuestions', paperMetadata.id, 'questions'));
      const questions = qSnap.docs.map(doc => doc.data() as any);
      
      const fullPaper = { ...paperMetadata, questions };
      setCurrentPaper(fullPaper);
      setView('preview');
    } catch (err: any) {
      console.error("Error fetching paper questions:", err);
      setError("Failed to load paper questions.");
      showToast("Failed to load paper questions.", "error");
    }
  };

  const handleCreateNew = useCallback(() => {
    setView('create');
    setError(null);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setView('dashboard');
    setCurrentPaper(null);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setView('dashboard');
  }, []);

  return (
    <div className="min-h-screen relative font-sans text-gray-900 selection:bg-[#EEA727] selection:text-[#3C128D] overflow-x-hidden flex flex-col">
      
      {/* Premium Vibrant Background Elements */}
      <div className="premium-bg-wrapper">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
        <div className="orb orb-5"></div>
      </div>

      {/* Top Navigation Bar - Liquid Glass Effect */}
      {location.pathname !== '/reset-password' && (
        <nav className="liquid-nav sticky top-4 z-50 w-full max-w-full overflow-hidden px-2 sm:px-6 py-2 sm:py-3 flex justify-between items-center transition-all duration-300 rounded-2xl mx-2 sm:mx-4 mb-4">
          <div className="flex items-center gap-1 sm:gap-3 cursor-pointer" onClick={handleBackToDashboard}>
              <Logo className="w-5 h-5 md:w-9 md:h-9 shadow-lg" />
              <span className="inline text-lg md:text-xl font-bold tracking-tight text-white drop-shadow-md">GenPaper<span className="text-amber-400 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">AI</span></span>
          </div>
          <div className="flex items-center gap-0.5 md:gap-3 flex-nowrap">
               {user ? (
                   <>
                      <button 
                          onClick={() => setView('dashboard')} 
                          className={`px-1.5 py-1 md:px-5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all duration-300 whitespace-nowrap flex-shrink ${view === 'dashboard' ? 'bg-white text-[#3C128D] shadow-md scale-100 ring-1 ring-[#8A2CB0]/20' : 'text-white hover:text-white/90 hover:bg-white/10'}`}
                      >
                          <span className="hidden sm:inline">Dashboard</span>
                          <span className="sm:hidden">Home</span>
                      </button>
                      <button 
                          onClick={() => setView('bank')} 
                          className={`px-1.5 py-1 md:px-5 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all duration-300 flex items-center gap-0.5 md:gap-2 whitespace-nowrap flex-shrink ${view === 'bank' ? 'bg-white text-[#3C128D] shadow-md scale-100 ring-1 ring-[#8A2CB0]/20' : 'text-white hover:text-white/90 hover:bg-white/10'}`}
                      >
                          <span className="hidden sm:inline">Question Bank</span>
                          <span className="sm:hidden">Question Bank</span>
                          <span className="px-1 py-0.5 rounded-md bg-amber-400 text-[#3C128D] text-[8px] sm:text-[10px] font-black uppercase tracking-tighter shadow-sm border border-amber-500/30">
                            🚧
                          </span>
                      </button>
                      
                      {/* User Profile Dropdown */}
                      <div className="relative flex-shrink-0 z-[60]">
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Profile menu clicked, current state:", isOpen);
                                  setIsOpen(!isOpen);
                              }}
                              className="w-6 h-6 md:w-10 md:h-10 rounded-full border border-white/30 overflow-hidden shadow-lg hover:border-white/60 transition-all duration-300 focus:outline-none bg-white/10 cursor-pointer"
                          >
                              {(userProfile?.profilePhoto || user.photoURL) ? (
                                  <img 
                                      src={userProfile?.profilePhoto || user.photoURL || ''} 
                                      alt={userProfile?.name || user.displayName || 'User'} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                  />
                              ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] flex items-center justify-center text-white font-bold">
                                      {(userProfile?.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                  </div>
                              )}
                          </button>

                          {isOpen && (
                              <>
                                  <div 
                                      className="fixed inset-0 z-[9998] bg-black/5" 
                                      onClick={() => setIsOpen(false)}
                                  ></div>
                                  <div className="fixed top-16 right-4 w-64 glass-panel rounded-2xl shadow-2xl z-[9999] py-2 animate-fade-in border border-white/40 opacity-100 bg-white">
                                      <div className="px-4 py-4 border-b border-gray-100 mb-1 bg-gray-50/50">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                                                  {(userProfile?.profilePhoto || user.photoURL) ? (
                                                      <img src={userProfile?.profilePhoto || user.photoURL || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                  ) : (
                                                      <div className="w-full h-full bg-[#3C128D] text-white flex items-center justify-center font-bold">
                                                          {(userProfile?.name || user.displayName || 'U').charAt(0).toUpperCase()}
                                                      </div>
                                                  )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-bold text-gray-800 truncate">{userProfile?.name || user.displayName}</p>
                                                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                              </div>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => { setView('profile'); setIsOpen(false); }}
                                          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                      >
                                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                              <UserIcon className="w-4 h-4 text-[#8A2CB0]" />
                                          </div>
                                          View Profile
                                      </button>
                                      <button 
                                          onClick={() => { setView('settings'); setIsOpen(false); }}
                                          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                      >
                                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                              <SettingsIcon className="w-4 h-4 text-[#8A2CB0]" />
                                          </div>
                                          Settings
                                      </button>
                                      <div className="border-t border-gray-100 mt-1 pt-1">
                                          <button 
                                              onClick={() => { handleLogout(); setIsOpen(false); }}
                                              className="w-full text-left px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                          >
                                              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                                  <LogOut className="w-4 h-4" />
                                              </div>
                                              Logout
                                          </button>
                                      </div>
                                  </div>
                              </>
                          )}
                      </div>
                   </>
               ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                          onClick={() => handleLogin('google')}
                          disabled={!!isLoggingIn}
                          className="px-5 py-2 rounded-xl text-sm font-bold bg-white text-[#3C128D] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                      >
                          {isLoggingIn === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 text-blue-500" />}
                          Google
                      </button>
                      <button 
                          onClick={() => handleLogin('microsoft')}
                          disabled={!!isLoggingIn}
                          className="px-5 py-2 rounded-xl text-sm font-bold bg-white text-[#3C128D] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                      >
                          {isLoggingIn === 'microsoft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4 text-blue-600" />}
                          Microsoft
                      </button>
                      <button 
                          onClick={() => { setShowEmailModal(true); setEmailMode('login'); }}
                          disabled={!!isLoggingIn}
                          className="px-5 py-2 rounded-xl text-sm font-bold bg-white text-[#3C128D] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                      >
                          <Mail className="w-4 h-4 text-rose-500" />
                          Email
                      </button>
                  </div>
               )}
          </div>
        </nav>
      )}

      {/* Toast Notification System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-5 right-5 z-[9999] px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-3 backdrop-blur-md border border-white/20
              ${toast.type === 'error' ? 'bg-rose-500/90' : toast.type === 'success' ? 'bg-emerald-500/90' : 'bg-amber-500/90'}`}
          >
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
            <span className="font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Animations */}
      <ThemeBackdrop theme={currentTheme} />

      {/* Main Content Area */}
      <main className="container mx-auto py-4 px-4 relative z-10 flex-grow">
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={
            !isAuthReady || (user && !userProfile) ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    <p className="text-white font-medium animate-pulse">
                        {user ? "Loading your profile..." : "Preparing GenPaperAI..."}
                    </p>
                </div>
            ) : !user ? (
                <div className="max-w-2xl mx-auto text-center py-12 sm:py-20 animate-fade-in">
                    <div className="flex justify-center mb-8">
                        <Logo className="w-16 h-16 sm:w-24 sm:h-24 shadow-2xl shadow-[#8A2CB0]/40" />
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 drop-shadow-lg leading-tight">Generate Question Papers in Seconds</h2>
                    <p className="text-xl text-white/80 mb-10 leading-relaxed">
                        GenPaperAI helps teachers and educators create high-quality, balanced question papers using advanced AI. 
                        Login to start creating and saving your papers.
                    </p>
                    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <button 
                            onClick={() => handleLogin('google')}
                            disabled={!!isLoggingIn}
                            className="w-full py-4 rounded-xl text-base font-black bg-white text-[#3C128D] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                        >
                            {isLoggingIn === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5 text-blue-500" />}
                            Google
                        </button>
                        <button 
                            onClick={() => handleLogin('microsoft')}
                            disabled={!!isLoggingIn}
                            className="w-full py-4 rounded-xl text-base font-black bg-white text-[#3C128D] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                        >
                            {isLoggingIn === 'microsoft' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5 text-blue-600" />}
                            Microsoft
                        </button>
                        <button 
                            onClick={() => { setShowEmailModal(true); setEmailMode('login'); }}
                            disabled={!!isLoggingIn}
                            className="w-full py-4 rounded-xl text-base font-black bg-white text-[#3C128D] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                        >
                            <Mail className="w-5 h-5 text-rose-500" />
                            Email
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="max-w-4xl mx-auto mb-8 p-4 glass-panel border-l-4 border-rose-500 text-rose-700 rounded-xl shadow-lg flex justify-between items-center animate-fade-in">
                            <span className="font-medium flex items-center gap-2">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                               {(() => {
                                 try {
                                   if (error.startsWith('{')) {
                                     const errInfo = JSON.parse(error);
                                     if (errInfo.error.includes('insufficient permissions')) {
                                       return "Permission denied. Please ensure you are logged in correctly and have access to this resource.";
                                     }
                                     return errInfo.error;
                                   }
                                 } catch (e) {}
                                 return error;
                               })()}
                            </span>
                            <button onClick={() => setError(null)} className="text-rose-500 font-bold hover:text-rose-800 p-1 rounded-md hover:bg-rose-50 transition-colors">&times;</button>
                        </div>
                    )}

                    {view === 'dashboard' && (
                      <Dashboard 
                        history={history} 
                        onCreateNew={handleCreateNew} 
                        onViewPaper={handleViewPaper} 
                        onViewBank={() => setView('bank')}
                        onDeletePaper={handleDeletePaper}
                      />
                    )}

                    {view === 'create' && (
                      <PaperForm 
                        onGenerate={handleGenerate} 
                        onCancel={handleCancelCreate} 
                        isGenerating={isGenerating}
                        questionBanks={questionBanks}
                      />
                    )}

                    {view === 'preview' && currentPaper && (
                      <PaperPreview 
                        paper={currentPaper} 
                        onBack={handleBackToDashboard} 
                        onUpdatePaper={handleUpdatePaper}
                      />
                    )}

                    {view === 'bank' && (
                        <QuestionBankView
                            banks={questionBanks}
                            onUpdateBank={handleUpdateBank}
                            onDeleteBank={handleDeleteBank}
                            onBack={handleBackToDashboard}
                        />
                    )}

                    {view === 'settings' && userProfile && (
                        <Settings 
                            profile={userProfile}
                            onUpdateProfile={handleUpdateProfile}
                            onBack={handleBackToDashboard}
                        />
                    )}

                    {view === 'profile' && (
                        userProfile ? (
                            <Profile 
                                profile={userProfile}
                                onBack={handleBackToDashboard}
                                onGoToSettings={() => setView('settings')}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                                <p className="text-white font-medium">Loading profile...</p>
                            </div>
                        )
                    )}
                </>
            )
          } />
        </Routes>
      </main>

      {/* Application Footer - Full Width Scrolling Marquee */}
      {location.pathname !== '/reset-password' && (
        <footer className="footer-bar mt-auto">
          <div className="marquee-track">
               {/* Repeated content for seamless infinite loop */}
               <span className="marquee-item">© ALL RIGHTS RESERVED. DESIGNED & DEVELOPED BY SRI DARSHIT & SRI VENKATESH PENDYALA</span>
               <span className="marquee-item">© ALL RIGHTS RESERVED. DESIGNED & DEVELOPED BY SRI DARSHIT & SRI VENKATESH PENDYALA</span>
               <span className="marquee-item">© ALL RIGHTS RESERVED. DESIGNED & DEVELOPED BY SRI DARSHIT & SRI VENKATESH PENDYALA</span>
               <span className="marquee-item">© ALL RIGHTS RESERVED. DESIGNED & DEVELOPED BY SRI DARSHIT & SRI VENKATESH PENDYALA</span>
          </div>
        </footer>
      )}

      {/* Email Auth Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
            setShowEmailModal(false);
            setIsForgotPassword(false);
            setResetEmailSent(false);
            setEmailAuthError(null);
          }}></div>
          <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden animate-scale-in border border-white/40">
            <div className="bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] p-6 text-white text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8A2CB0] to-[#EEA727] rounded-xl flex items-center justify-center text-white font-bold text-2xl border border-white/40 shadow-lg">
                G
              </div>
              <h3 className="text-2xl font-black leading-tight">
                {isForgotPassword ? 'Reset Password' : (emailMode === 'login' ? 'Login with your email and password' : 'Create Account')}
              </h3>
              {(isForgotPassword || emailMode === 'signup') && (
                <p className="text-white/70 text-sm mt-1">
                  {isForgotPassword 
                    ? 'Enter your email to receive a reset link' 
                    : 'Join GenPaperAI to start creating'}
                </p>
              )}
            </div>
            
            <form onSubmit={isForgotPassword ? handleForgotPassword : handleEmailAuth} className="p-8 space-y-5">
              {emailAuthError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {emailAuthError}
                </div>
              )}

              {resetEmailSent && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Password reset link sent to your email
                </div>
              )}

              {!resetEmailSent && (
                <>
                  {emailMode === 'signup' && !isForgotPassword && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          required
                          value={emailForm.name}
                          onChange={(e) => setEmailForm({...emailForm, name: e.target.value})}
                          placeholder="John Doe"
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8A2CB0] focus:border-transparent outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" 
                        required
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                        placeholder="name@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8A2CB0] focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {!isForgotPassword && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                        {emailMode === 'login' && (
                          <button 
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(true);
                              setEmailAuthError(null);
                            }}
                            className="text-[10px] font-black text-[#8A2CB0] uppercase tracking-widest hover:underline"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          value={emailForm.password}
                          onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8A2CB0] focus:border-transparent outline-none transition-all text-sm"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {emailMode === 'signup' && <p className="text-[10px] text-gray-400 ml-1">Minimum 6 characters</p>}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={emailAuthLoading || resetLoading}
                    className="w-full py-4 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white font-black rounded-2xl shadow-xl hover:shadow-[#3C128D]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {(emailAuthLoading || resetLoading) ? <Loader2 className="w-5 h-5 animate-spin" /> : (isForgotPassword ? 'Send Reset Link' : (emailMode === 'login' ? 'Login' : 'Create Account'))}
                  </button>

                  {isForgotPassword && (
                    <div className="space-y-3 pt-1 animate-fade-in">
                      <div className="flex items-start gap-3 p-3 bg-purple-50/40 border border-purple-100/50 rounded-2xl text-purple-900/80">
                        <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[#8A2CB0]" />
                        <p className="text-[11px] leading-normal font-bold">
                          If you don’t see the email, please check your <span className="text-[#8A2CB0] underline underline-offset-2">Spam/Junk mailbox</span>.
                        </p>
                      </div>
                      <p className="text-[10px] text-center text-gray-400 font-black uppercase tracking-widest opacity-70">
                        Email may take a few seconds to arrive
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    if (isForgotPassword) {
                      setIsForgotPassword(false);
                      setResetEmailSent(false);
                    } else {
                      setEmailMode(emailMode === 'login' ? 'signup' : 'login');
                    }
                    setEmailAuthError(null);
                  }}
                  className="text-sm font-bold text-[#8A2CB0] hover:underline"
                >
                  {isForgotPassword 
                    ? "Back to Login" 
                    : (emailMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generation Progress Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[10000]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 w-[320px] sm:w-[400px] text-center shadow-2xl border border-white/20"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-[#8A2CB0] animate-spin" />
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2">Generating Paper...</h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">Our AI is crafting your custom question paper. This may take a few seconds.</p>

              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-black inline-block py-1 px-2 uppercase rounded-full text-[#8A2CB0] bg-purple-100">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black inline-block text-[#8A2CB0]">
                      {Math.round(generationProgress)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#3C128D] to-[#8A2CB0]"
                  />
                </div>
              </div>
              
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">
                Please do not close this window
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
