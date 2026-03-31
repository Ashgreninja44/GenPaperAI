import React, { useState } from 'react';

interface AnswerItem {
  questionNumber: string;
  answerText: string;
  isMCQ: boolean;
  points: string[];
}

interface AnswerKeyRendererProps {
  rawText: string;
  isEditingEnabled: boolean;
  onUpdate: (newText: string) => void;
}

const AnswerKeyRenderer: React.FC<AnswerKeyRendererProps> = ({ rawText, isEditingEnabled, onUpdate }) => {
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  const parseAnswerKey = (text: string): AnswerItem[] => {
    // Split by question markers: Q1, Q2, 1., 2., or |
    // First, normalize | to newlines if they exist
    const normalizedText = text.replace(/\|/g, '\n');
    
    // Regex to find question markers like Q1., Q1:, 1., 1:
    const questionRegex = /(?:^|\n)(?:Q)?(\d+)(?:\.|\:)\s*/gi;
    
    const parts = normalizedText.split(questionRegex);
    // parts[0] is text before first question
    // parts[1] is question number, parts[2] is answer text, parts[3] is next question number...
    
    const items: AnswerItem[] = [];
    
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i += 2) {
        const qNum = parts[i];
        const qText = parts[i + 1]?.trim() || '';
        
        // Detect MCQ: single letter or letter followed by text
        const isMCQ = /^[A-D](\s|$)/i.test(qText);
        
        // Detect points: 1., 2., 3. or bullets
        const pointsRegex = /(?:\n|^)\s*(?:\d+[\.\)]|\*|\-)\s+/g;
        const points = qText.split(pointsRegex).map(p => p.trim()).filter(p => p.length > 0);
        
        items.push({
          questionNumber: `Q${qNum}`,
          answerText: qText,
          isMCQ,
          points: points.length > 1 ? points : []
        });
      }
    } else {
      // Fallback if no question markers found, split by lines
      const lines = normalizedText.split('\n').filter(l => l.trim().length > 0);
      lines.forEach((line, idx) => {
        const isMCQ = /^[A-D](\s|$)/i.test(line.trim());
        items.push({
          questionNumber: `A${idx + 1}`,
          answerText: line.trim(),
          isMCQ,
          points: []
        });
      });
    }
    
    return items;
  };

  const answers = parseAnswerKey(rawText);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    alert('Answer key copied to clipboard!');
  };

  if (isEditingEnabled) {
    return (
      <div className="bg-yellow-50 p-6 rounded border-l-4 border-yellow-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-yellow-800">EDIT ANSWER KEY (RAW)</h2>
          <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-bold">RAW MODE</span>
        </div>
        <textarea
          value={rawText}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full min-h-[300px] bg-white/50 border border-yellow-200 rounded p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all"
          placeholder="Enter answer key text here... Use Q1. Q2. format or | to separate."
        />
        <p className="mt-2 text-[10px] text-yellow-700 italic">
          Tip: Use "Q1. Answer" format for best results. Use "|" for quick separation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .break-inside-avoid {
            break-inside: avoid !important;
            -webkit-column-break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-yellow-200 shadow-sm no-print">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-[#3C128D] flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
            ANSWER KEY
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${viewMode === 'detailed' ? 'bg-white shadow text-[#3C128D]' : 'text-gray-500'}`}
            >
              Detailed
            </button>
            <button 
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${viewMode === 'compact' ? 'bg-white shadow text-[#3C128D]' : 'text-gray-500'}`}
            >
              Compact
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-bold transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
            </svg>
            Copy Text
          </button>
        </div>
      </div>

      <div className={viewMode === 'compact' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3' : 'grid grid-cols-1 gap-6'}>
        {answers.map((item, idx) => (
          <div 
            key={idx} 
            className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md break-inside-avoid page-break-inside-avoid ${
              viewMode === 'compact' ? 'p-3' : 'p-6'
            }`}
            style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-2">
              <span className="font-black text-[#3C128D] text-lg">{item.questionNumber}</span>
              <div className="h-4 w-px bg-gray-200"></div>
              {item.isMCQ ? (
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                  Multiple Choice
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                  Descriptive
                </span>
              )}
            </div>
            
            <div className="text-gray-800 text-sm leading-relaxed">
              {item.isMCQ ? (
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Correct Option:</span>
                  <span className="w-10 h-10 flex items-center justify-center bg-[#3C128D] text-white rounded-md font-black shadow-sm text-lg">
                    {item.answerText.charAt(0).toUpperCase()}
                  </span>
                  {item.answerText.length > 2 && (
                    <span className="text-gray-700 font-medium ml-1">{item.answerText.substring(2)}</span>
                  )}
                </div>
              ) : item.points.length > 0 ? (
                <div className="space-y-3">
                   <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest block mb-1">Marking Scheme / Answer:</span>
                   <ul className="space-y-2">
                     {item.points.map((p, pIdx) => (
                       <li key={pIdx} className="flex gap-3 items-start">
                         <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3C128D] shrink-0"></span>
                         <span className="text-gray-700">{p}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest block mb-1">Answer:</span>
                  <p className="whitespace-pre-wrap text-gray-700">{item.answerText}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerKeyRenderer;
