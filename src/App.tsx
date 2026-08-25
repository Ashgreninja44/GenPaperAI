
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import PaperForm from './components/PaperForm';
import PaperPreview from './components/PaperPreview';
import QuestionBankView from './components/QuestionBank';
import Settings from './components/Settings';
import Profile from './components/Profile';
import ResetPassword from './components/ResetPassword';
import About from './components/About';
import Maintenance from './components/Maintenance';
import ThemeStudio from './components/ThemeStudio';
import { isMaintenanceModeActive } from './config/maintenance';
import ScrollToTop from './components/ScrollToTop';
import BackgroundAnimation from './components/BackgroundAnimation';
import ThemeBackdrop from './components/ThemeBackdrop';
import Logo from './components/Logo';
import { GoogleIcon, MicrosoftIcon, EmailIcon } from './components/BrandIcons';
import { SyllabusData, getLatestCurriculum, updateSyllabusFromSources } from './services/syllabusService';
import { PaperConfig, GeneratedPaper, QuestionBank, UserProfile, MaintenanceConfig, AnnouncementConfig, ThemeAnimationConfig, DEFAULT_THEME_ANIMATION_CONFIG } from './types';
import { generateQuestionPaper } from './services/geminiService';
import { subscribeToMaintenanceMode, isSuperAdmin, setMaintenanceMode } from './services/maintenanceService';
import { subscribeToAnnouncement } from './services/adminService';
import { 
  savePaperToFirestore, 
  loadPaperFromFirestore, 
  deletePaperFromFirestore 
} from './services/paperStorageService';
import { getEffectiveProfilePhoto } from './services/profilePhotoService';
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
import { 
  LogOut, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Mail, 
  Shield, 
  Globe, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Eye, 
  EyeOff,
  Zap,
  BookOpen,
  Printer,
  Info,
  Sparkles,
  FileCheck,
  FileText,
  Radio,
  Palette
} from 'lucide-react';

