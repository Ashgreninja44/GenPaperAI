
import React, { useState, useRef, useEffect } from 'react';
import { Question } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { improveSelectedText } from '../services/geminiService';

interface QuestionCardProps {
  question: Question;
  index: number;
  onRegenerate: (id: string, newDiff: number, instruction: string) => Promise<void>;
  onUpdateText: (id: string, newText: string) => void;
  onUpdateOption: (id: string, optionIndex: number, newText: string) => void;
  onRetryDiagram?: (id: string) => Promise<void>;
  onRemoveDiagram?: (id: string) => void;
  isEditingEnabled: boolean;
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-700 border-green-200',
  2: 'bg-teal-100 text-teal-700 border-teal-200',
  3: 'bg-blue-100 text-blue-700 border-blue-200',
  4: 'bg-orange-100 text-orange-700 border-orange-200',
  5: 'bg-red-100 text-red-700 border-red-200'
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Moderate',
  4: 'Hard',
  5: 'HOTS'
};

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  index, 
  onRegenerate, 
  onUpdateText, 
  onUpdateOption, 
  onRetryDiagram,
  onRemoveDiagram,
  isEditingEnabled 
}) => {
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [instruction, setInstruction] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isRetryingDiagramLocal, setIsRetryingDiagramLocal] = useState(false);
  
  // Floating Toolbar State
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [activeField, setActiveField] = useState<{ type: 'question' | 'option'; index?: number } | null>(null);
  
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isEditingEnabled) return;
      
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Find if selection is within our editable fields
        let node = sel.anchorNode;
        let isWithinEditable = false;
        let fieldInfo: { type: 'question' | 'option'; index?: number } | null = null;

        while (node) {
          if (node instanceof HTMLElement) {
            const field = node.getAttribute('data-field');
            if (field) {
              isWithinEditable = true;
              if (field === 'question') {
                fieldInfo = { type: 'question' };
              } else if (field.startsWith('option-')) {
                fieldInfo = { type: 'option', index: parseInt(field.split('-')[1]) };
              }
              break;
            }
          }
          node = node.parentNode;
        }

        if (isWithinEditable) {
          setToolbarPos({
            top: rect.top + window.scrollY - 40,
            left: rect.left + window.scrollX + (rect.width / 2) - 60
          });
          setSelection(sel);
          setActiveField(fieldInfo);
        } else {
          setToolbarPos(null);
        }
      } else {
        setToolbarPos(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isEditingEnabled]);

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    setToolbarPos(null);
  };

  const handleImprove = async () => {
    if (!selection || !activeField) return;
    
    const selectedText = selection.toString();
    setIsImproving(true);
    setToolbarPos(null);

    try {
      const improvedText = await improveSelectedText(selectedText, question.question_text);
      
      // Replace selection with improved text
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(improvedText));
      
      // Trigger save
      if (activeField.type === 'question') {
        const el = document.querySelector(`[data-id="${question.question_id}"][data-field="question"]`) as HTMLElement;
        if (el) onUpdateText(question.question_id, el.innerText);
      } else if (activeField.type === 'option' && activeField.index !== undefined) {
        const el = document.querySelector(`[data-id="${question.question_id}"][data-field="option-${activeField.index}"]`) as HTMLElement;
        if (el) onUpdateOption(question.question_id, activeField.index, el.innerText);
      }
    } catch (error) {
      console.error("Improvement failed", error);
    } finally {
      setIsImproving(false);
    }
  };

  const isGeneratingDiagram = !question.image_url && (
    question.diagram_status === 'generating' || 
    (!question.diagram_status && Boolean(question.diagram_prompt))
  );
  const isRetryingDiagram = !question.image_url && question.diagram_status === 'retrying';
  const isFailedDiagram = !question.image_url && question.diagram_status === 'failed';

  const handleManualRetryDiagram = async () => {
    if (!onRetryDiagram) return;
    setIsRetryingDiagramLocal(true);
    try {
      await onRetryDiagram(question.question_id);
    } finally {
      setIsRetryingDiagramLocal(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await onRegenerate(question.question_id, difficulty, instruction);
    setIsRegenerating(false);
    setInstruction(''); // Clear instruction after success
  };

  return (
    <div className={`group relative bg-white border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-[#8A2CB0]/30 ${isRegenerating ? 'opacity-70 animate-pulse' : ''}`}>
      
      {/* Header: Badge & Meta */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400 text-sm">Q{index + 1}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[difficulty]}`}>
                {DIFFICULTY_LABELS[difficulty]}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                {question.topic}
            </span>
            {question.is_manually_edited && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Edited
              </span>
            )}
        </div>
        <span className="text-xs font-bold text-gray-600">{question.marks} Mark{question.marks > 1 ? 's' : ''}</span>
      </div>

      {/* Floating Toolbar */}
      {toolbarPos && (
        <div 
          ref={toolbarRef}
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
          className="fixed z-[100] bg-gray-900 text-white rounded-lg shadow-xl flex items-center p-1 gap-1 animate-in fade-in zoom-in duration-200"
        >
          <button onClick={() => handleFormat('bold')} className="p-1.5 hover:bg-gray-700 rounded transition-colors" title="Bold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path></svg>
          </button>
          <button onClick={() => handleFormat('italic')} className="p-1.5 hover:bg-gray-700 rounded transition-colors" title="Italic">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 20l4-16m4 0h4M4 20h4"></path></svg>
          </button>
          <div className="w-px h-4 bg-gray-700 mx-0.5"></div>
          <button 
            onClick={handleImprove}
            disabled={isImproving}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-purple-600 rounded transition-colors text-[10px] font-bold"
          >
            {isImproving ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            )}
            AI Improve
          </button>
        </div>
      )}

      {/* Question Content */}
      <div className="mb-4 text-gray-800 text-sm leading-relaxed">
        <div 
          contentEditable={isEditingEnabled}
          data-id={question.question_id}
          data-field="question"
          onBlur={(e) => {
            const newText = e.currentTarget.innerText;
            if (newText !== question.question_text) {
              onUpdateText(question.question_id, newText);
            }
          }}
          suppressContentEditableWarning={true}
          className={`outline-none transition-all whitespace-pre-wrap cursor-text ${
            isEditingEnabled 
            ? 'focus:ring-2 focus:ring-[#8A2CB0]/20 rounded p-1 -m-1 hover:bg-gray-50/50 border border-dashed border-[#8A2CB0]/30' 
            : ''
          }`}
          title={isEditingEnabled ? "Click to edit question text" : ""}
        >
          {question.question_text}
        </div>
        
        {/* Diagram / Image Section */}
        {question.image_url && (
          <div className="my-4 border border-gray-200 rounded-lg p-2.5 bg-white w-fit max-w-full shadow-sm relative group/img">
            <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-gray-100">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Nano-Banana Diagram
              </span>
              {isEditingEnabled && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleManualRetryDiagram}
                    disabled={isRetryingDiagramLocal}
                    className="text-[10px] font-medium text-gray-500 hover:text-purple-600 px-1.5 py-0.5 rounded hover:bg-purple-50 transition-colors"
                    title="Regenerate this diagram"
                  >
                    {isRetryingDiagramLocal ? 'Generating...' : 'Regenerate'}
                  </button>
                  {onRemoveDiagram && (
                    <button
                      onClick={() => onRemoveDiagram(question.question_id)}
                      className="text-[10px] font-medium text-gray-400 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
                      title="Remove diagram"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
            <img 
              src={question.image_url} 
              alt="Question Diagram" 
              className="max-h-64 object-contain mx-auto rounded"
            />
          </div>
        )}

        {/* Retrying State for Diagram */}
        {isRetryingDiagram && (
          <div className="my-4 p-3.5 border border-amber-200 rounded-lg bg-amber-50/70 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-amber-800">
                  Retrying diagram generation (Attempt {question.diagram_retry_count || 2} of 3)...
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded">
                Auto-Retrying
              </span>
            </div>
            {question.diagram_prompt && (
              <p className="text-[11px] text-amber-700 italic border-l-2 border-amber-300 pl-2">
                "{question.diagram_prompt.slice(0, 120)}{question.diagram_prompt.length > 120 ? '...' : ''}"
              </p>
            )}
          </div>
        )}
        
        {/* Initial Generating State for Diagram */}
        {isGeneratingDiagram && !isRetryingDiagram && !isFailedDiagram && (
          <div className="my-4 p-3.5 border border-dashed border-purple-300 rounded-lg bg-purple-50/50 flex flex-col gap-2 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-purple-900">
                  Generating Nano-Banana Diagram...
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                In Progress
              </span>
            </div>
            {question.diagram_prompt && (
              <p className="text-[11px] text-purple-700 italic border-l-2 border-purple-300 pl-2">
                "{question.diagram_prompt.slice(0, 120)}{question.diagram_prompt.length > 120 ? '...' : ''}"
              </p>
            )}
          </div>
        )}

        {/* Failed State for Diagram with Fallback & Recovery Controls */}
        {isFailedDiagram && (
          <div className="my-4 p-3.5 border border-red-200 rounded-lg bg-red-50/60 flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                  <span className="text-xs font-bold text-red-900 block">
                    Diagram generation failed
                  </span>
                  <span className="text-[11px] text-red-700 block">
                    {question.diagram_error || "The diagram could not be rendered automatically. You can retry or proceed with text only."}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded shrink-0">
                Failed
              </span>
            </div>

            {question.diagram_prompt && (
              <div className="text-[11px] text-gray-600 bg-white/80 p-2 rounded border border-red-100">
                <span className="font-semibold text-gray-700">Prompt: </span>
                <span className="italic">{question.diagram_prompt}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleManualRetryDiagram}
                disabled={isRetryingDiagramLocal}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
              >
                {isRetryingDiagramLocal ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Retry Diagram Generation</span>
                  </>
                )}
              </button>

              {onRemoveDiagram && (
                <button
                  type="button"
                  onClick={() => onRemoveDiagram(question.question_id)}
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded text-xs font-medium transition-colors"
                >
                  Dismiss / Use Text Only
                </button>
              )}
            </div>
          </div>
        )}

        {/* MCQ Options */}
        {question.options && question.options.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.options.map((opt, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50/50 p-2 rounded border border-gray-100">
                <span className="font-bold text-[#8A2CB0]">{String.fromCharCode(65 + i)})</span>
                <div 
                  contentEditable={isEditingEnabled}
                  data-id={question.question_id}
                  data-field={`option-${i}`}
                  onBlur={(e) => {
                    const newText = e.currentTarget.innerText;
                    if (newText !== opt) {
                      onUpdateOption(question.question_id, i, newText);
                    }
                  }}
                  suppressContentEditableWarning={true}
                  className={`flex-1 outline-none transition-all whitespace-pre-wrap cursor-text ${
                    isEditingEnabled 
                    ? 'focus:ring-2 focus:ring-[#8A2CB0]/20 rounded px-1 hover:bg-white border border-dashed border-[#8A2CB0]/20' 
                    : ''
                  }`}
                  title={isEditingEnabled ? "Click to edit option" : ""}
                >
                  {opt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Controls - Visible on Hover or if Expanded */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3 items-center opacity-40 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
         
         {/* Difficulty Selector */}
         <div className="flex items-center gap-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase">Diff:</label>
             <div className="flex bg-gray-100 rounded-lg p-0.5">
                 {[1, 2, 3, 4, 5].map((lvl) => (
                     <button
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-md transition-all
                            ${difficulty === lvl ? 'bg-white shadow text-[#3C128D]' : 'text-gray-400 hover:bg-gray-200'}`}
                        title={DIFFICULTY_LABELS[lvl]}
                     >
                         {lvl}
                     </button>
                 ))}
             </div>
         </div>

         {/* Instruction Input */}
         <div className="flex-1 min-w-[200px]">
             <input 
                type="text" 
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Ex: Make it numerical, Use real life example..."
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#8A2CB0] outline-none transition-all"
             />
         </div>

         {/* Regenerate Button */}
         <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="btn-glass btn-glass-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#8A2CB0] hover:text-white"
         >
            <svg className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Regenerate
         </button>

      </div>
    </div>
  );
};

export default QuestionCard;
