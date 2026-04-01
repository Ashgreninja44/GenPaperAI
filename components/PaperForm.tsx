
import React, { useState, useEffect, useRef } from 'react';
import { PaperConfig, QuestionCounts, CustomSection, QuestionBank, Question } from '../types';
import { CURRICULUM_DATA, GRADES, FONT_OPTIONS, BOARDS, TEST_TYPES, QUESTION_TYPES_DROPDOWN, CBSE_EXAM_PATTERNS, PRESET_SCHOOLS } from '../constants';
import { parseQuestionsFromText, extractQuestionsFromUrl } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

// Defined Weights and Specs (Legacy/Standard Mode)
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
}

const PaperForm: React.FC<PaperFormProps> = ({ onGenerate, onCancel, isGenerating, questionBanks = [] }) => {
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
  const [logoPlacement, setLogoPlacement] = useState<'left' | 'center' | 'right'>('center');
  const [logoError, setLogoError] = useState<string | null>(null);

  // Typography State
  const [headingFont, setHeadingFont] = useState(FONT_OPTIONS[0].value);
  const [bodyFont, setBodyFont] = useState(FONT_OPTIONS[1].value);

  // General Instructions State
  const [generalInstructions, setGeneralInstructions] = useState('');
  const MAX_INSTRUCTION_CHARS = 500;

  // Curriculum State
  const [selectedBoard, setSelectedBoard] = useState(BOARDS[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [testType, setTestType] = useState(TEST_TYPES[0]);
  
  // Custom Test Name State
  const [customTestName, setCustomTestName] = useState('');
  const [customTestNameError, setCustomTestNameError] = useState<string | null>(null);
  
  // Chapter Selection State
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Time Allowed State
  const [timeAllowed, setTimeAllowed] = useState('2 Hours');
  const [timePreset, setTimePreset] = useState('2 Hours');
  const [customTime, setCustomTime] = useState('');
  const [timeAllowedError, setTimeAllowedError] = useState<string | null>(null);

  const [totalMarks, setTotalMarks] = useState(50);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  
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
  const [sourceTab, setSourceTab] = useState<'ai' | 'bank' | 'url'>('ai');
  const [extractionUrl, setExtractionUrl] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [manualQuestions, setManualQuestions] = useState<Question[]>([]);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]); // Extracted/Parsed but not yet confirmed
  const [extractedMetadata, setExtractedMetadata] = useState<{ subject?: string, topic?: string, grade?: string } | null>(null);
  
  // Filter banks by current subject/grade
  const relevantBanks = questionBanks.filter(b => b.subject === selectedSubject && b.grade === selectedClass);
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  // ----------------------------------------

  // Logic to fetch available subjects/topics based on Board -> Class
  const boardData = CURRICULUM_DATA[selectedBoard];
  const classData = boardData ? boardData[selectedClass] : null;
  const availableSubjects = classData ? Object.keys(classData) : [];
  
  // Available Chapters based on selection
  const availableChapters = (classData && selectedSubject) 
    ? classData[selectedSubject] || [] 
    : [];

  const isCustomTest = testType === 'Custom Test';
  const isCBSEPattern = testType === 'CBSE Board Exam';

  // Effect to auto-select "CBSE Board Exam" logic override
  useEffect(() => {
    if (isCBSEPattern) {
        setTotalMarks(80);
        setTimePreset('3 Hours');
        setTimeAllowed('3 Hours');
        setGeneralInstructions("General Instructions:\n1. This Question Paper contains multiple sections.\n2. All questions are compulsory.\n3. Marks are indicated against each question.\n4. Internal choices have been provided as per CBSE 2024-25 pattern.");
    }
  }, [isCBSEPattern]);

  const effectiveLogo = customLogo;

  // --- Mark Calculation Effects ---
  useEffect(() => {
    if (isCustomTest || isCBSEPattern) return;

    const allFieldsFilled = QUESTION_SPECS.every(spec => counts[spec.key] !== '');
    
    if (allFieldsFilled) {
      const total = QUESTION_SPECS.reduce((acc, spec) => {
        const val = parseInt(counts[spec.key]) || 0;
        return acc + (val * spec.marks);
      }, 0);
      setCurrentCalculatedMarks(total);
    } else {
      setCurrentCalculatedMarks(null);
    }
  }, [counts, isCustomTest, isCBSEPattern]);

  useEffect(() => {
    if (!isCustomTest) return;
    const totalM = customSections.reduce((acc, sec) => acc + (sec.count * sec.marksPerQuestion), 0);
    const totalQ = customSections.reduce((acc, sec) => acc + sec.count, 0);
    setCustomTotalMarks(totalM);
    setCustomTotalQuestions(totalQ);
    setCurrentCalculatedMarks(totalM);
  }, [customSections, isCustomTest]);


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
              const { questions, metadata } = await parseQuestionsFromText(bank.content, selectedSubject);
              setPreviewQuestions(questions);
              setExtractedMetadata(metadata);
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
    if (value === '') return 'Required';
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

  const handleBlur = (key: keyof QuestionCounts) => {
    const error = validateField(key, counts[key]);
    setErrors(prev => ({ ...prev, [key]: error }));
  };

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBoard(e.target.value);
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedChapters([]);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedSubject('');
    setSelectedChapters([]);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
    setSelectedChapters([]);
    setChapterError(null);
    // Reset bank selection on subject change
    setSelectedBankId('');
    setPreviewQuestions([]);
    setManualQuestions([]);
  };

  const handleTestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setTestType(e.target.value);
      setCustomTestNameError(null);
  };

  const handleCustomTestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomTestName(e.target.value);
      if (e.target.value.trim().length >= 3) setCustomTestNameError(null);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedChapters([...availableChapters]);
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

  const isAllSelected = availableChapters.length > 0 && selectedChapters.length === availableChapters.length;
  const isIndeterminate = selectedChapters.length > 0 && selectedChapters.length < availableChapters.length;

  const handleAutoDistribute = () => {
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
    if (timeAllowed.trim() === '') { setTimeAllowedError('Required'); hasErrors = true; }
    else if (!/\d/.test(timeAllowed)) { setTimeAllowedError('Must contain number'); hasErrors = true; }
    if (selectedChapters.length === 0) { setChapterError("Please select at least one chapter."); hasErrors = true; }

    const newErrors: any = {};
    if (!isCustomTest && !isCBSEPattern) {
        QUESTION_SPECS.forEach(spec => {
            const error = validateField(spec.key, counts[spec.key]);
            if (error) { hasErrors = true; newErrors[spec.key] = error; }
        });
    } else if (isCustomTest) {
        if (!customTestName.trim()) { setCustomTestNameError("Please enter a name."); hasErrors = true; }
        else if (customTestName.trim().length < 3) { setCustomTestNameError("Test name must be at least 3 characters."); hasErrors = true; }
        if (customSections.length === 0) { hasErrors = true; alert("Please add at least one section."); }
        if (currentCalculatedMarks !== totalMarks) hasErrors = true;
    }

    if (hasErrors) { setErrors(newErrors); return; }
    
    let finalCounts: any = {};
    if (!isCustomTest && !isCBSEPattern) {
        QUESTION_SPECS.forEach(spec => { finalCounts[spec.key] = parseInt(counts[spec.key]); });
    }
    
    const chaptersString = selectedChapters.join(', ');
    const finalSubjectString = `${selectedSubject} (Chapters: ${chaptersString})`;
    const finalTestType = isCustomTest ? customTestName.trim() : testType;
    
    onGenerate({
      board: selectedBoard,
      schoolName: finalSchoolNameString,
      schoolLogo: effectiveLogo || "",
      logoPlacement: logoPlacement || "center",
      headingFont: headingFont || "",
      bodyFont: bodyFont || "",
      generalInstructions: generalInstructions.trim() || "",
      subject: finalSubjectString,
      grade: selectedClass,
      timeAllowed: timeAllowed.trim(),
      totalMarks,
      difficulty,
      testType: finalTestType,
      customSections: isCustomTest ? customSections : [],
      counts: finalCounts as QuestionCounts,
      includeFigures,
      manualQuestions: manualQuestions || []
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
                                 <label key={opt.id} className={`flex-1 min-w-[80px] py-3 rounded-lg border text-center text-sm font-semibold cursor-pointer transition-all ${logoPlacement === opt.id ? 'bg-[#f3e8ff] border-[#8A2CB0] text-[#3C128D] shadow-sm' : 'bg-white hover:bg-gray-50'}`}>
                                     <input type="radio" name="logoPlacement" value={opt.id} checked={logoPlacement === opt.id} onChange={(e) => setLogoPlacement(e.target.value as any)} className="hidden" />
                                     {opt.label}
                                 </label>
                             ))}
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div><label className="block text-xs font-bold text-gray-500 mb-1">Heading Font</label><select className="w-full px-2 py-2.5 rounded border text-sm dark-dropdown" value={headingFont} onChange={(e) => setHeadingFont(e.target.value)}>{FONT_OPTIONS.map((font) => (<option key={font.value} value={font.value}>{font.label}</option>))}</select></div>
                             <div><label className="block text-xs font-bold text-gray-500 mb-1">Body Font</label><select className="w-full px-2 py-2.5 rounded border text-sm dark-dropdown" value={bodyFont} onChange={(e) => setBodyFont(e.target.value)}>{FONT_OPTIONS.map((font) => (<option key={font.value} value={font.value}>{font.label}</option>))}</select></div>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select required disabled={!selectedClass} className="w-full px-4 py-2.5 rounded-lg border dark-dropdown disabled:opacity-50" value={selectedSubject} onChange={handleSubjectChange}>
                    <option value="" disabled>{!selectedClass ? 'Select Class first' : 'Select Subject'}</option>
                    {availableSubjects.map((subj) => (<option key={subj} value={subj}>{subj}</option>))}
                  </select>
                </div>

                {/* Chapter Selection */}
                {selectedSubject && availableChapters.length > 0 && (
                   <div className="md:col-span-2 bg-white/50 p-6 rounded-xl border border-white/60">
                      <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-bold text-gray-700">Chapter Selection <span className="text-red-500">*</span></label>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" checked={isAllSelected} ref={input => { if (input) input.indeterminate = isIndeterminate; }} onChange={handleSelectAll} className="w-4 h-4 text-[#8A2CB0]" />
                              <span className="text-sm font-semibold text-[#8A2CB0]">Select All</span>
                          </label>
                      </div>
                      <div className="max-h-64 overflow-y-auto pr-2 border border-gray-200 rounded-lg bg-white">
                          {availableChapters.map((chapter, index) => (
                              <label key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b last:border-0 border-gray-100 cursor-pointer">
                                  <input type="checkbox" checked={selectedChapters.includes(chapter)} onChange={() => handleChapterToggle(chapter)} className="mt-1 w-4 h-4 text-[#8A2CB0]" />
                                  <span className="text-sm text-gray-700">{chapter}</span>
                              </label>
                          ))}
                      </div>
                      {chapterError && <p className="text-red-600 text-sm font-bold mt-2">{chapterError}</p>}
                   </div>
                )}
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Test Type</label>
                    <select className="w-full px-4 py-2.5 rounded-lg border dark-dropdown" value={testType} onChange={handleTestTypeChange}>
                        {TEST_TYPES.map((type) => (<option key={type} value={type} disabled={type === "CBSE Board Exam" && selectedClass !== "Class 10"}>{type}{type === "CBSE Board Exam" && selectedClass !== "Class 10" ? " (Class 10 Only)" : ""}</option>))}
                    </select>
                    {isCustomTest && (
                        <div className="mt-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Custom Test Name <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-200" placeholder="e.g. Unit Test 3" value={customTestName} onChange={handleCustomTestNameChange} />
                        </div>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border dark-dropdown" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks</label>
                    <div className="flex gap-2">
                        <input type="number" min="10" max="100" className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 ${isCBSEPattern ? 'bg-gray-100' : ''}`} value={totalMarks} onChange={(e) => setTotalMarks(parseInt(e.target.value))} disabled={isCBSEPattern} />
                        {!isCustomTest && !isCBSEPattern && <button type="button" onClick={handleAutoDistribute} className="btn-glass btn-glass-secondary px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">Auto Distribute</button>}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Allowed <span className="text-red-500">*</span></label>
                    <div className="flex gap-4">
                         <div className="relative w-full md:w-1/2">
                            <select value={timePreset} onChange={handlePresetChange} disabled={isCBSEPattern} className={`w-full px-4 py-2.5 rounded-lg border dark-dropdown disabled:opacity-50 ${timeAllowedError && timePreset !== 'Custom' ? 'border-red-500' : ''}`}>
                                <option value="30 Minutes">30 Minutes</option><option value="40 Minutes">40 Minutes</option><option value="45 Minutes">45 Minutes</option><option value="1 Hour">1 Hour</option><option value="1.5 Hours">1.5 Hours</option><option value="2 Hours">2 Hours</option><option value="2.5 Hours">2.5 Hours</option><option value="3 Hours">3 Hours</option><option value="Custom">Custom</option>
                            </select>
                         </div>
                         {timePreset === 'Custom' && <input type="text" className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border border-gray-200" placeholder="e.g. 90 Minutes" value={customTime} onChange={handleCustomTimeChange} />}
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
                        <p className="text-xs text-gray-500">Where should questions come from?</p>
                     </div>
                     <div className="flex flex-wrap sm:flex-nowrap bg-gray-100 p-1 rounded-lg w-full sm:w-auto justify-center">
                         {['ai', 'bank', 'url'].map(tab => (
                             <button
                                key={tab}
                                type="button"
                                onClick={() => setSourceTab(tab as any)}
                                className={`px-3 sm:px-5 py-2 rounded-md text-[10px] sm:text-xs font-bold transition-all uppercase flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none justify-center ${sourceTab === tab ? 'bg-white shadow-sm text-[#8A2CB0] ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}
                             >
                                <span className="whitespace-nowrap">
                                  {tab === 'ai' ? 'AI Auto-Gen' : tab === 'bank' ? 'Question Bank' : 'Web Extract'}
                                </span>
                                {(tab === 'bank' || tab === 'url') && (
                                  <span className="px-1 py-0.5 rounded bg-amber-400 text-[#3C128D] text-[8px] font-black tracking-tighter shadow-sm border border-amber-500/30 flex-shrink-0">
                                    Beta
                                  </span>
                                )}
                             </button>
                         ))}
                     </div>
                 </div>
                 
                 <div className="relative z-10 min-h-[120px]">
                    {sourceTab === 'ai' && (
                        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <h5 className="font-bold text-indigo-900 text-sm">Automatic Generation</h5>
                                <p className="text-xs text-indigo-700 mt-1">
                                    The AI will generate 100% of the questions based on the selected Chapter and Specs above.
                                </p>
                            </div>
                        </div>
                    )}

                    {sourceTab === 'bank' && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Beta Warning Banner */}
                            <div className="mb-4 glass-panel border-l-4 border-amber-500 p-3 flex items-start gap-3 bg-amber-50/10">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <span className="text-lg">⚠️</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-amber-900 text-[11px]">Beta Feature</h4>
                                        <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-amber-200 text-amber-700 text-[8px] cursor-help" title="We are actively improving this feature. Full functionality coming soon.">ℹ️</span>
                                    </div>
                                    <p className="text-[10px] text-amber-800 mt-0.5 leading-tight">
                                        Question Bank is in Beta. Some functions may be unstable.
                                    </p>
                                </div>
                            </div>

                            {!selectedSubject ? (
                                <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">⚠ Please select a subject in Step 2 first.</p>
                            ) : relevantBanks.length === 0 ? (
                                <p className="text-gray-500 text-sm italic p-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                    No question banks found for {selectedSubject} ({selectedClass}). 
                                    <br/><span className="text-xs">Go to Dashboard &gt; Question Bank to create one.</span>
                                </p>
                            ) : (
                                <>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Select Question Bank</label>
                                    <select 
                                        value={selectedBankId} 
                                        onChange={(e) => handleBankSelection(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border dark-dropdown text-sm"
                                    >
                                        <option value="">-- Choose a Bank --</option>
                                        {relevantBanks.map(b => (
                                            <option key={b.id} value={b.id}>Question Bank ({new Date(b.lastUpdated).toLocaleDateString()})</option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>
                    )}

                    {sourceTab === 'url' && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Beta Warning Banner */}
                            <div className="mb-4 glass-panel border-l-4 border-amber-500 p-3 flex items-start gap-3 bg-amber-50/10">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <span className="text-lg">⚠️</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-amber-900 text-[11px]">Beta Feature</h4>
                                        <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-amber-200 text-amber-700 text-[8px] cursor-help" title="We are actively improving this feature. Full functionality coming soon.">ℹ️</span>
                                    </div>
                                    <p className="text-[10px] text-amber-800 mt-0.5 leading-tight">
                                        Web Extract is in Beta. Some websites may block extraction.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">Paste a public URL (e.g. LearnCBSE, Toppr) to extract questions. If blocked, paste text directly below.</p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={extractionUrl}
                                    onChange={(e) => setExtractionUrl(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#8A2CB0] outline-none"
                                    placeholder="https://example.com/class-10-math-questions"
                                />
                                <button 
                                    type="button" 
                                    onClick={handleUrlExtraction}
                                    disabled={isExtracting || !extractionUrl}
                                    className="btn-glass btn-glass-primary px-6 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                                >
                                    {isExtracting ? 'Scanning...' : 'Extract URL'}
                                </button>
                            </div>
                            
                            {extractionError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700 flex items-start gap-2 animate-fade-in">
                                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span>{extractionError}</span>
                                </div>
                            )}

                            {/* Manual Paste Fallback */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-xs text-gray-500 uppercase font-bold tracking-wider">OR Paste Text</span>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea 
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#8A2CB0] outline-none min-h-[100px]"
                                    placeholder="Paste raw text from any document or website here..."
                                    value={pasteText}
                                    onChange={(e) => setPasteText(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    onClick={handleTextParse}
                                    disabled={isExtracting || !pasteText.trim()}
                                    className="absolute bottom-3 right-3 btn-glass btn-glass-secondary px-4 py-1.5 rounded-md text-xs font-bold disabled:opacity-50"
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

          {/* Table / Custom Builder / CBSE Info */}
          <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{isCustomTest ? 'Custom Format Builder' : isCBSEPattern ? 'Exam Structure' : 'Question Distribution'}</h3>
                {currentCalculatedMarks !== null && !isCBSEPattern && <span className={`text-sm font-bold px-3 py-1 rounded-full ${currentCalculatedMarks === totalMarks ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>Total: {currentCalculatedMarks} / {totalMarks}</span>}
            </div>
            
            {isCBSEPattern ? (
                <div className="bg-[#f3e8ff] border border-[#d8b4fe] p-6 rounded-xl animate-fade-in">
                    <div className="flex items-start gap-4">
                        <div className="bg-[#8A2CB0] text-white p-3 rounded-lg shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                        <div>
                            <h4 className="font-bold text-[#3C128D] text-lg mb-1">Official CBSE Pattern Locked</h4>
                            <p className="text-sm text-[#3C128D]/80 mb-2">The question paper will be generated strictly according to the official CBSE Sample Paper (2024-25) format for <strong>{selectedSubject}</strong>.</p>
                            <ul className="text-xs text-[#3C128D]/70 space-y-1 list-disc ml-4"><li>Total Marks: <strong>80</strong></li><li>Duration: <strong>3 Hours</strong></li><li>Section-wise weightage and internal choices applied automatically.</li></ul>
                        </div>
                    </div>
                </div>
            ) : isCustomTest ? (
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
          
          <div className="flex gap-4 pt-4">
              <button type="button" onClick={onCancel} className="flex-1 py-3.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors" disabled={isGenerating}>Cancel</button>
              <button type="submit" className="flex-1 btn-glass btn-glass-primary py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2" disabled={isGenerating}>
                {isGenerating ? (<><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Generating...</span></>) : (<span>Generate Paper ✨</span>)}
              </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PaperForm;