
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { GeneratedPaper, Question } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { FONT_OPTIONS } from '../constants';
import QuestionCard from './QuestionCard';
import AnswerKeyRenderer from './AnswerKeyRenderer';
import { regenerateSingleQuestion, generateDiagramImage } from '../services/geminiService';
import PaperLayoutModal, { PaperLayoutSettings } from './PaperLayoutModal';
import QuestionPaperTemplate from './QuestionPaperTemplate';
import TemplateShowcaseModal from './TemplateShowcaseModal';
import { Sliders, Download, Columns, FileText, Check, AlignJustify, BookOpen, Layers } from 'lucide-react';

interface PaperPreviewProps {
  paper: GeneratedPaper;
  onBack: () => void;
  onUpdatePaper: (updatedPaper: GeneratedPaper) => Promise<void>;
  isGuest?: boolean;
  onRequireAuth?: (feature: 'download' | 'bank' | 'web-extract' | 'save' | 'customization' | 'general', customMessage?: string) => void;
}

const PaperPreview: React.FC<PaperPreviewProps> = ({ 
  paper, 
  onBack, 
  onUpdatePaper,
  isGuest = false,
  onRequireAuth
}) => {
  const [questions, setQuestions] = useState<Question[]>(paper.questions || []);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'word' | 'txt'>('pdf');
  const [processedLogo, setProcessedLogo] = useState<string | null>(paper.config.schoolLogo || null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [layoutSettings, setLayoutSettings] = useState<PaperLayoutSettings>({
    showAnswerKey: false,
    includeInstructionsPage: false,
    columnLayout: 'single',
    fontSize: 'standard',
    includeStudentInfoBox: true,
    downloadFormat: 'pdf'
  });
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
        return (a.section || '').localeCompare(b.section || '');
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
    // Only target questions that have a diagram prompt, no image yet, and are not marked as permanently failed
    const questionsNeedingImages = questions.filter(
      q => q.diagram_prompt && !q.image_url && q.diagram_status !== 'failed'
    );
    
    if (questionsNeedingImages.length > 0) {
      let isMounted = true;
      
      const generateImages = async () => {
        let currentQuestions = [...questions];
        let hasChanged = false;

        for (const q of questionsNeedingImages) {
          if (!isMounted) break;

          try {
            // Set initial generating status
            currentQuestions = currentQuestions.map(item =>
              item.question_id === q.question_id
                ? { ...item, diagram_status: 'generating' as const, diagram_retry_count: 1 }
                : item
            );
            if (isMounted) setQuestions([...currentQuestions]);

            // Gentle delay between requests to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (!isMounted) break;

            const base64Image = await generateDiagramImage(
              q.diagram_prompt!,
              (status, attempt) => {
                if (!isMounted) return;
                currentQuestions = currentQuestions.map(item =>
                  item.question_id === q.question_id
                    ? { ...item, diagram_status: status, diagram_retry_count: attempt }
                    : item
                );
                setQuestions([...currentQuestions]);
              }
            );
            
            currentQuestions = currentQuestions.map(item => 
              item.question_id === q.question_id 
                ? { 
                    ...item, 
                    image_url: base64Image, 
                    diagram_status: 'success' as const,
                    diagram_error: undefined 
                  } 
                : item
            );
            hasChanged = true;
            
            if (isMounted) {
              setQuestions([...currentQuestions]);
            }
          } catch (e: any) {
            console.warn("Diagram generation failed for Q", q.question_id, e?.message || e);
            const errMsg = e?.message || "Failed to generate diagram image";
            const isQuotaOrLimitZero = errMsg.includes('quota') || 
                                       errMsg.includes('limit: 0') || 
                                       errMsg.includes('RESOURCE_EXHAUSTED') || 
                                       errMsg.includes('429');

            if (isQuotaOrLimitZero) {
              // Quota unavailable for image model on this tier: mark THIS and ALL REMAINING questions as failed and exit loop immediately
              const remainingIds = new Set(questionsNeedingImages.map(nq => nq.question_id));
              currentQuestions = currentQuestions.map(item => 
                remainingIds.has(item.question_id) && !item.image_url
                  ? { 
                      ...item, 
                      diagram_status: 'failed' as const,
                      diagram_error: "Image model quota unavailable on current tier. Diagram prompt preserved." 
                    } 
                  : item
              );
              hasChanged = true;
              if (isMounted) {
                setQuestions([...currentQuestions]);
              }
              break; // Stop attempting subsequent questions in batch
            } else {
              // Mark single item as failed while preserving diagram_prompt
              currentQuestions = currentQuestions.map(item => 
                item.question_id === q.question_id 
                  ? { 
                      ...item, 
                      diagram_status: 'failed' as const,
                      diagram_error: errMsg 
                    } 
                  : item
              );
              hasChanged = true;
              if (isMounted) {
                setQuestions([...currentQuestions]);
              }
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

  // --- Logic to Manually Retry a Diagram ---
  const handleRetryDiagram = async (id: string) => {
    const qIndex = questions.findIndex(q => q.question_id === id);
    if (qIndex === -1) return;

    const targetQuestion = questions[qIndex];
    if (!targetQuestion.diagram_prompt) return;

    try {
      // Set to generating in UI
      const updatedQuestions = [...questions];
      updatedQuestions[qIndex] = {
        ...targetQuestion,
        diagram_status: 'generating',
        diagram_error: undefined,
        diagram_retry_count: 1
      };
      setQuestions(updatedQuestions);

      const base64Image = await generateDiagramImage(
        targetQuestion.diagram_prompt,
        (status, attempt) => {
          setQuestions(prev => prev.map(item =>
            item.question_id === id
              ? { ...item, diagram_status: status, diagram_retry_count: attempt }
              : item
          ));
        }
      );

      const finalQuestions = questions.map(item =>
        item.question_id === id
          ? {
              ...item,
              image_url: base64Image,
              diagram_status: 'success' as const,
              diagram_error: undefined
            }
          : item
      );
      setQuestions(finalQuestions);
      await onUpdatePaper({ ...paper, questions: finalQuestions });
    } catch (err: any) {
      console.error("Manual diagram retry failed for Q", id, err);
      const failedQuestions = questions.map(item =>
        item.question_id === id
          ? {
              ...item,
              diagram_status: 'failed' as const,
              diagram_error: err?.message || "Diagram generation failed on retry."
            }
          : item
      );
      setQuestions(failedQuestions);
      await onUpdatePaper({ ...paper, questions: failedQuestions });
    }
  };

  // --- Logic to Remove Diagram from a Question ---
  const handleRemoveDiagram = async (id: string) => {
    const updatedQuestions = questions.map(item => {
      if (item.question_id !== id) return item;
      const { diagram_prompt, image_url, diagram_status, diagram_error, diagram_retry_count, ...rest } = item;
      return rest as Question;
    });
    setQuestions(updatedQuestions);
    await onUpdatePaper({ ...paper, questions: updatedQuestions });
  };


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

  const handleDownload = (overrideFormat?: 'pdf' | 'word' | 'txt') => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('download', 'Sign in with Google, Microsoft, or Email to download this question paper in PDF, Word, or TXT format.');
      return;
    }
    const format = overrideFormat || layoutSettings.downloadFormat || downloadFormat;
    switch (format) {
      case 'txt': exportToText(); break;
      case 'pdf': exportToPdf(); break;
      case 'word': exportToWord(); break;
    }
  };

  const exportToText = () => {
    let instructionsText = '';
    if (layoutSettings.includeInstructionsPage) {
      const candidateBlock = layoutSettings.includeStudentInfoBox ? 
        `Candidate Name: _______________________\nRoll Number: ___________________________\nClass & Section: _______________________\nDate of Exam: __________________________\nInvigilator Sign: ______________________\n\n` : '';
      instructionsText = `\n========================================\nEXAMINATION COVER PAGE & INSTRUCTIONS\n========================================\n` +
        candidateBlock +
        (generalInstructions ? `General Instructions:\n${generalInstructions}\n` : `General Instructions:\n- All questions are compulsory.\n- Write clear and concise answers.\n`);
    } else {
      instructionsText = generalInstructions ? `\nGeneral Instructions:\n${generalInstructions}\n` : `\nGeneral Instructions:\n- All questions are compulsory.\n`;
    }

    const cleanTitleBlock = `\n${paper.title}\nTime Allowed: ${timeAllowed} | Total Marks: ${paper.config.totalMarks}\nLayout: ${layoutSettings.columnLayout === 'double' ? 'Double Column (CBSE Style)' : 'Single Column'}\n`;
    const processedContent = processForTextExport(constructedPaperContent);
    let fileContent = `${paper.config.schoolName.toUpperCase()}${cleanTitleBlock}${instructionsText}\n${processedContent}\n`;

    if (layoutSettings.showAnswerKey && paper.answerKey) {
      fileContent += `\n\n========================================\nANSWER KEY & MARKING SCHEME\n========================================\n\n${paper.answerKey}\n`;
    }

    fileContent += `\n© GenPaper AI`;
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

  const exportToPdf = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    try {
      const opt = {
        margin: 0.5,
        filename: `${paper.title.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      await (window as any).html2pdf().set(opt).from(printRef.current).save();
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const exportToWord = () => {
    const bodyHtml = generateWordContent();
    let instructionsHtml = '';
    
    if (layoutSettings.includeInstructionsPage) {
      const studentBox = layoutSettings.includeStudentInfoBox ? `
        <table style="width:100%; border:1px solid #000; margin:14pt 0; padding:8pt; font-family:'Times New Roman',serif; font-size:10pt;">
          <tr>
            <td style="padding:4pt;"><b>Candidate Name:</b> ___________________________</td>
            <td style="padding:4pt;"><b>Roll Number:</b> ___________________________</td>
          </tr>
          <tr>
            <td style="padding:4pt;"><b>Class & Section:</b> ___________________________</td>
            <td style="padding:4pt;"><b>Date of Exam:</b> ___________________________</td>
          </tr>
          <tr>
            <td style="padding:4pt;"><b>Candidate Sign:</b> ___________________________</td>
            <td style="padding:4pt;"><b>Invigilator Sign:</b> ___________________________</td>
          </tr>
        </table>
      ` : '';
      
      instructionsHtml = `
        <div style="margin-bottom:20pt;">
          ${studentBox}
          <div style="background:#f4f4f4; padding:10pt; border:1px solid #ccc; font-size:10.5pt;">
            <b>General Instructions for Candidates:</b><br/>
            ${(generalInstructions || '1. All questions are compulsory unless stated otherwise.\n2. Read instructions carefully.').replace(/\n/g, '<br/>')}
          </div>
        </div>
        <br clear=all style='mso-special-character:line-break;page-break-before:always' />
      `;
    } else {
      instructionsHtml = generalInstructions ? `<div style="margin-bottom:16pt;"><b>General Instructions:</b><br/>${generalInstructions.replace(/\n/g, '<br/>')}</div>` : '';
    }

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

    let answerKeyHtml = '';
    if (layoutSettings.showAnswerKey && paper.answerKey) {
      answerKeyHtml = `
        <br clear=all style='mso-special-character:line-break;page-break-before:always' />
        <div style="margin-top:24pt; border-top:2px solid #000; padding-top:16pt; text-align:center;">
          <h2 style="font-size:16pt; font-weight:bold; text-transform:uppercase;">ANSWER KEY & MARKING SCHEME</h2>
          <p style="font-size:10pt; color:#666;">${paper.title} • Total Marks: ${paper.config.totalMarks}</p>
        </div>
        <div style="font-family:'Times New Roman',serif; font-size:11pt; line-height:1.6; white-space:pre-wrap; margin-top:14pt;">
          ${paper.answerKey.replace(/\n/g, '<br/>')}
        </div>
      `;
    }

    const columnStyle = layoutSettings.columnLayout === 'double' ? 'column-count:2; -webkit-column-count:2; column-gap:20pt;' : '';
    const fullHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns:m='http://schemas.openxmlformats.org/officeDocument/2006/math' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${paper.title}</title><style>body{font-family:'Times New Roman',serif;}</style></head><body>${titleBlockHtml}${instructionsHtml}<div style="${columnStyle}">${bodyHtml}</div>${answerKeyHtml}</body></html>`;
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

      const fontSizeClass = layoutSettings.fontSize === 'compact'
        ? 'text-sm leading-normal'
        : layoutSettings.fontSize === 'spacious'
        ? 'text-lg leading-relaxed'
        : 'text-base leading-relaxed';

      const marginBottomClass = layoutSettings.fontSize === 'compact'
        ? 'mb-4'
        : layoutSettings.fontSize === 'spacious'
        ? 'mb-8'
        : 'mb-6';

      return questions.map((q, index) => {
          let sectionHeader = null;
          if (q.section !== currentSection) {
              currentSection = q.section;
              sectionIdx = 0;
              sectionHeader = (
                <div 
                  key={`sect-${index}`} 
                  style={{ 
                    fontFamily: effectiveHeadingFont,
                    columnSpan: layoutSettings.columnLayout === 'double' ? 'all' : 'none',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                  }} 
                  className="w-full text-lg font-bold mt-6 mb-3 uppercase tracking-wide text-gray-900 border-b border-gray-200 pb-1"
                >
                  {q.section}
                </div>
              );
          }
          sectionIdx++;
          
          return (
              <motion.div 
                  key={q.question_id} 
                  className={`${marginBottomClass} break-inside-avoid page-break-inside-avoid`} 
                  style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.08, margin: "0px 0px -40px 0px" }}
                  transition={{ 
                      duration: 0.4, 
                      delay: Math.min(((sectionIdx - 1) % 6) * 0.07, 0.35), 
                      ease: [0.21, 0.47, 0.32, 0.98] 
                  }}
              >
                  {sectionHeader}
                  <div className={`flex gap-2 text-gray-800 ${fontSizeClass}`}>
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
                              <div className={`mt-2 grid ${layoutSettings.columnLayout === 'double' ? 'grid-cols-1 gap-y-1' : 'grid-cols-2 gap-x-4 gap-y-1'}`}>
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
              </motion.div>
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
          .break-inside-avoid, [data-projection-id] {
            opacity: 1 !important;
            transform: none !important;
          }
          .print-double-column {
            column-count: 2 !important;
            column-gap: 2rem !important;
          }
          .html2pdf__page-break {
            page-break-before: always;
            break-before: page;
          }
        }
        .double-column-paper {
          column-count: 2;
          column-gap: 2rem;
          column-rule: 1px solid #e5e7eb;
        }
        @media (max-width: 640px) {
          .double-column-paper {
            column-count: 1;
          }
        }
      `}} />

      {/* Guest Mode Banner */}
      {isGuest && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 backdrop-blur-md shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 text-amber-700 flex items-center justify-center shrink-0 text-lg font-bold">
              👤
            </div>
            <div>
              <h4 className="text-sm font-black flex items-center gap-2">
                <span>You are previewing in Guest Mode</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-[#3C128D] font-bold uppercase tracking-wider">Session Only</span>
              </h4>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                You can edit and preview questions freely. Sign in with Google, Microsoft, or Email to permanently save and download PDF/Word files.
              </p>
            </div>
          </div>
          <button
            onClick={() => onRequireAuth?.('save', 'Sign in to save this question paper to your account permanently and download PDF/Word.')}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all shrink-0 cursor-pointer"
          >
            Sign In to Save & Download
          </button>
        </div>
      )}
      
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-center mb-6 gap-4 md:gap-6 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl shadow-lg z-20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
        <div className="flex flex-wrap items-center gap-4">
             <button onClick={onBack} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 font-bold transition-colors cursor-pointer">
                ← Dashboard
            </button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => {
                        setViewMode('edit');
                        setShowAnswerKey(false);
                    }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${viewMode === 'edit' ? 'bg-white dark:bg-slate-700 shadow text-[#3C128D] dark:text-purple-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit Mode
                </button>
                <button 
                    onClick={() => setViewMode('preview')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 shadow text-[#3C128D] dark:text-purple-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
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
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        isEditingEnabled 
                        ? 'bg-[#8A2CB0] text-white border-[#8A2CB0] shadow-md scale-105' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-[#8A2CB0]/50'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit Text
                </button>
            )}

            {/* Layout Settings Quick Button */}
            <button 
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 hover:border-[#8A2CB0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer shadow-2xs hover:shadow-sm"
                title="Configure layout columns, instructions page, and answer key"
            >
                <Sliders className="w-3.5 h-3.5 text-[#8A2CB0]" />
                <span className="hidden sm:inline">Layout Settings</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-[#3C128D] dark:text-purple-300 font-black">
                    {layoutSettings.columnLayout === 'double' ? '2-Col' : '1-Col'}
                </span>
            </button>

            {/* All-Subject Template Pack Specification Showcase Button */}
            <button
                onClick={() => setIsShowcaseModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-sky-300 dark:border-sky-700/60 hover:border-[#005A70] text-[#005A70] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 cursor-pointer shadow-2xs hover:shadow-sm"
                title="Inspect the PDF template specification across Mathematics, Science, English, Telugu, Hindi, AI, PAT, etc."
            >
                <BookOpen className="w-3.5 h-3.5 text-[#005A70] dark:text-sky-400" />
                <span className="hidden sm:inline">PDF Template Specification</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#005A70] text-white font-black">
                    All-Subjects
                </span>
            </button>

            {/* Syncing/Saved Status */}
            <div className="flex items-center gap-2 min-w-[80px]">
                {isSaving ? (
                    <div className="flex items-center gap-1.5 text-slate-400 animate-pulse">
                        <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Syncing...</span>
                    </div>
                ) : hasUnsavedChanges ? (
                    <div className="flex items-center gap-1.5 text-blue-500 animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Unsaved</span>
                    </div>
                ) : showSavedToast ? (
                    <div className="flex items-center gap-1.5 text-emerald-500 animate-fade-in">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Saved</span>
                    </div>
                ) : null}
            </div>
        </div>

        {viewMode === 'preview' ? (
          <div className="flex items-center gap-3 ml-auto">
               <button 
                 onClick={() => {
                   const nextVal = !showAnswerKey;
                   setShowAnswerKey(nextVal);
                   setLayoutSettings(prev => ({ ...prev, showAnswerKey: nextVal }));
                 }} 
                 className={`btn-glass px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                   showAnswerKey ? 'bg-purple-100 text-[#3C128D] border-purple-300 dark:bg-purple-900/40' : 'btn-glass-secondary'
                 }`}
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                 </svg>
                 {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
               </button>
               <div className="flex items-center gap-2 bg-purple-50 dark:bg-slate-800 p-1 rounded-lg border border-purple-200 dark:border-slate-700">
                    <select 
                      value={layoutSettings.downloadFormat} 
                      onChange={(e) => {
                        const fmt = e.target.value as any;
                        setDownloadFormat(fmt);
                        setLayoutSettings(prev => ({ ...prev, downloadFormat: fmt }));
                      }} 
                      className="bg-transparent border-none text-slate-800 dark:text-slate-100 text-xs font-bold focus:ring-0 cursor-pointer dark-dropdown rounded px-2 py-1"
                    >
                      <option value="pdf">PDF</option>
                      <option value="word">Word</option>
                      <option value="txt">Txt</option>
                    </select>
                    <button 
                      onClick={() => setIsConfigModalOpen(true)} 
                      className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
               </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={() => {
                setViewMode('preview');
                setIsConfigModalOpen(true);
              }} 
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
          
          {/* EDIT MODE: Interactive Grid */}
          {viewMode === 'edit' && !showAnswerKey && (
              <div className="space-y-8">
                  {/* Group Questions by Section */}
                  {Array.from(new Set(questions.map(q => q.section))).map((section) => (
                      <div key={section} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-sm">
                          <h3 className="text-lg font-bold text-[#3C128D] dark:text-purple-300 mb-4 border-b border-slate-200 dark:border-white/10 pb-2">{section}</h3>
                          <div className="grid grid-cols-1 gap-4">
                              {questions.filter(q => q.section === section).map((q, idx) => {
                                  return (
                                    <motion.div
                                        key={q.question_id}
                                        initial={{ opacity: 0, y: 22, scale: 0.99 }}
                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                        viewport={{ once: true, amount: 0.08, margin: "0px 0px -50px 0px" }}
                                        transition={{ 
                                            duration: 0.45, 
                                            delay: Math.min((idx % 6) * 0.07, 0.35), 
                                            ease: [0.21, 0.47, 0.32, 0.98] 
                                        }}
                                    >
                                      <QuestionCard 
                                          question={q} 
                                          index={idx} 
                                          onRegenerate={handleRegenerateQuestion} 
                                          onUpdateText={handleUpdateQuestionText}
                                          onUpdateOption={handleUpdateQuestionOption}
                                          onRetryDiagram={handleRetryDiagram}
                                          onRemoveDiagram={handleRemoveDiagram}
                                          isEditingEnabled={isEditingEnabled}
                                      />
                                    </motion.div>
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* PREVIEW MODE: Clean Paper using All-Subject PDF Specification Template */}
          {(viewMode === 'preview' || showAnswerKey) && (
              <div ref={printRef} className="bg-white rounded-lg min-h-[800px] flex flex-col p-2 sm:p-6 print:p-0 print:shadow-none print:border-none shadow-xl shadow-gray-200/50 border border-gray-200 text-gray-900">
                 
                 {/* STANDALONE ANSWER KEY VIEW (When user clicks toolbar 'Show Answer Key' button) */}
                 {showAnswerKey ? (
                     <div className="p-6">
                         <div className="border-b-2 border-[#005A70] pb-6 mb-8 text-center">
                             {schoolName && <h2 style={{ fontFamily: effectiveHeadingFont }} className="text-2xl font-bold uppercase tracking-widest text-[#005A70]">{schoolName}</h2>}
                             <h1 style={{ fontFamily: effectiveHeadingFont }} className="text-xl font-bold mt-2 text-purple-900">{paper.title} — ANSWER KEY & MARKING SCHEME</h1>
                             <p style={{ fontFamily: effectiveBodyFont }} className="text-sm font-medium text-gray-600 mt-1">Subject: {paper.config.subject} • Total Marks: {paper.config.totalMarks}</p>
                         </div>
                         <AnswerKeyRenderer 
                            rawText={paper.answerKey}
                            isEditingEnabled={isEditingEnabled}
                            onUpdate={(newText) => {
                                if (newText !== paper.answerKey) {
                                    handleUpdateAnswerKey(newText);
                                }
                            }}
                         />
                     </div>
                 ) : (
                     <QuestionPaperTemplate
                       paper={{ ...paper, questions }}
                       layoutSettings={layoutSettings}
                       processedLogo={processedLogo}
                       isEditingEnabled={isEditingEnabled}
                       onUpdateQuestionText={handleUpdateQuestionText}
                       onUpdateQuestionOption={handleUpdateQuestionOption}
                       onUpdateAnswerKey={handleUpdateAnswerKey}
                     />
                 )}
              </div>
          )}
      </div>

      {/* Configuration Modal */}
      <PaperLayoutModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        settings={layoutSettings}
        onUpdateSettings={(newSettings) => {
          setLayoutSettings(newSettings);
          setDownloadFormat(newSettings.downloadFormat);
          if (newSettings.showAnswerKey !== layoutSettings.showAnswerKey) {
            setShowAnswerKey(newSettings.showAnswerKey);
          }
        }}
        onApplyAndPreview={() => {
          setIsConfigModalOpen(false);
          setViewMode('preview');
        }}
        onDownload={(format) => {
          setIsConfigModalOpen(false);
          handleDownload(format);
        }}
        isDownloading={isDownloading}
        totalQuestions={questions.length}
        totalMarks={paper.config.totalMarks}
        subject={paper.config.subject}
        hasAnswerKey={Boolean(paper.answerKey)}
        questions={questions}
      />

      {/* All-Subject Template Showcase Specification Modal */}
      <TemplateShowcaseModal
        isOpen={isShowcaseModalOpen}
        onClose={() => setIsShowcaseModalOpen(false)}
        currentPaper={paper}
        onSelectSubjectTemplate={(subj) => {
          setViewMode('preview');
        }}
      />
    </div>
  );
};

export default PaperPreview;