type View = 'dashboard' | 'create' | 'preview' | 'bank' | 'settings' | 'appearance' | 'profile' | 'about';

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
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('genpaper_selected_theme');
      if (saved) return saved;
    } catch (e) {}
    return 'default';
  });
  const [themeConfig, setThemeConfig] = useState<ThemeAnimationConfig>(() => {
    try {
      const saved = localStorage.getItem('genpaper_theme_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_THEME_ANIMATION_CONFIG;
  });
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
  const [dynamicSyllabus, setDynamicSyllabus] = useState<SyllabusData | null>(null);
  const [isSyncingSyllabus, setIsSyncingSyllabus] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig | null>(null);
  const [announcementConfig, setAnnouncementConfig] = useState<AnnouncementConfig | null>(null);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [showLegalModal, setShowLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Subscribe to real-time maintenance status from Firestore
  useEffect(() => {
    const unsubscribeMaintenance = subscribeToMaintenanceMode((config) => {
      setMaintenanceConfig(config);
    });
    return () => unsubscribeMaintenance();
  }, []);

  // Subscribe to real-time global announcements
  useEffect(() => {
    const unsubscribeAnnouncement = subscribeToAnnouncement((config) => {
      setAnnouncementConfig(config);
      setIsAnnouncementDismissed(false);
    });
    return () => unsubscribeAnnouncement();
  }, []);

  // Instantly reset scroll to top on in-app view changes
  useEffect(() => {
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
  }, [view]);

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
              let data = userDoc.data() as UserProfile;
              
              // Ensure providerPhoto is tracked if not already set
              const providerPhoto = currentUser.photoURL || currentUser.providerData?.find(p => p.photoURL)?.photoURL || null;
              if (providerPhoto && !data.providerPhoto) {
                data.providerPhoto = providerPhoto;
                updateDoc(userDocRef, { providerPhoto }).catch(() => {});
              }
              
              // Bootstrap Admin for Dev
              if (currentUser.email === 'pendyaladarshit4@gmail.com' && data.role !== 'admin') {
                console.log("Elevating user to admin...");
                data.role = 'admin';
                await updateDoc(userDocRef, { role: 'admin' });
              }
              
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

            const providerPhoto = currentUser.photoURL || currentUser.providerData?.find(p => p.photoURL)?.photoURL || null;

            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Anonymous User',
              email: currentUser.email || '',
              profilePhoto: providerPhoto,
              customProfilePhoto: null,
              providerPhoto: providerPhoto,
              selectedTheme: 'default',
              preferences: {
                themeColor: 'default',
                background: 'default'
              },
              provider,
              createdAt: Date.now(),
              role: currentUser.email === 'pendyaladarshit4@gmail.com' ? 'admin' : 'user',
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

    // Check for redirect result safely without crashing on iframe/IndexedDB closing states
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("Redirect login success:", result.user.uid);
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        showToast(isNewUser ? "🎉 Welcome to GenPaperAI!" : "👋 Welcome back!", "success");
      }
    }).catch((err) => {
      const msg = err?.message || String(err);
      if (
        msg.includes('closing') ||
        msg.includes('hidden') ||
        msg.includes('Database is closing') ||
        err?.code === 'auth/no-auth-event' ||
        err?.code === 'auth/null-user'
      ) {
        console.warn("Redirect result skipped (transient iframe/IndexedDB state):", msg);
        return;
      }
      console.error("[FirebaseAuth] Redirect result error:", err?.code, err?.message, err);
      if (err?.code === 'auth/account-exists-with-different-credential') {
        showToast("An account already exists with this email using a different sign-in method. Please sign in with Google or Email.", "error");
      } else if (err?.code === 'auth/unauthorized-domain') {
        showToast(`Domain (${window.location.hostname}) is not authorized in Firebase Auth settings.`, "error");
      } else if (err?.code && err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        showToast(`Sign-in notice: ${err.message || err.code}`, "error");
      }
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

  // Sync Syllabus from Firestore
  useEffect(() => {
    const fetchSyllabus = async () => {
        const latest = await getLatestCurriculum();
        if (latest) {
            console.log("Dynamic syllabus loaded from Firestore");
            setDynamicSyllabus(latest);
        }
    };
    fetchSyllabus();
  }, []);

  const handleSyncSyllabus = async () => {
    if (!userProfile || userProfile.role !== 'admin') return;
    
    setIsSyncingSyllabus(true);
    showToast("Starting Automated Syllabus Sync...", "success");
    
    try {
        const result = await updateSyllabusFromSources("CBSE");
        if (result.success && result.data) {
            setDynamicSyllabus(result.data);
            showToast(result.message, "success");
        } else {
            showToast(result.message, "error");
        }
    } catch (err: any) {
        showToast("Sync Failed: " + err.message, "error");
    } finally {
        setIsSyncingSyllabus(false);
    }
  };

  // Apply Theme
  useEffect(() => {
    if (!userProfile) {
      console.log("No user profile, applying stored/default theme");
      applyTheme(currentTheme || 'default', themeConfig);
      return;
    }

    const theme = userProfile.preferences?.themeColor || userProfile.selectedTheme || currentTheme || 'default';
    const customConfig = userProfile.preferences?.themeCustomization || themeConfig || DEFAULT_THEME_ANIMATION_CONFIG;
    console.log("Fetched preferences:", userProfile.preferences);
    console.log("Applying theme:", theme);
    applyTheme(theme, customConfig);
  }, [userProfile]);

  const applyTheme = (theme: string, config?: ThemeAnimationConfig) => {
    setCurrentTheme(theme);
    const activeConfig = config || themeConfig || DEFAULT_THEME_ANIMATION_CONFIG;
    setThemeConfig(activeConfig);
    try {
      localStorage.setItem('genpaper_theme_config', JSON.stringify(activeConfig));
      localStorage.setItem('genpaper_selected_theme', theme);
    } catch (e) {}

    const bgWrapper = document.querySelector('.premium-bg-wrapper') as HTMLElement;
    if (bgWrapper) {
      bgWrapper.style.background = THEMES[theme] || THEMES.default;
      if (activeConfig.enableAnimations === false) {
        bgWrapper.style.animation = 'none';
      } else {
        bgWrapper.style.animation = `gradientMove ${15 / Math.max(activeConfig.animationSpeed || 1, 0.3)}s ease infinite`;
      }
    }
    
    const orbs = ORB_THEMES[theme] || ORB_THEMES.default;
    orbs.forEach((color, i) => {
      const orb = document.querySelector(`.orb-${i + 1}`) as HTMLElement;
      if (orb) {
        orb.style.background = color;
        if (activeConfig.enableAnimations === false || (theme === 'default' && activeConfig.default && !activeConfig.default.showOrbs)) {
          orb.style.display = 'none';
        } else {
          orb.style.display = 'block';
        }
      }
    });
  };

  const handleApplyTheme = async (newThemeId: string, newConfig: ThemeAnimationConfig) => {
    applyTheme(newThemeId, newConfig);
    if (user) {
      try {
        const updates: Partial<UserProfile> = {
          selectedTheme: newThemeId,
          preferences: {
            themeColor: newThemeId,
            background: newThemeId,
            themeCustomization: newConfig,
          }
        };
        const sanitizedUpdates = sanitizeForFirestore(updates);
        await updateDoc(doc(db, 'users', user.uid), sanitizedUpdates);
      } catch (err: any) {
        console.error("Error saving theme to Firestore:", err);
      }
    }
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

    const provider = providerType === 'google' ? googleProvider : microsoftProvider;

    try {
      console.log(`[FirebaseAuth] Starting ${providerType} login via popup...`);
      const result = await signInWithPopup(auth, provider);
      console.log(`[FirebaseAuth] ${providerType} login success:`, result.user.uid);
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      showToast(isNewUser ? "🎉 Welcome to GenPaperAI!" : "👋 Welcome back!", "success");
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMessage = err?.message || String(err);
      console.error(`[FirebaseAuth] ${providerType} login error:`, {
        code: errorCode,
        message: errorMessage,
        customData: err?.customData,
        currentHostname: window.location.hostname
      });

      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        console.log(`[FirebaseAuth] ${providerType} login popup closed by user`);
      } else if (errorCode === 'auth/popup-blocked') {
        console.warn(`[FirebaseAuth] Popup was blocked by browser for ${providerType}. Attempting redirect...`);
        showToast("Popup blocked by browser. Redirecting to Microsoft sign-in...", "warning");
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: any) {
          console.error(`[FirebaseAuth] Redirect initiation error:`, redirectErr);
          showToast("Popup blocked. Please allow popups for this site or use Google / Email sign-in.", "error");
        }
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        const email = err?.customData?.email || 'this email';
        showToast(`An account already exists for ${email} using a different sign-in method. Please sign in with Google or Email.`, "error");
      } else if (errorCode === 'auth/unauthorized-domain') {
        const currentHost = window.location.hostname;
        console.error(`[FirebaseAuth] Unauthorized Domain: ${currentHost}. Add '${currentHost}' to Firebase Console > Authentication > Settings > Authorized domains.`);
        showToast(`Domain not authorized (${currentHost}). Add it to Firebase Auth Authorized Domains.`, "error");
      } else if (errorCode === 'auth/operation-not-allowed') {
        console.error(`[FirebaseAuth] Operation not allowed. Enable Microsoft under Firebase Console > Authentication > Sign-in method.`);
        showToast(`Microsoft sign-in is not enabled in the Firebase Console. Please enable Microsoft under Auth Providers.`, "error");
      } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/invalid-oauth-provider') {
        if (errorMessage.includes('AADSTS7000215') || errorMessage.includes('client secret')) {
          showToast("Azure configuration error: In Firebase Console > Authentication > Microsoft, replace the Secret ID with the Azure Client Secret Value.", "error");
        } else {
          showToast(`Invalid ${providerType} credentials or OAuth application configuration.`, "error");
        }
      } else if (errorCode === 'auth/internal-error') {
        showToast(`Authentication service error. Please check your network and try again.`, "error");
      } else {
        showToast(`${providerType === 'microsoft' ? 'Microsoft' : 'Google'} login failed: ${errorMessage}`, "error");
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

  const formatErrorMessage = (msg: string) => {
    const match = msg.match(/^\[(.*?)\]/);
    if (match) return match[1];
    
    // Fallback: try to parse the JSON part if it's there
    try {
        const jsonPart = msg.split('] ')[1] || msg;
        const errObj = JSON.parse(jsonPart);
        if (errObj.error) return errObj.error.split(':')[0]; // Return the first part of the message
    } catch(e) { /* ignore */ }
    
    return msg;
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
      const startTime = performance.now();
      const newPaper = await generateQuestionPaper(config);
      setGenerationProgress(100);
      newPaper.uid = user.uid;
      
      // Instant View Transition: Display the generated paper to the teacher immediately
      setCurrentPaper(newPaper);
      setView('preview');
      setIsGenerating(false);
      showToast("Question paper generated successfully!", "success");

      const renderTime = (performance.now() - startTime).toFixed(0);
      console.log(`[GenPaperAI Performance] Paper ready in ${renderTime}ms. Saving to cloud in background...`);

      // Asynchronous Background Persistence: Save paper using modular storage architecture without blocking UI
      savePaperToFirestore(db, newPaper, user.uid)
        .then(() => {
          console.log(`[GenPaperAI Storage] Paper ${newPaper.id} saved to Firestore successfully.`);
        })
        .catch((saveErr: any) => {
          console.error("[GenPaperAI Storage Error] Failed to persist paper to Firestore:", saveErr);
          if (saveErr?.message?.includes('permission-denied')) {
            handleFirestoreError(saveErr, OperationType.WRITE, 'papers/' + config.subject);
          }
          showToast("Note: Paper preview loaded, but cloud autosave failed: " + (saveErr?.message || "Network error"), "warning");
        });
    } catch (err: any) {
      if (err.message?.includes('permission-denied')) {
        handleFirestoreError(err, OperationType.WRITE, 'papers/' + config.subject);
      }
      const displayError = formatErrorMessage(err.message || String(err));
      setError(displayError || "Failed to generate paper. Please try again.");
      showToast(displayError || "Failed to generate paper. Please try again.", "error");
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
        await savePaperToFirestore(db, updatedPaper, user.uid);
        setCurrentPaper(updatedPaper);
        showToast("Paper updated successfully!", "success");
    } catch (err: any) {
        if (err.message?.includes('permission-denied')) {
            handleFirestoreError(err, OperationType.WRITE, 'papers/' + updatedPaper.id);
        }
        const displayError = formatErrorMessage(err.message || String(err));
        setError("Update Failed: " + displayError);
        showToast(displayError, "error");
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (!user) return;
    try {
        await deletePaperFromFirestore(db, id);
        showToast("Paper deleted successfully!", "success");
    } catch (err: any) {
        if (err.message?.includes('permission-denied')) {
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
      const fullPaper = await loadPaperFromFirestore(db, paperMetadata);
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

  // Maintenance Mode Gate
  const isAdmin = isSuperAdmin(user?.email, userProfile?.role);
  const maintenanceActive = isMaintenanceModeActive(maintenanceConfig, user?.email, userProfile?.role);

  if (maintenanceActive && !isAdmin) {
    return (
      <Maintenance 
        config={maintenanceConfig} 
        currentUser={user} 
        userProfile={userProfile} 
        onEnterApp={() => setView('dashboard')} 
      />
    );
  }

  return (
    <div className="min-h-screen relative font-sans text-gray-900 selection:bg-[#EEA727] selection:text-[#3C128D] overflow-x-hidden flex flex-col">
      <ScrollToTop />

      {/* Super Admin Top Notice when Maintenance is Active */}
      {maintenanceConfig?.enabled && isAdmin && location.pathname !== '/reset-password' && (
        <div className="w-full bg-amber-400 text-gray-950 px-4 py-2.5 text-xs sm:text-sm font-bold flex flex-wrap items-center justify-between gap-2 z-[60] shadow-lg border-b border-amber-500">
          <div className="flex items-center gap-2">
            <span className="text-base">🚧</span>
            <span>
              <strong>MAINTENANCE MODE IS ACTIVE GLOBALLY:</strong> Public visitors currently see the maintenance page. You are browsing with Super Admin access.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={async () => {
                if (user?.email) {
                  await setMaintenanceMode(false, user.email);
                }
              }}
              className="px-3 py-1 bg-gray-950 hover:bg-gray-900 text-amber-300 text-xs font-black rounded-lg transition-transform active:scale-95 cursor-pointer"
            >
              Turn OFF Maintenance Mode
            </button>
            <button
              onClick={() => setView('profile')}
              className="px-3 py-1 bg-black/10 hover:bg-black/20 text-gray-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Admin Settings →
            </button>
          </div>
        </div>
      )}
      
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
        <nav className="liquid-nav sticky top-4 z-50 w-full max-w-full px-2 sm:px-6 py-2 sm:py-3 flex justify-between items-center transition-all duration-300 rounded-2xl mx-2 sm:mx-4 mb-4">
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
                              {getEffectiveProfilePhoto(userProfile, user.photoURL) ? (
                                  <img 
                                      src={getEffectiveProfilePhoto(userProfile, user.photoURL)!} 
                                      alt={userProfile?.name || user.displayName || 'User'} 
                                      className="w-full h-full object-cover rounded-full"
                                      referrerPolicy="no-referrer"
                                  />
                              ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] flex items-center justify-center text-white font-bold rounded-full">
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
                                  <div className="absolute top-full right-0 mt-2 w-64 glass-panel rounded-2xl shadow-2xl z-[9999] py-2 animate-fade-in border border-white/40 opacity-100 bg-white shadow-xl">
                                      <div className="px-4 py-4 border-b border-gray-100 mb-1 bg-gray-50/50">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 ring-1 ring-purple-100">
                                                  {getEffectiveProfilePhoto(userProfile, user.photoURL) ? (
                                                      <img 
                                                          src={getEffectiveProfilePhoto(userProfile, user.photoURL)!} 
                                                          alt="" 
                                                          className="w-full h-full object-cover rounded-full" 
                                                          referrerPolicy="no-referrer" 
                                                      />
                                                  ) : (
                                                      <div className="w-full h-full bg-[#3C128D] text-white flex items-center justify-center font-bold rounded-full">
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
                                          onClick={() => { setView('appearance'); setIsOpen(false); }}
                                          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                      >
                                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                              <Palette className="w-4 h-4 text-amber-600" />
                                          </div>
                                          Appearance & Theme
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

                                    <button 
                                        onClick={() => { setView('about'); setIsOpen(false); }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                        </div>
                                        About GenPaperAI
                                    </button>
                                    
                                    {userProfile?.role === 'admin' && (
                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button 
                                                onClick={() => { handleSyncSyllabus(); setIsOpen(false); }}
                                                disabled={isSyncingSyllabus}
                                                className="w-full text-left px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-3 transition-colors disabled:opacity-50"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                                    {isSyncingSyllabus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                                                </div>
                                                Sync Syllabus (AI)
                                            </button>
                                        </div>
                                    )}

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
                  <div className="flex items-center gap-2">
                      <button 
                          onClick={() => navigate('/about')}
                          className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                          <Info className="w-3.5 h-3.5 text-amber-300" />
                          <span>About</span>
                      </button>
                      <button 
                          onClick={() => {
                              const el = document.getElementById('auth-card');
                              if (el) {
                                  el.scrollIntoView({ behavior: 'smooth' });
                              }
                          }}
                          className="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-white text-[#3C128D] shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                      >
                          Sign In
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
      <ThemeBackdrop theme={currentTheme} config={themeConfig} />

      {/* Main Content Area */}
      <main className="container mx-auto py-4 px-4 relative z-10 flex-grow">
        {/* Global Announcement Banner */}
        {announcementConfig?.enabled && !isAnnouncementDismissed && (
          <div className={`mb-6 p-4 rounded-2xl border shadow-lg backdrop-blur-md flex items-start justify-between gap-4 animate-fade-in ${
            announcementConfig.type === 'warning'
              ? 'bg-amber-500/15 border-amber-400/40 text-amber-950 dark:text-amber-100'
              : announcementConfig.type === 'notice'
              ? 'bg-purple-500/15 border-purple-400/40 text-purple-950 dark:text-purple-100'
              : 'bg-blue-500/15 border-blue-400/40 text-blue-950 dark:text-blue-100'
          }`}>
            <div className="flex items-start gap-3">
              <span className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                announcementConfig.type === 'warning'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : announcementConfig.type === 'notice'
                  ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                  : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
              }`}>
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <h4 className="text-sm font-black flex items-center gap-2">
                  {announcementConfig.title}
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 px-2 py-0.5 rounded-full bg-white/20">
                    Official Broadcast
                  </span>
                </h4>
                <p className="text-xs mt-0.5 leading-relaxed opacity-90">
                  {announcementConfig.message}
                </p>
              </div>
            </div>

            {announcementConfig.dismissible && (
              <button
                onClick={() => setIsAnnouncementDismissed(true)}
                className="text-xs font-bold px-2 py-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-75 hover:opacity-100 shrink-0"
                title="Dismiss announcement"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={
            <About 
              isLoggedIn={!!user} 
              onBack={() => { 
                if (user) { 
                  setView('dashboard'); 
                } 
                navigate('/'); 
              }} 
              onOpenAuth={() => { 
                navigate('/'); 
                setTimeout(() => {
                  document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} 
            />
          } />
          <Route path="*" element={
            !isAuthReady || (user && !userProfile) ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    <p className="text-white font-medium animate-pulse">
                        {user ? "Loading your profile..." : "Preparing GenPaperAI..."}
                    </p>
                </div>
            ) : !user ? (
                <div className="max-w-4xl mx-auto text-center py-8 sm:py-14 animate-fade-in px-2">
                    {/* Logo & Hero */}
                    <div className="flex justify-center mb-6">
                        <Logo className="w-20 h-20 sm:w-24 sm:h-24 shadow-2xl shadow-[#8A2CB0]/50" />
                    </div>
                    
                    <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 drop-shadow-lg leading-tight tracking-tight">
                        Generate Question Papers in Seconds
                    </h1>
                    
                    <p className="text-base sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
                        Create structured, curriculum-aware question papers with AI. Choose your class, subject, chapters and paper pattern, and let GenPaperAI handle the rest.
                    </p>

                    {/* Authentication Card */}
                    <div 
                        id="auth-card"
                        className="w-full max-w-md mx-auto glass-panel bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40 text-gray-900 transition-all text-left"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-black text-[#3C128D] tracking-tight">
                                Welcome to GenPaperAI
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                                Sign in to continue
                            </p>
                        </div>

                        <div className="space-y-3">
                            {/* Google Authentication Button */}
                            <button 
                                onClick={() => handleLogin('google')}
                                disabled={!!isLoggingIn}
                                className="w-full py-3.5 px-4 rounded-2xl text-sm sm:text-base font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
                            >
                                {isLoggingIn === 'google' ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-[#8A2CB0]" />
                                ) : (
                                    <GoogleIcon className="w-5 h-5 shrink-0" />
                                )}
                                <span>Continue with Google</span>
                            </button>

                            {/* Microsoft Authentication Button */}
                            <button 
                                onClick={() => handleLogin('microsoft')}
                                disabled={!!isLoggingIn}
                                className="w-full py-3.5 px-4 rounded-2xl text-sm sm:text-base font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
                            >
                                {isLoggingIn === 'microsoft' ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-[#8A2CB0]" />
                                ) : (
                                    <MicrosoftIcon className="w-5 h-5 shrink-0" />
                                )}
                                <span>Continue with Microsoft</span>
                            </button>

                            {/* Divider */}
                            <div className="relative py-2 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    or
                                </div>
                            </div>

                            {/* Email Authentication Button */}
                            <button 
                                onClick={() => { setShowEmailModal(true); setEmailMode('login'); }}
                                disabled={!!isLoggingIn}
                                className="w-full py-3.5 px-4 rounded-2xl text-sm sm:text-base font-bold bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
                            >
                                <EmailIcon className="w-5 h-5 shrink-0" />
                                <span>Continue with Email</span>
                            </button>
                        </div>

                        {/* Email Account Helper */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                New to GenPaperAI?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setShowEmailModal(true); setEmailMode('signup'); }}
                                    className="font-bold text-[#8A2CB0] hover:underline cursor-pointer"
                                >
                                    Create an account
                                </button>
                            </p>
                        </div>

                        {/* Terms & Privacy Notice */}
                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <p className="text-[11px] text-gray-400 leading-normal">
                                By continuing, you agree to our{' '}
                                <button 
                                    type="button"
                                    onClick={() => setShowLegalModal('terms')} 
                                    className="text-gray-600 hover:text-[#8A2CB0] underline underline-offset-2 transition-colors font-semibold cursor-pointer"
                                >
                                    Terms of Service
                                </button>{' '}
                                and{' '}
                                <button 
                                    type="button"
                                    onClick={() => setShowLegalModal('privacy')} 
                                    className="text-gray-600 hover:text-[#8A2CB0] underline underline-offset-2 transition-colors font-semibold cursor-pointer"
                                >
                                    Privacy Policy
                                </button>
                                .
                            </p>
                        </div>
                    </div>

                    {/* Feature Highlights Strip */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                        <div className="glass-panel p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg flex flex-col">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center mb-3 shadow-md">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-base text-white mb-1">Fast Generation</h3>
                            <p className="text-xs text-white/80 leading-relaxed">
                                Generate structured, balanced question papers in seconds with automatic sectioning and marks calculation.
                            </p>
                        </div>

                        <div className="glass-panel p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg flex flex-col">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8A2CB0] to-purple-600 text-white flex items-center justify-center mb-3 shadow-md">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-base text-white mb-1">Curriculum-Aware</h3>
                            <p className="text-xs text-white/80 leading-relaxed">
                                Aligned with CBSE and state board syllabi, grades, subjects, chapters, and subject blueprints.
                            </p>
                        </div>

                        <div className="glass-panel p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg flex flex-col">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center mb-3 shadow-md">
                                <Printer className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-base text-white mb-1">Ready-to-Print Papers</h3>
                            <p className="text-xs text-white/80 leading-relaxed">
                                Instantly preview, customize, and export clean PDF documents ready for printing with matching answer keys.
                            </p>
                        </div>
                    </div>

                    {/* Public Link to About Page */}
                    <div className="mt-10 text-center">
                        <button
                            onClick={() => navigate('/about')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold backdrop-blur-md border border-white/25 transition-all hover:scale-105 cursor-pointer shadow-lg"
                        >
                            <Info className="w-4 h-4 text-amber-300" />
                            <span>Learn about GenPaperAI & its Creator →</span>
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
                        dynamicSyllabus={dynamicSyllabus}
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

                    {view === 'appearance' && (
                        <ThemeStudio 
                            profile={userProfile}
                            currentTheme={currentTheme}
                            themeConfig={themeConfig}
                            onUpdateTheme={handleApplyTheme}
                            onBack={handleBackToDashboard}
                            showToast={showToast}
                        />
                    )}

                    {view === 'settings' && userProfile && (
                        <Settings 
                            profile={userProfile}
                            currentTheme={currentTheme}
                            themeConfig={themeConfig}
                            onUpdateProfile={handleUpdateProfile}
                            onNavigateToThemeStudio={() => setView('appearance')}
                            onBack={handleBackToDashboard}
                        />
                    )}

                    {view === 'profile' && (
                        userProfile ? (
                            <Profile 
                                profile={userProfile}
                                onBack={handleBackToDashboard}
                                onGoToSettings={() => setView('settings')}
                                maintenanceConfig={maintenanceConfig}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                                <p className="text-white font-medium">Loading profile...</p>
                            </div>
                        )
                    )}

                    {view === 'about' && (
                        <About 
                            isLoggedIn={true}
                            onBack={() => setView('dashboard')}
                        />
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
      {/* Legal / Terms / Privacy Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLegalModal(null)}></div>
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl z-10 overflow-hidden animate-scale-in border border-white/40 bg-white p-6 sm:p-8 text-gray-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-xl font-black text-[#3C128D]">
                {showLegalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <button 
                onClick={() => setShowLegalModal(null)} 
                className="text-gray-400 hover:text-gray-600 font-bold p-1 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {showLegalModal === 'terms' ? (
                <>
                  <p><strong>Educational Assessment Tool:</strong> GenPaperAI is designed to assist educators, teachers, and schools in preparing balanced question papers and academic assessments efficiently.</p>
                  <p><strong>Teacher Review & Authority:</strong> All generated questions and papers are suggestions to be reviewed, edited, and approved by qualified educators before use in formal examinations.</p>
                  <p><strong>Account Responsibility:</strong> Users are responsible for maintaining the security of their login credentials and the content saved in their workspaces.</p>
                  <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    GenPaperAI adheres to standard academic integrity and software guidelines.
                  </p>
                </>
              ) : (
                <>
                  <p><strong>Data Privacy:</strong> GenPaperAI values educator and student privacy. We only store paper configurations and question banks that you explicitly create and save in your account.</p>
                  <p><strong>Cloud Security:</strong> Authentication is handled securely via Firebase Authentication (Google, Microsoft, and Email). Stored papers are saved in private Firestore collections accessible solely to your authenticated account.</p>
                  <p><strong>No Commercial Sale of Data:</strong> We do not sell, rent, or monetize your generated question papers or personal account information.</p>
                  <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    Compliance policies are maintained in accordance with standard cloud privacy best practices.
                  </p>
                </>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowLegalModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#3C128D] text-white text-sm font-bold shadow-md hover:opacity-90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
