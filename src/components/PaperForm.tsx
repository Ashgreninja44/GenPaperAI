
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PaperConfig, QuestionCounts, CustomSection, QuestionBank, Question, UserProfile, SubscriptionGlobalConfig, WebResearchConfig } from '../types';
import { SYLLABUS_DATA, GRADES, FONT_OPTIONS, BOARDS, TEST_TYPES, QUESTION_TYPES_DROPDOWN, CBSE_EXAM_PATTERNS, PRESET_SCHOOLS } from '../constants';
import { SyllabusData } from '../services/syllabusService';
import { parseQuestionsFromText, extractQuestionsFromUrl } from '../services/geminiService';
import { convertToRuntimeQuestion } from '../services/questionBankService';
import { getSubjectPattern, SubjectPaperPattern, ACADEMIC_SESSIONS } from '../data/subjectPatterns';
import MarkdownRenderer from './MarkdownRenderer';
import { WebResearchModal } from './WebResearchModal';
import { Globe, BookOpen, Sparkles, Link as LinkIcon, Database, Check, Plus, Trash2, Edit3 } from 'lucide-react';

// Defined Weights and Specs (Legacy/Standard Mode Fallback)
const QUESTION_SPECS: { label: string; key: keyof QuestionCounts; marks: number }[] = [
  { label: "MCQs", key: "mcq", marks: 1 },
  { label: "Assertion-Reason", key: "ar", marks: 1 },
  { label: "Very Short (VSAQ)", key: "vsaq", marks: 2 },
  { label: "Short Answer (SAQ)", key: "saq", marks: 3 },
  { label: "Case Study", key: "caseStudy", marks: 4 },
  { label: "Long Answer (LAQ)", key: "laq", marks: 5 },
];

interface PaperFormProps {
  onGenerate: (config: PaperConfig) => void;
  onCancel: () => void;
  isGenerating: boolean;
  questionBanks?: QuestionBank[]; // Injected from App
  dynamicSyllabus?: SyllabusData | null;
  initialSelectedQuestions?: Question[];
  user?: UserProfile | null;
  subscriptionConfig?: SubscriptionGlobalConfig | null;
  webResearchConfig?: WebResearchConfig | null;
}

