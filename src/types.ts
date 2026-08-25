import { SubjectPaperPattern } from './data/subjectPatterns';

export interface SourceMetadata {
  class: string;
  subject: string;
  course?: string;
  textbook: string;
  sourceUrl: string;
  sourceType: 'Official NCERT' | 'Official CBSE' | 'Official SCERT';
  verifiedDate: string;
}

export interface QuestionCounts {
  mcq: number;
  ar: number; // Assertion-Reason
  vsaq: number; // Very Short Answer
  saq: number; // Short Answer
  laq: number; // Long Answer
  caseStudy: number;
}

export interface CustomSection {
  id: string;
  title: string; // e.g., "Section A"
  type: string; // e.g., "MCQ", "Case Study"
  count: number;
  marksPerQuestion: number;
  instructions?: string;
}

export interface PaperConfig {
  academicSession?: string; // e.g. "2026-27"
  board: string;
  schoolName: string;
  schoolLogo?: string;
  logoPlacement?: 'left' | 'center' | 'right';
  headingFont?: string;
  bodyFont?: string;
  generalInstructions?: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  totalMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  includeFigures: boolean;
  
  testType: string; // e.g., "Periodic Test 1", "Custom", "Official Pattern"
  customSections?: CustomSection[]; // Only used if testType is "Custom"
  
  // Subject-specific dynamic pattern & counts
  subjectPattern?: SubjectPaperPattern;
  patternCounts?: Record<string, number>;

  // Legacy/Standard counts (used if testType is NOT Custom or for backward compatibility)
  counts: QuestionCounts; 
  
  // Manually selected or extracted questions to include
  manualQuestions?: Question[];
}

export interface Question {
  question_id: string;
  section: string; // e.g., "Section A"
  question_text: string;
  options?: string[]; // Only for MCQs
  answer_type: string; // MCQ, Short, Long, Case
  marks: number;
  difficulty: number; // 1 to 5
  topic: string;
  can_regenerate: boolean;
  diagram_prompt?: string; // Description of the diagram needed
  image_url?: string; // The generated base64 image
  is_manually_edited?: boolean; // Track if user edited it
}

export interface GeneratedPaper {
  id: string;
  timestamp: number;
  config: PaperConfig;
  title: string;
  questions: Question[]; // Structured data
  answerKey: string; // Kept as text for simplicity, or could be structured later
  uid?: string; // Owner UID
}

export interface QuestionBank {
  id: string;
  board?: string;
  subject: string;
  grade: string;
  lastUpdated: number;
  content: string;
  uid?: string; // Owner UID
}

export interface HistoryStats {
  totalGenerated: number;
  topics: string[];
}

export interface MidnightThemeConfig {
  showStars: boolean;
  starCount: number; // 10 to 120, default 50
  starTwinkleSpeed: number; // 0.5 to 2.0, default 1.0
  showMoon: boolean;
  moonSize: number; // 40 to 180 (px), default 65
  moonGlowIntensity: number; // 0.2 to 1.0, default 0.6
  showShootingStars: boolean;
  nebulaGlow: boolean;
}

export interface SunsetThemeConfig {
  showSun: boolean;
  sunSize: number; // 50 to 220 (px), default 100
  sunGlowIntensity: number; // 0.2 to 1.0, default 0.7
  showClouds: boolean;
  showFloatingSolarDust: boolean;
  solarDustCount: number; // 5 to 40, default 15
  horizonWarmth: 'golden' | 'crimson' | 'amber';
}

export interface OceanThemeConfig {
  showBubbles: boolean;
  bubbleCount: number; // 6 to 40, default 16
  bubbleRiseSpeed: number; // 0.5 to 2.0, default 1.0
  showLightRays: boolean;
  rayIntensity: number; // 0.2 to 1.0, default 0.5
  showWaveShimmer: boolean;
  ambientDeepPlankton: boolean;
}

export interface ForestThemeConfig {
  showFireflies: boolean;
  fireflyCount: number; // 10 to 60, default 30
  fireflyGlowSize: number; // 3 to 14 (px), default 6
  fireflyPulseSpeed: number; // 0.5 to 2.0, default 1.0
  fireflyColor: 'emerald' | 'gold' | 'mint';
  showFloatingLeaves: boolean;
  forestMistOverlay: boolean;
}

export interface VibrantThemeConfig {
  showOrbs: boolean;
  orbCount: number; // 2 to 6, default 4
  orbSizeScale: number; // 0.5 to 1.8, default 1.0
  orbDriftSpeed: number; // 0.5 to 2.0, default 1.0
  showCenterGlow: boolean;
  showStardustParticles: boolean;
  particleDensity: number; // 5 to 30, default 12
}

export interface ThemeAnimationConfig {
  enableAnimations: boolean;
  animationSpeed: number; // 0.5 to 2.0, default 1.0
  animationIntensity: number; // 0.2 to 1.0, default 0.7
  midnight: MidnightThemeConfig;
  sunset: SunsetThemeConfig;
  ocean: OceanThemeConfig;
  forest: ForestThemeConfig;
  default: VibrantThemeConfig;
}

