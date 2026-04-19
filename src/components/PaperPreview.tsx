
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { GeneratedPaper, Question } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { FONT_OPTIONS } from '../constants';
import QuestionCard from './QuestionCard';
import AnswerKeyRenderer from './AnswerKeyRenderer';
import { regenerateSingleQuestion, generateDiagramImage } from '../services/geminiService';

interface PaperPreviewProps {
  paper: GeneratedPaper;
  onBack: () => void;
  onUpdatePaper: (updatedPaper: GeneratedPaper) => Promise<void>;
}

const PaperPreview: React.FC<PaperPreviewProps> = ({ paper, onBack, onUpdatePaper }) => {
  const [questions, setQuestions] = useState<Question[]>(paper.questions || []);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'word' | 'txt'>('pdf');
  const [processedLogo, setProcessedLogo] = useState<string | null>(paper.config.schoolLogo || null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const triggerAutoSave = (updatedQuestions: Question[]) => {
    setHasUnsavedChanges(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
            await onUpdatePaper({ ...paper, questions: updatedQuestions });
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error("Debounced save failed:", err);
        } finally {
            setIsSaving(false);
        }
    }, 5000); // 5 second debounce - very safe for quota
  };

  // Sync questions if paper changes (e.g. after save)
  useEffect(() => {
    if (paper.questions && !hasUnsavedChanges) {
      // Sort questions by section to ensure sequential numbering within sections
      const sortedQuestions = [...paper.questions].sort((a, b) => {
        return a.section.localeCompare(b.section);
      });
      setQuestions(sortedQuestions);
    }
  }, [paper.questions, hasUnsavedChanges]);

  const { schoolName, schoolLogo, logoPlacement, headingFont, bodyFont, generalInstructions } = paper.config;
  const timeAllowed = paper.config.timeAllowed || '2 Hours';
  const effectiveHeadingFont = headingFont || FONT_OPTIONS[0].value;
  const effectiveBodyFont = bodyFont || FONT_OPTIONS[1].value;

  // --- Process Logo for PDF (CORS handling) ---
  useEffect(() => {
    if (schoolLogo) {
        // If it's already base64, just set it
        if (schoolLogo.startsWith('data:')) {
            setProcessedLogo(schoolLogo);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                try {
                    const dataURL = canvas.toDataURL('image/png');
                    setProcessedLogo(dataURL);
                } catch (e) {
                    console.warn("CORS blocked logo conversion to base64", e);
                    setProcessedLogo(schoolLogo);
                }
            }
        };
        img.onerror = () => {
            console.warn("Failed to load logo");
            setProcessedLogo(null);
        };
        img.src = schoolLogo;
    } else {
        setProcessedLogo(null);
    }
  }, [schoolLogo]);

  // --- Background Image Generation Logic ---
  useEffect(() => {
    const questionsNeedingImages = questions.filter(q => q.diagram_prompt && !q.image_url);
    
    if (questionsNeedingImages.length > 0) {
        let isMounted = true;
        
        const generateImages = async () => {
            // Use a local copy of questions to batch updates
            let currentQuestions = [...questions];
            let hasChanged = false;

            for (const q of questionsNeedingImages) {
                if (!isMounted) break;

                try {
                    // Add a small delay between requests to avoid burst rate limits
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const base64Image = await generateDiagramImage(q.diagram_prompt!);
                    
                    currentQuestions = currentQuestions.map(item => 
                        item.question_id === q.question_id 
                           ? { ...item, image_url: base64Image } 
                           : item
                    );
                    hasChanged = true;
                    
                    // Update local state frequently for feedback
                    if (isMounted) {
                        setQuestions([...currentQuestions]);
                    }
                } catch (e) {
                    console.error("Failed to generate diagram for Q", q.question_id, e);
                    // Mark as failed/retried to prevent infinite retry loop
                    currentQuestions = currentQuestions.map(item => 
                        item.question_id === q.question_id 
                           ? { ...item, diagram_prompt: undefined } 
                           : item
                    );
                    hasChanged = true;
                    if (isMounted) {
                        setQuestions([...currentQuestions]);
                    }
                }
            }

            // Final sync to Firestore only once after batch is complete
            if (hasChanged && isMounted) {
                try {
                    await onUpdatePaper({ ...paper, questions: currentQuestions });
                } catch (err) {
                    console.error("Firestore batch update failed during image generation", err);
                }
            }
        };

        generateImages();
        return () => { isMounted = false; };
    }
  }, [paper.id]); // Only run when paper changes or on mount


  // --- Logic to Regenerate a single question ---
  const handleRegenerateQuestion = async (id: string, newDiff: number, instruction: string) => {
    const qIndex = questions.findIndex(q => q.question_id === id);
    if (qIndex === -1) return;

    const question = questions[qIndex];
    if (question.is_manually_edited) {
        const confirmOverwrite = window.confirm(
            "This question has manual edits. Regenerating it will overwrite your changes. Are you sure?"
        );
        if (!confirmOverwrite) return;
    }

    try {
        const updatedData = await regenerateSingleQuestion(
            question, 
            newDiff, 
            instruction, 
            paper.config.subject
        );

        const updatedQuestions = [...questions];
        updatedQuestions[qIndex] = { 
            ...updatedQuestions[qIndex], 
            ...updatedData,
            difficulty: newDiff 
        };
        setQuestions(updatedQuestions);
        await onUpdatePaper({ ...paper, questions: updatedQuestions });
    } catch (e) {
        alert("Failed to regenerate question. Please try again.");
    }
  };

  const handleUpdateQuestionText = async (id: string, newText: string) => {
    const updatedQuestions = questions.map(q => 
        q.question_id === id ? { ...q, question_text: newText, is_manually_edited: true } : q
    );
    setQuestions(updatedQuestions);
    triggerAutoSave(updatedQuestions);
  };

  const handleUpdateQuestionOption = async (id: string, optionIndex: number, newText: string) => {
    const updatedQuestions = questions.map(q => {
        if (q.question_id === id && q.options) {
            const newOptions = [...q.options];
            newOptions[optionIndex] = newText;
            return { ...q, options: newOptions, is_manually_edited: true };
        }
        return q;
    });
    setQuestions(updatedQuestions);
    triggerAutoSave(updatedQuestions);
  };

  const triggerAutoSaveAnswerKey = (newAnswerKey: string) => {
    setHasUnsavedChanges(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
            await onUpdatePaper({ ...paper, answerKey: newAnswerKey });
            setHasUnsavedChanges(false);
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 2000);
        } catch (err) {
            console.error("Answer key save failed:", err);
        } finally {
            setIsSaving(false);
        }
    }, 5000);
  };

  const handleUpdateAnswerKey = async (newText: string) => {
    triggerAutoSaveAnswerKey(newText);
  };

  // --- Construct the Final Paper Text dynamically from the Question State ---
  const constructedPaperContent = useMemo(() => {
    let content = "";
    let currentSection = "";
    let sectionIdx = 0;

    questions.forEach((q) => {
        // Section Header
        if (q.section !== currentSection) {
            content += `\n\n**${q.section}**\n\n`;
            currentSection = q.section;
            sectionIdx = 0;
        }
        sectionIdx++;

        // Question Text
        content += `${sectionIdx}. ${q.question_text}  ([${q.marks} Mark${q.marks > 1 ? 's' : ''}])\n`;

        // Diagram Placeholder for TXT export (since images won't show)
        if (q.image_url) {
            content += `[Diagram Inserted Here]\n`;
        }

        // Options
        if (q.options && q.options.length > 0) {
            q.options.forEach((opt, i) => {
                content += `${String.fromCharCode(65 + i)}) ${opt}\n`;
            });
            content += "\n";
        } else {
            content += "\n";
        }
    });

    return content;
  }, [questions]);

  // --- Export Helpers using raw Unicode ---

  const processForTextExport = (text: string): string => {
    // Just simple cleanup, assume AI gives perfect Unicode
    return text.replace(/\*\*/g, '');
  };

  const generateWordContent = () => {
      // Build HTML for Word dynamically, injecting images where needed
      let html = '';
      let currentSection = "";
      let sectionIdx = 0;

      questions.forEach((q) => {
           if (q.section !== currentSection) {
               html += `<h3 style="font-size:14pt; font-weight:bold; text-transform:uppercase; margin-top:12pt; margin-bottom:6pt; font-family: 'Times New Roman', serif;">${q.section}</h3>`;
               currentSection = q.section;
               sectionIdx = 0;
           }
           sectionIdx++;

           // Pre-wrap style is essential for vertical fractions
           const cleanText = q.question_text.replace(/\*\*/g, '');
           
           html += `<div style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; white-space: pre-wrap;"><b>${sectionIdx}.</b> ${cleanText} <b>[${q.marks}]</b></div>`;

           if (q.image_url) {
               html += `<p><img src="${q.image_url}" width="300" style="width:300px; height:auto;" /></p>`;
           }

           if (q.options) {
               q.options.forEach((opt, i) => {
                   const cleanOpt = opt.replace(/\*\*/g, '');
                   // Use div with pre-wrap for options too in case they have math
                   html += `<div style="font-family: 'Times New Roman', serif; font-size: 11pt; margin-left: 20px; white-space: pre-wrap;">${String.fromCharCode(65 + i)}) ${cleanOpt}</div>`;
               });
           }
           html += `<br/>`;
      });
      return html;
  };

  const handleDownload = () => {
    switch (downloadFormat) {
      case 'txt': exportToText(); break;
      case 'pdf': exportToPdf(); break;
      case 'word': exportToWord(); break;
    }
  };

  const exportToText = () => {
    const instructionsText = generalInstructions ? `\nGeneral Instructions:\n${generalInstructions}\n` : `\nGeneral Instructions:\n- All questions are compulsory.\n`;
    const cleanTitleBlock = `\n${paper.title}\nTime Allowed: ${timeAllowed} | Total Marks: ${paper.config.totalMarks}\n`;
    const processedContent = processForTextExport(constructedPaperContent);
    const fileContent = `${paper.config.schoolName.toUpperCase()}${cleanTitleBlock}${instructionsText}\n${processedContent}\n\n© GenPaper AI`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    if (!printRef.current) return;
    const opt = {
      margin: 0.5,
      filename: `${paper.title.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    (window as any).html2pdf().set(opt).from(printRef.current).save();
  };

  const exportToWord = () => {
    const bodyHtml = generateWordContent();
    const instructionsHtml = generalInstructions ? `<div style="margin-bottom:16pt;"><b>General Instructions:</b><br/>${generalInstructions.replace(/\n/g, '<br/>')}</div>` : '';
    
    let logoHtml = '';
    if (processedLogo) {
        logoHtml = `<div style="text-align:center; margin-bottom:10pt;"><img src="${processedLogo}" width="80" style="width:80pt; height:auto;" /></div>`;
    }

    const titleBlockHtml = `
        <div style="text-align:center; margin-bottom:20pt; border-bottom:2px solid #000; padding-bottom:12pt;">
            ${logoHtml}
            <h1 style="font-size:22pt; font-weight:bold; margin:0; text-transform:uppercase;">${schoolName || 'QUESTION PAPER'}</h1>
            <h2 style="font-size:16pt; margin:8pt 0;">${paper.title}</h2>
            <p style="font-size:11pt;">Time: ${timeAllowed} | Marks: ${paper.config.totalMarks}</p>
        </div>
    `;
    const fullHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns:m='http://schemas.openxmlformats.org/officeDocument/2006/math' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${paper.title}</title><style>body{font-family:'Times New Roman',serif;}</style></head><body>${titleBlockHtml}${instructionsHtml}${bodyHtml}</body></html>`;
    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- UI Renderers ---

  let headerLayoutClass = "flex flex-col items-center justify-center gap-4"; // Default to centered above
  let textAlignClass = "text-center";
  
  if (logoPlacement === 'left') { 
      headerLayoutClass = "flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"; 
  } else if (logoPlacement === 'right') { 
      headerLayoutClass = "flex flex-col sm:flex-row-reverse items-center justify-center gap-4 sm:gap-6"; 
  }

  // Render questions for Preview Mode (includes images)
  const renderPreviewContent = () => {
      let currentSection = "";
      let sectionIdx = 0;
      return questions.map((q, index) => {
          let sectionHeader = null;
          if (q.section !== currentSection) {
              currentSection = q.section;
              sectionIdx = 0;
              sectionHeader = <h3 key={`sect-${index}`} style={{ fontFamily: effectiveHeadingFont }} className="text-lg font-bold mt-6 mb-3 uppercase tracking-wide text-gray-900">{q.section}</h3>;
          }
          sectionIdx++;
          
          return (
              <div key={q.question_id} className="mb-6 break-inside-avoid page-break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  {sectionHeader}
                  <div className="flex gap-2 text-gray-800 text-base leading-relaxed">
                      <span className="font-bold">{sectionIdx}.</span>
                      <div className="flex-1">
                          <MarkdownRenderer content={q.question_text} bodyFont={effectiveBodyFont} />
                          
                          {/* Diagram for Print Preview */}
                          {q.image_url && (
                              <div className="my-3 border border-gray-300 p-1 inline-block">
                                  <img src={q.image_url} alt="Diagram" className="max-h-56 object-contain" />
                              </div>
                          )}

                          {q.options && (
                              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                  {q.options.map((opt, i) => (
                                      <div key={i} className="flex gap-1">
                                          <span className="font-bold">{String.fromCharCode(65 + i)})</span>
                                          <MarkdownRenderer content={opt} bodyFont={effectiveBodyFont} />
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                      <span className="font-bold text-sm ml-2">[{q.marks}]</span>
                  </div>
              </div>
          );
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-fade-in pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .break-inside-avoid {
            break-inside: avoid !important;
            -webkit-column-break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />
      
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-center mb-6 gap-4 md:gap-6 sticky top-0 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg z-20 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
             <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 font-bold transition-colors">
                ← Dashboard
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => {
                        setViewMode('edit');
                        setShowAnswerKey(false);
                    }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'edit' ? 'bg-white shadow text-[#3C128D]' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit Mode
                </button>
                <button 
                    onClick={() => setViewMode('preview')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'preview' ? 'bg-white shadow text-[#3C128D]' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Print Preview
                </button>
            </div>
            
            {viewMode === 'edit' && (
                <button 
                    onClick={() => setIsEditingEnabled(!isEditingEnabled)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isEditingEnabled 
                        ? 'bg-[#8A2CB0] text-white border-[#8A2CB0] shadow-md scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#8A2CB0]/50'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit Text
                </button>
            )}

            {/* Syncing/Saved Status */}
            <div className="flex items-center gap-2 min-w-[80px]">
                {isSaving ? (
                    <div className="flex items-center gap-1.5 text-gray-400 animate-pulse">
                        <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Syncing...</span>
                    </div>
                ) : hasUnsavedChanges ? (
                    <div className="flex items-center gap-1.5 text-blue-500 animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Unsaved</span>
                    </div>
                ) : showSavedToast ? (
                    <div className="flex items-center gap-1.5 text-green-600 animate-fade-in">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Saved</span>
                    </div>
                ) : null}
            </div>
        </div>

        {viewMode === 'preview' && (
          <div className="flex items-center gap-3 ml-auto">
               <button 
                 onClick={() => setShowAnswerKey(!showAnswerKey)} 
                 className="btn-glass btn-glass-secondary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                 </svg>
                 {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
               </button>
               <div className="flex items-center gap-2 bg-indigo-50 p-1 rounded-lg border border-indigo-100">
                    <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as any)} className="bg-transparent border-none text-gray-800 text-xs font-bold focus:ring-0 cursor-pointer dark-dropdown rounded px-2 py-1">
                      <option value="pdf">PDF</option>
                      <option value="word">Word</option>
                      <option value="txt">Txt</option>
                    </select>
                    <button onClick={handleDownload} className="btn-glass btn-glass-primary px-4 py-1.5 rounded-md text-xs font-bold">Download</button>
               </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
          
          {/* EDIT MODE: Interactive Grid */}
          {viewMode === 'edit' && !showAnswerKey && (
              <div className="space-y-8">
                  {/* Group Questions by Section */}
                  {Array.from(new Set(questions.map(q => q.section))).map((section) => (
                      <div key={section} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
                          <h3 className="text-lg font-bold text-[#3C128D] mb-4 border-b border-[#3C128D]/20 pb-2">{section}</h3>
                          <div className="grid grid-cols-1 gap-4">
                              {questions.filter(q => q.section === section).map((q, idx) => {
                                  return (
                                    <QuestionCard 
                                        key={q.question_id} 
                                        question={q} 
                                        index={idx} 
                                        onRegenerate={handleRegenerateQuestion} 
                                        onUpdateText={handleUpdateQuestionText}
                                        onUpdateOption={handleUpdateQuestionOption}
                                        isEditingEnabled={isEditingEnabled}
                                    />
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* PREVIEW MODE: Clean Paper */}
          {(viewMode === 'preview' || showAnswerKey) && (
              <div ref={printRef} className="bg-white rounded-lg min-h-[800px] flex flex-col p-4 sm:p-8 md:p-16 print:p-8 print:shadow-none print:border-none shadow-xl shadow-gray-200/50 border border-gray-200">
                 {/* Paper Header */}
                 <div className="border-b-2 border-gray-800 pb-8 mb-8">
                    <div className={headerLayoutClass}>
                        {processedLogo && (
                            <img 
                                src={processedLogo} 
                                alt="Logo" 
                                className="h-20 w-auto object-contain" 
                            />
                        )}
                        <div className={textAlignClass}>
                            {schoolName && <h2 style={{ fontFamily: effectiveHeadingFont }} className="text-3xl font-bold uppercase tracking-widest">{schoolName}</h2>}
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <h1 style={{ fontFamily: effectiveHeadingFont }} className="text-xl font-bold mb-1">{paper.title}</h1>
                        <p style={{ fontFamily: effectiveBodyFont }} className="text-base font-medium">Time: {timeAllowed} | Marks: {paper.config.totalMarks}</p>
                    </div>
                 </div>

                 {/* Content */}
                 {showAnswerKey ? (
                     <AnswerKeyRenderer 
                        rawText={paper.answerKey}
                        isEditingEnabled={isEditingEnabled}
                        onUpdate={(newText) => {
                            if (newText !== paper.answerKey) {
                                handleUpdateAnswerKey(newText);
                            }
                        }}
                     />
                 ) : (
                     <div>
                        {generalInstructions && (
                            <div className="mb-8 p-4 bg-gray-50 text-sm rounded border border-gray-200">
                                <strong className="block mb-1">General Instructions:</strong>
                                <p style={{ fontFamily: effectiveBodyFont, whiteSpace: 'pre-wrap' }}>{generalInstructions}</p>
                            </div>
                        )}
                        {/* Custom Render Loop to include Images */}
                        {renderPreviewContent()}
                     </div>
                 )}
              </div>
          )}
      </div>
    </div>
  );
};

export default PaperPreview;