const PaperForm: React.FC<PaperFormProps> = ({ 
  onGenerate, 
  onCancel, 
  isGenerating, 
  questionBanks = [], 
  dynamicSyllabus = null,
  initialSelectedQuestions = [],
  user = null,
  subscriptionConfig = null,
  webResearchConfig = null
}) => {
  // --- Smart School Selector State ---
  const [selectedSchool, setSelectedSchool] = useState(''); 
  const [customSchoolName, setCustomSchoolName] = useState(''); 
  const [branchName, setBranchName] = useState(''); 
  const [isCustomSchoolMode, setIsCustomSchoolMode] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  
  // Validation states
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const schoolContainerRef = useRef<HTMLDivElement>(null);

  // --- Logo Management State ---
  const [customLogo, setCustomLogo] = useState<string | null>(null); 
  const [logoPlacement, setLogoPlacement] = useState<'left' | 'center' | 'right' | ''>('');
  const [logoError, setLogoError] = useState<string | null>(null);

  // Typography State
  const [headingFont, setHeadingFont] = useState('');
  const [bodyFont, setBodyFont] = useState('');
  const [headingFontError, setHeadingFontError] = useState<string | null>(null);
  const [bodyFontError, setBodyFontError] = useState<string | null>(null);

  // General Instructions State
  const [generalInstructions, setGeneralInstructions] = useState('');
  const MAX_INSTRUCTION_CHARS = 1000;

  // Academic Session & Curriculum State
  const [academicSession, setAcademicSession] = useState(ACADEMIC_SESSIONS[0].split(' ')[0]);
  const [selectedBoard, setSelectedBoard] = useState(BOARDS[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [testType, setTestType] = useState('');
  const [testTypeError, setTestTypeError] = useState<string | null>(null);
  
  // Subject Pattern Blueprint State
  const [activePattern, setActivePattern] = useState<SubjectPaperPattern | null>(null);
  const [patternCounts, setPatternCounts] = useState<Record<string, number>>({});
  
  // Custom Test Name State
  const [customTestName, setCustomTestName] = useState('');
  const [customTestNameError, setCustomTestNameError] = useState<string | null>(null);
  
  // Chapter Selection State
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Time Allowed State
  const [timeAllowed, setTimeAllowed] = useState('');
  const [timePreset, setTimePreset] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [timeAllowedError, setTimeAllowedError] = useState<string | null>(null);

  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [totalMarksError, setTotalMarksError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>('');
  const [difficultyError, setDifficultyError] = useState<string | null>(null);
  
  // Include Figures Toggle
  const [includeFigures, setIncludeFigures] = useState(false);

  // Legacy: State for standard counts
  const [counts, setCounts] = useState<Record<keyof QuestionCounts, string>>({
    mcq: '', ar: '', vsaq: '', saq: '', laq: '', caseStudy: '',
  });

  // Custom: State for custom sections
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [customTotalMarks, setCustomTotalMarks] = useState(0);
  const [customTotalQuestions, setCustomTotalQuestions] = useState(0);

  const [errors, setErrors] = useState<Record<string, string | null>>({
    mcq: null, ar: null, vsaq: null, saq: null, laq: null, caseStudy: null,
  });

  const [currentCalculatedMarks, setCurrentCalculatedMarks] = useState<number | null>(null);

  // --- NEW: Hybrid Question Source State ---
  const [sourceTab, setSourceTab] = useState<'ai' | 'bank' | 'research' | 'url'>('ai');
  const [extractionUrl, setExtractionUrl] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showWebResearchModal, setShowWebResearchModal] = useState(false);
  const [manualQuestions, setManualQuestions] = useState<Question[]>(initialSelectedQuestions || []);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>(initialSelectedQuestions || []); // Extracted/Parsed but not yet confirmed
  const [extractedMetadata, setExtractedMetadata] = useState<{ subject?: string, topic?: string, grade?: string } | null>(null);
  
  // Filter banks by current subject/grade
  const relevantBanks = questionBanks.filter(b => b.subject === selectedSubject && b.grade === selectedClass);
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  // Prepopulate if initial selected questions provided
  useEffect(() => {
    if (initialSelectedQuestions && initialSelectedQuestions.length > 0) {
      setManualQuestions(initialSelectedQuestions);
      setPreviewQuestions(initialSelectedQuestions);
      setSourceTab('bank');
    }
  }, [initialSelectedQuestions]);

  // ----------------------------------------

  // Logic to fetch available subjects/topics based on Board -> Class
  const getBoardData = () => {
    return SYLLABUS_DATA[selectedBoard] || {};
  };

  const boardData = getBoardData();
  const classData = boardData ? boardData[selectedClass] as any : null;
  const availableSubjects = useMemo(() => {
    return classData ? Object.keys(classData) : [];
  }, [classData]);

  const getAvailableChapters = () => {
    if (!classData || !selectedSubject) return [];
    
    // Support both dynamic (SubjectData object) and static (string[]) formats
    const subjectContent = classData[selectedSubject];
    let chapters: string[] = [];
    
    if (Array.isArray(subjectContent)) {
        chapters = subjectContent;
    } else if (subjectContent && typeof subjectContent === 'object') {
        if (subjectContent.chapters) {
            chapters = subjectContent.chapters;
        } else if (subjectContent.books) {
            subjectContent.books.forEach((book: any) => {
                const prefix = book.part ? `${book.name} (${book.part})` : book.name;
                book.chapters.forEach((ch: string) => {
                    chapters.push(`[${prefix}] ${ch}`);
                });
            });
        }
    }
    return chapters;
  };

  const availableChapters = getAvailableChapters();
  
  // --- Effect: Reset Selection when Curriculum Context Changes ---
  useEffect(() => {
    // Reset subject if not in current available list
    if (selectedSubject && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject('');
    }
  }, [selectedClass, selectedBoard, availableSubjects]);

  useEffect(() => {
    // Reset chapters when subject changes
    setSelectedChapters([]);
  }, [selectedSubject, selectedClass]);

  // --- Dynamic Subject Pattern Synchronization ---
  useEffect(() => {
    if (selectedSubject && selectedClass) {
      const pattern = getSubjectPattern(selectedBoard, selectedClass, selectedSubject, academicSession);
      setActivePattern(pattern);
      
      // Initialize counts from verified pattern
      const initialCounts: Record<string, number> = {};
      pattern.sections.forEach(sec => {
        sec.questionTypes.forEach(qt => {
          initialCounts[qt.id] = qt.defaultCount;
        });
      });
      setPatternCounts(initialCounts);
      
      // Set defaults for marks, time, instructions
      setTotalMarks(pattern.totalMarks);
      setTimePreset(pattern.duration);
      setTimeAllowed(pattern.duration);
      setGeneralInstructions(pattern.generalInstructions.join('\n'));
      setTotalMarksError(null);
    } else {
      setActivePattern(null);
      setPatternCounts({});
    }
  }, [selectedBoard, selectedClass, selectedSubject, academicSession]);

  const finalDisplayChapters = availableChapters;
  const isCustomTest = testType === 'Custom Test';

  const effectiveLogo = customLogo;

  // --- Real-time Marks Calculation Effects ---
  useEffect(() => {
    if (isCustomTest) {
      const totalM = customSections.reduce((acc, sec) => acc + (sec.count * sec.marksPerQuestion), 0);
      const totalQ = customSections.reduce((acc, sec) => acc + sec.count, 0);
      setCustomTotalMarks(totalM);
      setCustomTotalQuestions(totalQ);
      setCurrentCalculatedMarks(totalM);
      return;
    }

    if (activePattern) {
      let total = 0;
      activePattern.sections.forEach(sec => {
        sec.questionTypes.forEach(qt => {
          const count = patternCounts[qt.id] !== undefined ? patternCounts[qt.id] : qt.defaultCount;
          total += count * qt.defaultMarksPerQuestion;
        });
      });
      setCurrentCalculatedMarks(total);
      return;
    }

    // Fallback standard calculation
    const total = QUESTION_SPECS.reduce((acc, spec) => {
      const val = counts[spec.key] === "" ? 0 : (parseInt(counts[spec.key]) || 0);
      return acc + (val * spec.marks);
    }, 0);
    setCurrentCalculatedMarks(total);
  }, [counts, customSections, isCustomTest, activePattern, patternCounts]);


  // --- EXTRACTION HANDLERS ---
  
  const handleUrlExtraction = async () => {
      if (!extractionUrl) return;
      setIsExtracting(true);
      setExtractionError(null);
      setPreviewQuestions([]);
      setExtractedMetadata(null);
      try {
          // Pass subject context to help parsing
          const context = `${selectedSubject} ${selectedClass} ${selectedBoard}`;
          const { questions, metadata } = await extractQuestionsFromUrl(extractionUrl, context);
          setPreviewQuestions(questions);
          setExtractedMetadata(metadata);
      } catch (e: any) {
          if (e.message === "EXTRACTION_BLOCKED") {
              setExtractionError("This website blocks automated reading. Please paste the content manually below.");
          } else {
              setExtractionError("Extraction failed. The link might be broken or private. Try pasting the text instead.");
          }
      } finally {
          setIsExtracting(false);
      }
  };

  const handleTextParse = async () => {
      if (!pasteText.trim()) return;
      setIsExtracting(true);
      setExtractionError(null);
      setPreviewQuestions([]);
      setExtractedMetadata(null);
      try {
          const context = `${selectedSubject} ${selectedClass} ${selectedBoard}`;
          const { questions, metadata } = await parseQuestionsFromText(pasteText, context);
          setPreviewQuestions(questions);
          setExtractedMetadata(metadata);
      } catch (e) {
          setExtractionError("Could not parse text. Please check the content.");
      } finally {
          setIsExtracting(false);
      }
  };

  const handleBankSelection = async (bankId: string) => {
      setSelectedBankId(bankId);
      const bank = relevantBanks.find(b => b.id === bankId);
      if (bank) {
          setIsExtracting(true);
          setPreviewQuestions([]);
          setExtractedMetadata(null);
          try {
              // If structured questions exist, use them directly without LLM re-parsing
              if (bank.questions && bank.questions.length > 0) {
                  const runtimeQs = bank.questions.map(convertToRuntimeQuestion);
                  setPreviewQuestions(runtimeQs);
                  setExtractedMetadata({
                      subject: bank.subject,
                      grade: bank.grade,
                      topic: `${bank.questions.length} Structured Items`
                  });
              } else {
                  // Fallback for legacy raw markdown bank
                  const { questions, metadata } = await parseQuestionsFromText(bank.content, selectedSubject);
                  setPreviewQuestions(questions);
                  setExtractedMetadata(metadata);
              }
          } catch(e) {
              console.error(e);
          } finally {
              setIsExtracting(false);
          }
      } else {
          setPreviewQuestions([]);
          setExtractedMetadata(null);
      }
  };

  const toggleManualQuestion = (question: Question) => {
      setManualQuestions(prev => {
          const exists = prev.find(q => q.question_id === question.question_id);
          if (exists) {
              return prev.filter(q => q.question_id !== question.question_id);
          } else {
              return [...prev, question];
          }
      });
  };

  const handleDeletePreviewQuestion = (id: string) => {
      setPreviewQuestions(prev => prev.filter(q => q.question_id !== id));
      setManualQuestions(prev => prev.filter(q => q.question_id !== id));
  };

  const handleEditPreviewQuestion = (id: string, newText: string) => {
      setPreviewQuestions(prev => prev.map(q => q.question_id === id ? { ...q, question_text: newText } : q));
      setManualQuestions(prev => prev.map(q => q.question_id === id ? { ...q, question_text: newText } : q));
  };

  const manualQuestionsMarks = manualQuestions.reduce((sum, q) => sum + q.marks, 0);

  // ---------------------------

  const validateField = (key: keyof QuestionCounts, value: string) => {
    if (value === '') return null; // Empty counts are treated as 0
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return 'Invalid';
    return null;
  };

  const handleSchoolSelect = (school: string) => {
    if (school === "Other School (Custom Name)") {
        setIsCustomSchoolMode(true);
        setSelectedSchool('');
        setSchoolSearch('');
    } else {
        setSelectedSchool(school);
        setSchoolSearch(school);
        setIsCustomSchoolMode(false);
    }
    setIsSchoolDropdownOpen(false);
    setSchoolError(null);
  };

  const handleBackToSchoolList = () => {
      setIsCustomSchoolMode(false);
      setCustomSchoolName('');
      setSchoolSearch('');
      setSelectedSchool('');
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTimePreset(val);
    if (val === 'Custom') {
        setTimeAllowed(customTime);
    } else {
        setTimeAllowed(val);
        setTimeAllowedError(null);
    }
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setCustomTime(val);
      if (timePreset === 'Custom') {
        setTimeAllowed(val);
        if (val.trim() !== '') setTimeAllowedError(null);
      }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("File size exceeds 2MB limit.");
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setLogoError("Only PNG and JPG formats are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCustomLogo(null);
    setLogoError(null);
    const input = document.getElementById('logo-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleCountChange = (key: keyof QuestionCounts, value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setCounts(prev => ({ ...prev, [key]: value }));
    if (value !== '') setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handlePatternCountChange = (qtId: string, value: string) => {
    const num = parseInt(value);
    const validCount = isNaN(num) || num < 0 ? 0 : num;
    setPatternCounts(prev => ({
      ...prev,
      [qtId]: validCount
    }));
  };

  const handleResetToOfficialPattern = () => {
    if (!activePattern) return;
    const initialCounts: Record<string, number> = {};
    activePattern.sections.forEach(sec => {
      sec.questionTypes.forEach(qt => {
        initialCounts[qt.id] = qt.defaultCount;
      });
    });
    setPatternCounts(initialCounts);
    setTotalMarks(activePattern.totalMarks);
    setTimePreset(activePattern.duration);
    setTimeAllowed(activePattern.duration);
    setGeneralInstructions(activePattern.generalInstructions.join('\n'));
    setTotalMarksError(null);
  };

  const handleAutoDistributePattern = () => {
    if (!activePattern || totalMarks <= 0) return;
    const allTypes: { id: string; marks: number }[] = [];
    activePattern.sections.forEach(sec => {
      sec.questionTypes.forEach(qt => {
        allTypes.push({ id: qt.id, marks: qt.defaultMarksPerQuestion });
      });
    });
    if (allTypes.length === 0) return;

    const newCounts: Record<string, number> = {};
    allTypes.forEach(t => { newCounts[t.id] = 0; });
    let currentSum = 0;

    for (const t of allTypes) {
      if (currentSum + t.marks <= totalMarks) {
        newCounts[t.id]++;
        currentSum += t.marks;
      }
    }

    while (currentSum < totalMarks) {
      const candidates = allTypes.filter(t => currentSum + t.marks <= totalMarks);
      if (candidates.length === 0) break;
      candidates.sort((a, b) => newCounts[a.id] - newCounts[b.id]);
      const best = candidates[0];
      newCounts[best.id]++;
      currentSum += best.marks;
    }

    setPatternCounts(newCounts);
  };

  const handleBlur = (key: keyof QuestionCounts) => {
    if (counts[key] === '') {
        setCounts(prev => ({ ...prev, [key]: '0' }));
    }
    const error = validateField(key, counts[key]);
    setErrors(prev => ({ ...prev, [key]: error }));
  };

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBoard(e.target.value);
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedChapters([]);
    setActivePattern(null);
    setTotalMarks(0);
    setTimePreset('');
    setTimeAllowed('');
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedSubject('');
    setSelectedChapters([]);
    setActivePattern(null);
    setTotalMarks(0);
    setTimePreset('');
    setTimeAllowed('');
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
    setSelectedChapters([]);
    setChapterError(null);
    setSelectedBankId('');
    setPreviewQuestions([]);
    setManualQuestions([]);
  };

  const handleTestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setTestType(e.target.value);
      setTestTypeError(null);
      setCustomTestNameError(null);
  };

  const handleCustomTestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomTestName(e.target.value);
      if (e.target.value.trim().length >= 3) setCustomTestNameError(null);
  };

  const handleResetForm = () => {
    setSelectedSchool('');
    setCustomSchoolName('');
    setBranchName('');
    setIsCustomSchoolMode(false);
    setSchoolSearch('');
    setSchoolError(null);
    setBranchError(null);
    setCustomLogo(null);
    setLogoPlacement('');
    setLogoError(null);
    setHeadingFont('');
    setBodyFont('');
    setHeadingFontError(null);
    setBodyFontError(null);
    setGeneralInstructions('');
    setSelectedBoard(BOARDS[0]);
    setSelectedClass('');
    setSelectedSubject('');
    setTestType('');
    setTestTypeError(null);
    setCustomTestName('');
    setCustomTestNameError(null);
    setSelectedChapters([]);
    setChapterError(null);
    setTimeAllowed('');
    setTimePreset('');
    setCustomTime('');
    setTimeAllowedError(null);
    setTotalMarks(0);
    setTotalMarksError(null);
    setDifficulty('');
    setDifficultyError(null);
    setIncludeFigures(false);
    setCounts({ mcq: '', ar: '', vsaq: '', saq: '', laq: '', caseStudy: '' });
    setCustomSections([]);
    setCustomTotalMarks(0);
    setCustomTotalQuestions(0);
    setErrors({ mcq: null, ar: null, vsaq: null, saq: null, laq: null, caseStudy: null });
    setCurrentCalculatedMarks(null);
    setSourceTab('ai');
    setExtractionUrl('');
    setPasteText('');
    setExtractionError(null);
    setManualQuestions([]);
    setPreviewQuestions([]);
    setExtractedMetadata(null);
    setSelectedBankId('');
    setActivePattern(null);
    setPatternCounts({});
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedChapters([...finalDisplayChapters]);
        setChapterError(null);
    } else {
        setSelectedChapters([]);
    }
  };

  const handleChapterToggle = (chapter: string) => {
    setSelectedChapters(prev => {
        const newSelection = prev.includes(chapter)
            ? prev.filter(c => c !== chapter)
            : [...prev, chapter];
        if (newSelection.length > 0) setChapterError(null);
        return newSelection;
    });
  };

  const isAllSelected = finalDisplayChapters.length > 0 && selectedChapters.length === finalDisplayChapters.length;
  const isIndeterminate = selectedChapters.length > 0 && selectedChapters.length < finalDisplayChapters.length;

  const handleAutoDistribute = () => {
    if (activePattern) {
      handleAutoDistributePattern();
      return;
    }
    let newCounts: Record<keyof QuestionCounts, number> = { mcq: 0, ar: 0, vsaq: 0, saq: 0, laq: 0, caseStudy: 0 };
    let currentSum = 0;
    for (const spec of QUESTION_SPECS) {
        if (currentSum + spec.marks <= totalMarks) {
            newCounts[spec.key]++;
            currentSum += spec.marks;
        }
    }
    while (currentSum < totalMarks) {
        const candidates = QUESTION_SPECS.filter(spec => currentSum + spec.marks <= totalMarks);
        if (candidates.length === 0) break;
        candidates.sort((a, b) => newCounts[a.key] - newCounts[b.key]);
        const bestSpec = candidates[0];
        newCounts[bestSpec.key]++;
        currentSum += bestSpec.marks;
    }
    const stringCounts: any = {};
    QUESTION_SPECS.forEach(spec => {
        stringCounts[spec.key] = newCounts[spec.key].toString();
    });
    setCounts(stringCounts);
    setErrors({ mcq: null, ar: null, vsaq: null, saq: null, laq: null, caseStudy: null });
  };

  // Custom Section Logic
  const handleAddSection = () => {
    const newSection: CustomSection = {
        id: crypto.randomUUID(),
        title: `Section ${String.fromCharCode(65 + customSections.length)}`,
        type: 'Multiple Choice Question (MCQ)',
        count: 5,
        marksPerQuestion: 1
    };
    setCustomSections([...customSections, newSection]);
  };

  const handleRemoveSection = (id: string) => {
    setCustomSections(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSection = (id: string, field: keyof CustomSection, value: any) => {
    setCustomSections(prev => prev.map(s => {
        if (s.id === id) return { ...s, [field]: value };
        return s;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErrors = false;
    const effectiveSchoolName = isCustomSchoolMode ? customSchoolName.trim() : selectedSchool.trim();
    
    if (!effectiveSchoolName) { setSchoolError("Please select a school"); hasErrors = true; }
    if (!branchName.trim()) { setBranchError("Please enter branch or location"); hasErrors = true; }
    const finalSchoolNameString = `${effectiveSchoolName}, ${branchName.trim()}`;
    if (hasErrors && schoolContainerRef.current) schoolContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    if (!headingFont) {
      setHeadingFontError("Please select heading font.");
      hasErrors = true;
    }

    if (!bodyFont) {
      setBodyFontError("Please select body font.");
      hasErrors = true;
    }

    if (!testType || !testType.trim()) {
      setTestTypeError("Please select test type.");
      hasErrors = true;
    }

    if (!difficulty) {
      setDifficultyError("Please select difficulty.");
      hasErrors = true;
    }

    if (!totalMarks || totalMarks === 0) {
        setTotalMarksError('Please select total marks.');
        hasErrors = true;
    }

    if (timeAllowed.trim() === '') { 
      setTimeAllowedError('Please select time allowed.'); 
      hasErrors = true; 
    } else if (!/\d/.test(timeAllowed)) { 
      setTimeAllowedError('Must contain number'); 
      hasErrors = true; 
    }
    
    if (selectedChapters.length === 0) { setChapterError("Please select at least one chapter."); hasErrors = true; }

    const newErrors: any = {};
    if (isCustomTest) {
        if (!customTestName.trim()) { setCustomTestNameError("Please enter a name."); hasErrors = true; }
        else if (customTestName.trim().length < 3) { setCustomTestNameError("Test name must be at least 3 characters."); hasErrors = true; }
        if (customSections.length === 0) { hasErrors = true; alert("Please add at least one section."); }
        if (currentCalculatedMarks !== totalMarks) hasErrors = true;
    } else if (!activePattern) {
        QUESTION_SPECS.forEach(spec => {
            const error = validateField(spec.key, counts[spec.key]);
            if (error) { hasErrors = true; newErrors[spec.key] = error; }
        });
    }

    if (currentCalculatedMarks !== null && currentCalculatedMarks !== totalMarks) {
      setTotalMarksError(`Allocated marks (${currentCalculatedMarks}) do not match Total Marks (${totalMarks}). Please click Auto Distribute or adjust question counts.`);
      hasErrors = true;
    }

    if (hasErrors) { setErrors(newErrors); return; }
    
    let finalCounts: any = {};
    if (!isCustomTest && !activePattern) {
        QUESTION_SPECS.forEach(spec => { 
            const val = counts[spec.key];
            finalCounts[spec.key] = val === "" ? 0 : (parseInt(val) || 0); 
        });
    }
    
    const chaptersString = selectedChapters.join(', ');
    const finalSubjectString = `${selectedSubject} (Chapters: ${chaptersString})`;
    const finalTestType = isCustomTest ? customTestName.trim() : testType;
    
    onGenerate({
      board: selectedBoard,
      schoolName: finalSchoolNameString,
      schoolLogo: effectiveLogo || "",
      logoPlacement: (logoPlacement as any) || "center",
      headingFont: headingFont || FONT_OPTIONS[0].value,
      bodyFont: bodyFont || FONT_OPTIONS[1].value,
      generalInstructions: generalInstructions.trim() || "",
      subject: finalSubjectString,
      grade: selectedClass,
      timeAllowed: timeAllowed.trim(),
      totalMarks,
      difficulty: (difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
      testType: finalTestType,
      customSections: isCustomTest ? customSections : [],
      counts: finalCounts as QuestionCounts,
      includeFigures,
      manualQuestions: manualQuestions || [],
      academicSession,
      subjectPattern: activePattern || undefined,
      patternCounts
    });
  };

  const filteredSchools = PRESET_SCHOOLS.filter(school => school.toLowerCase().includes(schoolSearch.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-100/50 bg-white/40">
            <h2 className="text-2xl font-bold text-gray-800">Configure Paper</h2>
            <p className="text-gray-500 text-sm mt-1">Define the parameters for your AI-generated assessment.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-12">
          
          {/* STEP 1: BRANDING */}
          <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8A2CB0] to-transparent rounded-full opacity-50"></div>
              <h3 className="text-lg font-bold text-[#3C128D] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8A2CB0] text-white flex items-center justify-center text-xs">1</span>
                  Branding & Header
              </h3>
              
              <div className="bg-white/50 p-6 rounded-xl border border-white/60 space-y-6 shadow-sm">
                 
                 {/* School Name & Branch */}
                 <div ref={schoolContainerRef} className="relative">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">School Name <span className="text-red-500">*</span></label>
                            {!isCustomSchoolMode ? (
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-3 rounded-lg border bg-white/80 focus:ring-2 outline-none transition-all text-gray-900 placeholder:text-gray-400 ${schoolError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-[#8A2CB0] focus:border-[#8A2CB0]'}`}
                                        placeholder="Select School..."
                                        value={schoolSearch}
                                        onChange={(e) => { setSchoolSearch(e.target.value); setIsSchoolDropdownOpen(true); }}
                                        onFocus={() => { setIsSchoolDropdownOpen(true); setSchoolSearch(''); }}
                                        onBlur={() => { setTimeout(() => setIsSchoolDropdownOpen(false), 200); }}
                                        autoComplete="off"
                                    />
                                    {isSchoolDropdownOpen && filteredSchools.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in text-white">
                                            {filteredSchools.map((school, index) => (
                                                <div key={index} onClick={() => handleSchoolSelect(school)} className="px-4 py-3 cursor-pointer text-sm font-medium hover:bg-slate-800 hover:text-[#EEA727]">
                                                    {school}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {schoolError && <p className="text-red-600 text-xs font-bold mt-1.5 animate-pulse">{schoolError}</p>}
                                </div>
                            ) : (
                                <div className="relative">
                                    <input type="text" className="w-full px-4 py-3 rounded-lg border bg-white/80 focus:ring-2 outline-none" placeholder="Enter School Name" value={customSchoolName} onChange={(e) => { setCustomSchoolName(e.target.value); if(e.target.value) setSchoolError(null); }} autoFocus />
                                    <button type="button" onClick={handleBackToSchoolList} className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-red-500">Back</button>
                                    {schoolError && <p className="text-red-600 text-xs font-bold mt-1.5 animate-pulse">{schoolError}</p>}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Branch / Campus <span className="text-red-500">*</span></label>
                            <input type="text" className={`w-full px-4 py-3 rounded-lg border bg-white/80 focus:ring-2 outline-none ${branchError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'}`} placeholder="e.g. Budawada, Hyderabad" value={branchName} onChange={(e) => { setBranchName(e.target.value); if(e.target.value) setBranchError(null); }} />
                            {branchError && <p className="text-red-600 text-xs font-bold mt-1.5 animate-pulse">{branchError}</p>}
                        </div>
                    </div>
                 </div>

                  {/* Logo & Styling */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            School Logo (Optional)
                        </label>
                        <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${logoError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white/60'}`}>
                            {effectiveLogo ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 border rounded bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                        <img 
                                            src={effectiveLogo} 
                                            className="w-full h-full object-contain" 
                                        />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">Custom Logo</p>
                                        <div className="flex gap-3">
                                            <label className="text-xs font-bold text-[#8A2CB0] cursor-pointer hover:underline">
                                                Change
                                                <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                            </label>
                                            <button type="button" onClick={handleRemoveLogo} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <input type="file" id="logo-upload" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div className="text-gray-400 text-sm font-medium">Upload Logo Manually</div>
                                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                                </div>
                            )}
                        </div>
                        {logoError && (
                            <div className="flex items-center gap-1 mt-1.5">
                                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <p className="text-red-600 text-xs font-bold">{logoError}</p>
                            </div>
                        )}
                    </div>
                    <div>
                         <label className="block text-sm font-bold mb-2 text-gray-700">Logo Placement</label>
                         <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                             {[{ id: 'left', label: 'Left' }, { id: 'center', label: 'Center' }, { id: 'right', label: 'Right' }].map((opt) => (
                                 <label key={opt.id} className={`flex-1 min-w-[80px] py-3 rounded-lg border text-center text-sm font-semibold cursor-pointer transition-all ${logoPlacement === opt.id ? 'bg-[#f3e8ff] border-[#8A2CB0] text-[#3C128D] shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}>
                                     <input type="radio" name="logoPlacement" value={opt.id} checked={logoPlacement === opt.id} onChange={(e) => setLogoPlacement(e.target.value as any)} className="hidden" />
                                     {opt.label}
                                 </label>
                             ))}
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-gray-500 mb-1">Heading Font <span className="text-red-500">*</span></label>
                                 <select 
                                     className={`w-full px-2 py-2.5 rounded border text-sm dark-dropdown ${headingFontError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                                     value={headingFont} 
                                     onChange={(e) => {
                                         setHeadingFont(e.target.value);
                                         if (e.target.value) setHeadingFontError(null);
                                     }}
                                 >
                                     <option value="" disabled>Select heading font</option>
                                     {FONT_OPTIONS.map((font) => (<option key={font.value} value={font.value}>{font.label}</option>))}
                                 </select>
                                 {headingFontError && <p className="text-red-600 text-[10px] font-bold mt-1">{headingFontError}</p>}
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-gray-500 mb-1">Body Font <span className="text-red-500">*</span></label>
                                 <select 
                                     className={`w-full px-2 py-2.5 rounded border text-sm dark-dropdown ${bodyFontError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                                     value={bodyFont} 
                                     onChange={(e) => {
                                         setBodyFont(e.target.value);
                                         if (e.target.value) setBodyFontError(null);
                                     }}
                                 >
                                     <option value="" disabled>Select body font</option>
                                     {FONT_OPTIONS.map((font) => (<option key={font.value} value={font.value}>{font.label}</option>))}
                                 </select>
                                 {bodyFontError && <p className="text-red-600 text-[10px] font-bold mt-1">{bodyFontError}</p>}
                             </div>
                         </div>
                    </div>
                 </div>
              </div>
          </div>

          {/* STEP 2: SPECS */}
          <div className="relative">
             <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8A2CB0] to-transparent rounded-full opacity-50"></div>
             <h3 className="text-lg font-bold text-[#3C128D] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8A2CB0] text-white flex items-center justify-center text-xs">2</span>
                  Paper Specifications
              </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Session</label>
                  <select 
                    required 
                    className="w-full px-4 py-2.5 rounded-lg border dark-dropdown" 
                    value={academicSession} 
                    onChange={(e) => setAcademicSession(e.target.value)}
                  >
                    {ACADEMIC_SESSIONS.map((session) => {
                      const val = session.split(' ')[0];
                      return <option key={val} value={val}>{session}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Board / Curriculum</label>
                  <select required className="w-full px-4 py-2.5 rounded-lg border dark-dropdown" value={selectedBoard} onChange={handleBoardChange}>
                    {BOARDS.map((board) => (<option key={board} value={board}>{board}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                  <select required className="w-full px-4 py-2.5 rounded-lg border dark-dropdown" value={selectedClass} onChange={handleClassChange}>
                    <option value="" disabled>Select Class</option>
                    {GRADES.map((grade) => (<option key={grade} value={grade}>{grade}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject / Language</label>
                  <select required disabled={!selectedClass} className="w-full px-4 py-2.5 rounded-lg border dark-dropdown disabled:opacity-50" value={selectedSubject} onChange={handleSubjectChange}>
                    <option value="" disabled>{!selectedClass ? 'Select Class first' : 'Select Subject'}</option>
                    {availableSubjects.map((subj) => (<option key={subj} value={subj}>{subj}</option>))}
                  </select>
                </div>

                {/* Chapter Selection */}
                {selectedSubject && availableChapters.length > 0 && (
                   <div className="md:col-span-2 bg-white/50 p-6 rounded-xl border border-white/60 text-center">
                      <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-bold text-gray-700">Chapter Selection <span className="text-red-500">*</span></label>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" checked={isAllSelected} ref={input => { if (input) input.indeterminate = isIndeterminate; }} onChange={handleSelectAll} className="w-4 h-4 text-[#8A2CB0]" />
                              <span className="text-sm font-semibold text-[#8A2CB0]">Select All</span>
                          </label>
                      </div>
                      <div className="max-h-64 overflow-y-auto pr-2 border border-gray-200 rounded-lg bg-white">
                          {finalDisplayChapters.map((chapter, index) => (
                              <label key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b last:border-0 border-gray-100 cursor-pointer">
                                  <input type="checkbox" checked={selectedChapters.includes(chapter)} onChange={() => handleChapterToggle(chapter)} className="mt-1 w-4 h-4 text-[#8A2CB0]" />
                                  <span className="text-sm text-gray-700">{chapter}</span>
                              </label>
                          ))}
                      </div>
                      {chapterError && <p className="text-red-600 text-sm font-bold mt-2">{chapterError}</p>}
                   </div>
                )}

                {selectedSubject && availableChapters.length === 0 && (
                  <div className="md:col-span-2 bg-red-50 p-6 rounded-xl border border-red-200 text-center">
                    <p className="text-red-600 font-bold italic">⚠️ No syllabus loaded for this subject.</p>
                    <p className="text-red-400 text-xs mt-1">Please wait for update or contact admin.</p>
                  </div>
                )}
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Test Type <span className="text-red-500">*</span></label>
                    <select 
                        className={`w-full px-4 py-2.5 rounded-lg border dark-dropdown ${testTypeError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        value={testType} 
                        onChange={handleTestTypeChange}
                    >
                        <option value="" disabled>Select test type</option>
                        {TEST_TYPES.map((type) => (<option key={type} value={type} disabled={type === "CBSE Board Exam" && selectedClass !== "Class 10"}>{type}{type === "CBSE Board Exam" && selectedClass !== "Class 10" ? " (Class 10 Only)" : ""}</option>))}
                    </select>
                    {testTypeError && <p className="text-red-600 text-xs font-bold mt-1.5">{testTypeError}</p>}
                    {isCustomTest && (
                        <div className="mt-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Custom Test Name <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-200" placeholder="e.g. Unit Test 3" value={customTestName} onChange={handleCustomTestNameChange} />
                            {customTestNameError && <p className="text-red-600 text-xs font-bold mt-1.5">{customTestNameError}</p>}
                        </div>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty <span className="text-red-500">*</span></label>
                  <select 
                    className={`w-full px-4 py-2.5 rounded-lg border dark-dropdown ${difficultyError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                    value={difficulty} 
                    onChange={(e) => {
                      setDifficulty(e.target.value as any);
                      if (e.target.value) setDifficultyError(null);
                    }}
                  >
                    <option value="" disabled>Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {difficultyError && <p className="text-red-600 text-xs font-bold mt-1.5">{difficultyError}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks <span className="text-red-500">*</span></label>
                    <select 
                        className={`w-full px-4 py-2.5 rounded-lg border dark-dropdown ${totalMarksError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                        value={totalMarks || ''} 
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setTotalMarks(val);
                            if (val > 0) setTotalMarksError(null);
                        }} 
                    >
                        <option value="" disabled>Select total marks</option>
                        {[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map(m => (
                            <option key={m} value={m}>{m} Marks</option>
                        ))}
                    </select>
                    {totalMarksError && <p className="text-red-600 text-xs font-bold mt-1.5">{totalMarksError}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Allowed <span className="text-red-500">*</span></label>
                    <div className="flex gap-4">
                         <div className="relative w-full md:w-1/2">
                            <select 
                                value={timePreset} 
                                onChange={handlePresetChange} 
                                className={`w-full px-4 py-2.5 rounded-lg border dark-dropdown disabled:opacity-50 ${timeAllowedError && timePreset !== 'Custom' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            >
                                <option value="" disabled>Select time allowed</option>
                                <option value="30 Minutes">30 Minutes</option>
                                <option value="40 Minutes">40 Minutes</option>
                                <option value="45 Minutes">45 Minutes</option>
                                <option value="1 Hour">1 Hour</option>
                                <option value="1.5 Hours">1.5 Hours</option>
                                <option value="2 Hours">2 Hours</option>
                                <option value="2.5 Hours">2.5 Hours</option>
                                <option value="3 Hours">3 Hours</option>
                                <option value="Custom">Custom</option>
                            </select>
                         </div>
                         {timePreset === 'Custom' && (
                            <input 
                                type="text" 
                                className={`w-full md:w-1/2 px-4 py-2.5 rounded-lg border ${timeAllowedError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                                placeholder="e.g. 90 Minutes" 
                                value={customTime} 
                                onChange={handleCustomTimeChange} 
                            />
                         )}
                    </div>
                    {timeAllowedError && <p className="text-red-600 text-sm font-bold mt-1.5">{timeAllowedError}</p>}
                </div>
                
                 <div className="md:col-span-2">
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition-colors cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-[#8A2CB0]" checked={includeFigures} onChange={(e) => setIncludeFigures(e.target.checked)} />
                        <div><span className="block text-sm font-bold text-gray-900">Include Figures & Diagrams</span><span className="block text-xs text-gray-500">Useful for Science, Geography etc. (Math diagrams are auto-included)</span></div>
                    </label>
                 </div>
             </div>
          </div>
          
          {/* STEP 3: QUESTION SOURCES (HYBRID MODE) */}
          <div className="relative">
             <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8A2CB0] to-transparent rounded-full opacity-50"></div>
             <h3 className="text-lg font-bold text-[#3C128D] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8A2CB0] text-white flex items-center justify-center text-xs">3</span>
                  Question Sources
             </h3>
             
             <div className="bg-white/80 p-6 rounded-xl border border-[#8A2CB0]/30 shadow-lg relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8A2CB0]/5 rounded-bl-full pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 relative z-10">
                     <div className="text-center sm:text-left">
                        <h4 className="font-bold text-gray-800">Source Mode</h4>
                        <p className="text-xs text-gray-500">Select where examination questions should originate from</p>
                     </div>
                     <div className="flex flex-wrap sm:flex-nowrap bg-gray-100 p-1 rounded-xl w-full sm:w-auto justify-center gap-1">
                         {[
                           { id: 'ai', label: 'AI Auto-Gen', icon: Sparkles },
                           { id: 'bank', label: 'Question Bank', icon: Database },
                           { id: 'research', label: 'Web Research', icon: Globe },
                           { id: 'url', label: 'URL / Text', icon: LinkIcon },
                         ].map(tab => {
                           const Icon = tab.icon;
                           return (
                             <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSourceTab(tab.id as any)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 justify-center cursor-pointer ${
                                  sourceTab === tab.id 
                                    ? 'bg-white shadow-xs text-[#8A2CB0] ring-1 ring-black/5 font-black' 
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                             >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                             </button>
                           );
                         })}
                     </div>
                  </div>
                  
                  <div className="relative z-10 min-h-[120px]">
                    {sourceTab === 'ai' && (
                        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h5 className="font-bold text-indigo-900 text-sm">Automatic Curriculum Generation</h5>
                                <p className="text-xs text-indigo-700 mt-0.5">
                                    The AI will generate questions strictly mapped to the syllabus, board, and question count specs chosen above.
                                </p>
                            </div>
                        </div>
                    )}

                    {sourceTab === 'bank' && (
                        <div className="space-y-4 animate-fade-in">
                            {!selectedSubject ? (
                                <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">⚠ Please select a subject in Step 2 first.</p>
                            ) : relevantBanks.length === 0 ? (
                                <p className="text-gray-500 text-xs italic p-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                    No question banks found for {selectedSubject} ({selectedClass}). 
                                    <br/><span className="text-[11px] text-purple-600 font-semibold">Open Question Bank in Dashboard to create or import one.</span>
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Choose Saved Question Bank</label>
                                    <select 
                                        value={selectedBankId} 
                                        onChange={(e) => handleBankSelection(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark-dropdown text-xs font-semibold"
                                    >
                                        <option value="">-- Choose a Question Bank --</option>
                                        {relevantBanks.map(b => (
                                            <option key={b.id} value={b.id}>
                                              {b.subject} ({b.grade}) - {b.questions?.length ? `${b.questions.length} Questions` : 'Document Bank'} - {new Date(b.lastUpdated).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {sourceTab === 'research' && (
                        <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-3 animate-fade-in">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-xs sm:text-sm">
                                          Intelligent Web Research & Grounding
                                        </h5>
                                        <p className="text-[11px] text-gray-500">
                                          Search NCERT, CBSE, and educational portals using real-time Google Grounding.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowWebResearchModal(true)}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>Launch Research Engine</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {sourceTab === 'url' && (
                        <div className="space-y-3 animate-fade-in">
                            <p className="text-xs text-gray-500">
                              Extract questions from educational web pages or paste raw document text.
                            </p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={extractionUrl}
                                    onChange={(e) => setExtractionUrl(e.target.value)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#8A2CB0] outline-none"
                                    placeholder="https://example.com/class-10-sample-questions"
                                />
                                <button 
                                    type="button" 
                                    onClick={handleUrlExtraction}
                                    disabled={isExtracting || !extractionUrl}
                                    className="px-5 py-2.5 rounded-xl bg-[#8A2CB0] hover:bg-[#722393] text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    {isExtracting ? 'Scanning...' : 'Extract URL'}
                                </button>
                            </div>
                            
                            {extractionError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-start gap-2 animate-fade-in">
                                    <span className="shrink-0">⚠️</span>
                                    <span>{extractionError}</span>
                                </div>
                            )}

                            {/* Manual Paste Fallback */}
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-[10px] text-gray-400 uppercase font-black tracking-wider">OR Paste Document Text</span>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea 
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#8A2CB0] outline-none min-h-[90px]"
                                    placeholder="Paste questions or curriculum content here..."
                                    value={pasteText}
                                    onChange={(e) => setPasteText(e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleTextParse}
                                    disabled={isExtracting || !pasteText.trim()}
                                    className="absolute bottom-2.5 right-2.5 px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-black text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    {isExtracting ? 'Parsing...' : 'Parse Text'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PREVIEW AREA */}
                    {(sourceTab !== 'ai' && previewQuestions.length > 0) && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            {extractedMetadata && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg animate-fade-in">
                                    <h5 className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center gap-2">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Content Identified
                                    </h5>
                                    <div className="flex flex-wrap gap-4 text-xs">
                                        {extractedMetadata.subject && <div><span className="text-gray-500">Subject:</span> <span className="font-bold text-gray-800">{extractedMetadata.subject}</span></div>}
                                        {extractedMetadata.topic && <div><span className="text-gray-500">Topic:</span> <span className="font-bold text-gray-800">{extractedMetadata.topic}</span></div>}
                                        {extractedMetadata.grade && <div><span className="text-gray-500">Level:</span> <span className="font-bold text-gray-800">{extractedMetadata.grade}</span></div>}
                                    </div>
                                </div>
                            )}

                            <h4 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
                                <span>Generated Questions</span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{previewQuestions.length} Available</span>
                            </h4>
                            <div className="max-h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {previewQuestions.map((q, idx) => {
                                    const isSelected = manualQuestions.some(mq => mq.question_id === q.question_id);
                                    return (
                                        <div key={idx} className={`p-3 rounded-lg border transition-all ${isSelected ? 'bg-[#f3e8ff] border-[#8A2CB0] shadow-sm' : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300'}`}>
                                            <div className="flex gap-3 items-start mb-2">
                                                <div onClick={() => toggleManualQuestion(q)} className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${isSelected ? 'bg-[#8A2CB0] border-[#8A2CB0]' : 'bg-white border-gray-300'}`}>
                                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase bg-white px-1.5 py-0.5 rounded border border-gray-100">{q.answer_type}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-500">{q.marks}M</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleDeletePreviewQuestion(q.question_id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <textarea 
                                                        className="w-full bg-transparent text-sm text-gray-800 border-none focus:ring-0 p-0 resize-none min-h-[40px]"
                                                        value={q.question_text}
                                                        onChange={(e) => handleEditPreviewQuestion(q.question_id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            {q.options && q.options.length > 0 && (
                                                <div className="ml-8 grid grid-cols-2 gap-2 mt-2">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="text-[11px] text-gray-600 bg-white/50 px-2 py-1 rounded border border-gray-100 truncate">
                                                            {String.fromCharCode(65 + oIdx)}. {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                 </div>
                 
                 {/* Selection Summary Footer */}
                 {manualQuestions.length > 0 && (
                     <div className="mt-4 -mb-2 -mx-2 p-3 bg-[#3C128D] text-white rounded-lg flex justify-between items-center shadow-lg transform translate-y-2">
                         <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <span className="font-bold text-sm block">{manualQuestions.length} Manual Questions Locked</span>
                                <span className="text-[10px] text-white/80 block">Total: {manualQuestionsMarks} Marks | AI will generate remaining {Math.max(0, totalMarks - manualQuestionsMarks)} marks</span>
                            </div>
                         </div>
                         <button type="button" onClick={() => setManualQuestions([])} className="text-xs text-white/70 hover:text-white font-bold hover:underline px-3">Clear Selection</button>
                     </div>
                 )}
             </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-white/50 p-6 rounded-xl border border-white/60">
             <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">General Instructions</label>
                <span className="text-xs text-gray-400">Optional</span>
             </div>
             <textarea className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 transition-all h-24 resize-y text-sm" placeholder="Enter general instructions..." value={generalInstructions} onChange={(e) => { if (e.target.value.length <= MAX_INSTRUCTION_CHARS) setGeneralInstructions(e.target.value); }} />
          </div>

          <hr className="border-gray-200/50" />

          {/* Table / Custom Builder / Dynamic Subject Pattern */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {isCustomTest ? 'Custom Format Builder' : activePattern ? `${selectedSubject} Blueprint & Distribution` : 'Question Distribution'}
                </h3>
                {currentCalculatedMarks !== null && (
                  <div className="flex items-center gap-2">
                    {!isCustomTest && !activePattern && (
                      <button
                        type="button"
                        onClick={handleAutoDistribute}
                        disabled={!totalMarks || totalMarks <= 0}
                        className="px-3 py-1.5 bg-[#8A2CB0] hover:bg-[#732494] text-white rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm disabled:opacity-50"
                        title="Auto distribute question counts to match total marks"
                      >
                        Auto Distribute
                      </button>
                    )}
                    <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${currentCalculatedMarks === totalMarks ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                      Allocated: {currentCalculatedMarks} / {totalMarks || 0} Marks
                    </span>
                  </div>
                )}
            </div>
            
            {isCustomTest ? (
                <div className="space-y-4 animate-fade-in">
                    {customSections.length === 0 && <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white/30 text-gray-500"><p>No sections added yet. Click "Add Section" to design your test.</p></div>}
                    {customSections.map((section, index) => (
                        <div key={section.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 relative group transition-all hover:shadow-md">
                            <div className="absolute top-2 right-2"><button type="button" onClick={() => handleRemoveSection(section.id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete Section"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-3"><label className="block text-xs font-bold text-gray-500 mb-1">Section Title</label><input type="text" value={section.title} onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#8A2CB0] outline-none" placeholder="e.g. Section A" /></div>
                                <div className="md:col-span-4"><label className="block text-xs font-bold text-gray-500 mb-1">Question Type</label><select value={section.type} onChange={(e) => handleUpdateSection(section.id, 'type', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#8A2CB0] outline-none">{QUESTION_TYPES_DROPDOWN.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}</select></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">Count</label><input type="number" min="1" value={section.count} onChange={(e) => handleUpdateSection(section.id, 'count', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-[#8A2CB0] outline-none" /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">Marks/Q</label><input type="number" min="0.5" step="0.5" value={section.marksPerQuestion} onChange={(e) => handleUpdateSection(section.id, 'marksPerQuestion', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-[#8A2CB0] outline-none" /></div>
                                <div className="md:col-span-1 pb-2 text-right"><span className="text-sm font-bold text-[#8A2CB0]">{section.count * section.marksPerQuestion}</span></div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddSection} className="w-full py-3 border-2 border-dashed border-[#8A2CB0]/30 text-[#8A2CB0] rounded-xl hover:bg-[#8A2CB0]/5 hover:border-[#8A2CB0] transition-all font-bold text-sm flex items-center justify-center gap-2"><span>+ Add Section</span></button>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-600 px-2"><span>Total Questions: <strong className="text-gray-900">{customTotalQuestions}</strong></span><span className={customTotalMarks !== totalMarks ? "text-orange-600 font-bold" : "text-green-600 font-bold"}>Total Calculated: {customTotalMarks} / {totalMarks}</span></div>
                    {customTotalMarks !== totalMarks && <p className="text-xs text-orange-600 text-right px-2">Marks distribution does not match total marks.</p>}
                </div>
            ) : activePattern ? (
                <div className="space-y-6 animate-fade-in">
                    {/* Pattern Header Card */}
                    <div className="bg-gradient-to-r from-[#f3e8ff] to-[#faf5ff] border border-[#d8b4fe] p-5 rounded-2xl shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${activePattern.isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                                        {activePattern.isVerified ? '✓ Verified Pattern' : '⚠️ Pattern Verification Notice'}
                                    </span>
                                    <span className="text-xs font-semibold text-[#8A2CB0] bg-white px-2 py-0.5 rounded border border-[#8A2CB0]/20">
                                        Session {activePattern.academicSession}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {activePattern.totalMarks} Marks • {activePattern.duration}
                                    </span>
                                </div>
                                <h4 className="font-bold text-[#3C128D] text-base md:text-lg">
                                    {activePattern.displayName}
                                </h4>
                                {activePattern.sourceReference && (
                                    <p className="text-[11px] text-gray-500 italic mt-1">
                                        Source: {activePattern.sourceReference}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex gap-2 w-full md:w-auto justify-end">
                                <button
                                    type="button"
                                    onClick={handleResetToOfficialPattern}
                                    className="px-3 py-1.5 bg-white border border-[#8A2CB0]/30 hover:bg-[#8A2CB0]/5 text-[#8A2CB0] rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm"
                                    title="Reset question distribution to official standard counts"
                                >
                                    Reset to Official
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAutoDistributePattern}
                                    className="px-3 py-1.5 bg-[#8A2CB0] hover:bg-[#732494] text-white rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm"
                                    title="Scale distribution to fit current total marks"
                                >
                                    Auto Distribute
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section Breakdown Tables */}
                    <div className="space-y-4">
                        {activePattern.sections.map((section) => {
                            const sectionMarks = section.questionTypes.reduce((acc, qt) => {
                                const count = patternCounts[qt.id] !== undefined ? patternCounts[qt.id] : qt.defaultCount;
                                return acc + (count * qt.defaultMarksPerQuestion);
                            }, 0);

                            return (
                                <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                    {/* Section Header */}
                                    <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                                        <div>
                                            <span className="font-bold text-gray-900 text-sm">
                                                {section.title}
                                            </span>
                                            {section.instructions && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {section.instructions}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs font-bold text-[#8A2CB0] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
                                            Section Total: {sectionMarks} Marks
                                        </div>
                                    </div>

                                    {/* Question Types Table */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs sm:text-sm">
                                            <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Question Type & Scope</th>
                                                    <th className="px-3 py-2 text-center w-24">Marks/Q</th>
                                                    <th className="px-3 py-2 text-center w-28">Count</th>
                                                    <th className="px-4 py-2 text-right w-24">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {section.questionTypes.map((qt) => {
                                                    const currentCount = patternCounts[qt.id] !== undefined ? patternCounts[qt.id] : qt.defaultCount;
                                                    const rowTotal = currentCount * qt.defaultMarksPerQuestion;

                                                    return (
                                                        <tr key={qt.id} className="hover:bg-purple-50/30 transition-colors">
                                                            <td className="px-4 py-2.5 text-gray-800">
                                                                <div className="font-semibold text-gray-900">
                                                                    {qt.name}
                                                                </div>
                                                                {qt.description && (
                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                        {qt.description}
                                                                    </div>
                                                                )}
                                                                {qt.internalChoiceNote && (
                                                                    <div className="text-[10px] text-[#8A2CB0] font-medium mt-0.5">
                                                                        ℹ️ {qt.internalChoiceNote}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-center text-gray-600 font-medium">
                                                                {qt.defaultMarksPerQuestion}M
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    className="w-16 text-center px-2 py-1 rounded border border-gray-300 outline-none focus:ring-2 focus:ring-[#8A2CB0] focus:border-[#8A2CB0] bg-white font-semibold text-gray-800" 
                                                                    value={currentCount} 
                                                                    onChange={(e) => handlePatternCountChange(qt.id, e.target.value)} 
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-bold text-gray-800">
                                                                {rowTotal}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white animate-fade-in">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200"><tr><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-center">Marks/Q</th><th className="px-4 py-3 text-center">Count</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {QUESTION_SPECS.map((spec) => (
                                <tr key={spec.key} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-gray-800 font-medium">{spec.label}</td>
                                    <td className="px-4 py-3 text-center text-gray-500">{spec.marks}</td>
                                    <td className="px-4 py-2 text-center"><input type="number" min="0" className={`w-16 text-center px-2 py-1 rounded border outline-none focus:ring-1 focus:border-[#8A2CB0] ${errors[spec.key] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`} value={counts[spec.key]} onChange={(e) => handleCountChange(spec.key, e.target.value)} onBlur={() => handleBlur(spec.key)} />{errors[spec.key] && <div className="text-[10px] text-red-500 mt-1">{errors[spec.key]}</div>}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-700">{counts[spec.key] ? parseInt(counts[spec.key]) * spec.marks : 0}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200"><tr><td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-600">Total Marks</td><td className={`px-4 py-3 text-right font-bold ${currentCalculatedMarks === totalMarks ? 'text-green-600' : 'text-orange-600'}`}>{currentCalculatedMarks || 0} / {totalMarks}</td></tr></tfoot>
                    </table>
                </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                type="button" 
                onClick={handleResetForm} 
                className="px-5 py-3.5 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-100 hover:text-gray-700 transition-colors text-sm" 
                disabled={isGenerating}
              >
                Reset Form
              </button>
              <button 
                type="button" 
                onClick={onCancel} 
                className="flex-1 py-3.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors text-sm" 
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 btn-glass btn-glass-primary py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 text-sm" 
                disabled={isGenerating}
              >
                {isGenerating ? (<><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Generating...</span></>) : (<span>Generate Paper ✨</span>)}
              </button>
          </div>

        </form>
      </div>

      {showWebResearchModal && (
        <WebResearchModal
          isOpen={showWebResearchModal}
          onClose={() => setShowWebResearchModal(false)}
          initialSubject={selectedSubject}
          initialGrade={selectedClass}
          initialBoard={selectedBoard}
          user={user}
          subscriptionConfig={subscriptionConfig}
          webResearchConfig={webResearchConfig}
          onAddQuestionsToPaper={(researchedQuestions) => {
            setPreviewQuestions(prev => [...researchedQuestions, ...prev]);
            setManualQuestions(prev => [...researchedQuestions, ...prev]);
            setSourceTab('research');
            setExtractedMetadata({
              subject: selectedSubject,
              grade: selectedClass,
              topic: `${researchedQuestions.length} Researched Items`
            });
            setShowWebResearchModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PaperForm;