export const DEFAULT_THEME_ANIMATION_CONFIG: ThemeAnimationConfig = {
  enableAnimations: true,
  animationSpeed: 1.0,
  animationIntensity: 0.7,
  midnight: {
    showStars: true,
    starCount: 50,
    starTwinkleSpeed: 1.0,
    showMoon: true,
    moonSize: 65,
    moonGlowIntensity: 0.6,
    showShootingStars: true,
    nebulaGlow: true,
  },
  sunset: {
    showSun: true,
    sunSize: 100,
    sunGlowIntensity: 0.7,
    showClouds: true,
    showFloatingSolarDust: true,
    solarDustCount: 15,
    horizonWarmth: 'amber',
  },
  ocean: {
    showBubbles: true,
    bubbleCount: 16,
    bubbleRiseSpeed: 1.0,
    showLightRays: true,
    rayIntensity: 0.5,
    showWaveShimmer: true,
    ambientDeepPlankton: true,
  },
  forest: {
    showFireflies: true,
    fireflyCount: 30,
    fireflyGlowSize: 6,
    fireflyPulseSpeed: 1.0,
    fireflyColor: 'emerald',
    showFloatingLeaves: true,
    forestMistOverlay: true,
  },
  default: {
    showOrbs: true,
    orbCount: 4,
    orbSizeScale: 1.0,
    orbDriftSpeed: 1.0,
    showCenterGlow: true,
    showStardustParticles: true,
    particleDensity: 12,
  },
};

export interface UserPreferences {
  themeColor: string;
  background: string;
  themeCustomization?: ThemeAnimationConfig;
}

export type UserRole = 'user' | 'teacher' | 'admin' | 'super_admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  customProfilePhoto?: string | null;
  providerPhoto?: string | null;
  selectedTheme: string;
  preferences: UserPreferences;
  provider: 'google' | 'microsoft' | 'email';
  createdAt: number;
  lastLogin?: number;
  role: UserRole;
  defaultPaperSettings?: {
    board?: string;
    grade?: string;
    subject?: string;
    schoolName?: string;
  };
}

export interface CurriculumUpdate {
  id: string;
  board: string;
  version: string;
  data: any; // Grade -> Subject -> Chapters[]
  lastUpdated: number;
  source: string;
}

export interface MaintenanceConfig {
  enabled: boolean;
  message?: string;
  updatedAt: number;
  updatedBy?: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  title: string;
  message: string;
  type: 'info' | 'notice' | 'warning';
  dismissible: boolean;
  updatedAt: number;
  updatedBy?: string;
}

export interface AIModelConfig {
  id: string; // e.g. 'gemini-3-flash-preview'
  name: string;
  provider: 'Google DeepMind' | 'Gemini' | 'Custom';
  enabled: boolean;
  isDefault: boolean;
  priority: number; // 1 = Highest
  intendedUse: string; // e.g. "Primary Paper Generation"
  qualityNotes: string;
  dateAdded: number;
}

export interface AIModelRegistry {
  defaultModel: string;
  models: AIModelConfig[];
  updatedAt: number;
  updatedBy?: string;
}

export interface AdminAuditLogEntry {
  id: string;
  adminEmail: string;
  adminUid?: string;
  action: string; // e.g. "ROLE_PROMOTED", "MAINTENANCE_TOGGLED", "MODEL_UPDATED"
  targetResource: string; // e.g. "user:john@school.org" or "app_config:maintenance"
  details?: Record<string, any>;
  timestamp: number;
}

export interface SecurityEventEntry {
  id: string;
  eventType: 'FAILED_LOGIN' | 'ROLE_CHANGE_ATTEMPT' | 'UNAUTHORIZED_ACCESS' | 'CONFIG_TAMPER_ATTEMPT' | 'AUTH_PROVIDER_ERROR';
  provider?: string;
  identifier?: string; // Email or UID (redacted if sensitive)
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface GenerationMetricEntry {
  id: string;
  timestamp: number;
  durationMs: number;
  modelUsed: string;
  subject: string;
  grade: string;
  board: string;
  testType: string;
  totalMarks: number;
  status: 'success' | 'failure';
  error?: string;
  usedWebExtract?: boolean;
  usedQuestionBank?: boolean;
  usedDiagrams?: boolean;
  uid?: string;
}

export interface SystemHealthReport {
  aiStatus: 'healthy' | 'degraded' | 'failed' | 'testing';
  aiLatencyMs?: number;
  aiMessage?: string;
  firestoreStatus: 'healthy' | 'degraded' | 'failed' | 'testing';
  firestoreLatencyMs?: number;
  storageStatus: 'healthy' | 'degraded' | 'failed' | 'testing';
  authStatus: 'healthy' | 'degraded' | 'failed' | 'testing';
  authDetails?: {
    google: boolean;
    microsoft: boolean;
    email: boolean;
  };
  lastChecked: number;
}
