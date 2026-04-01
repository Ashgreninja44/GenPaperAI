
import React, { useState } from 'react';
import { QuestionBank } from '../types';
import { CURRICULUM_DATA, GRADES, BOARDS } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';
import { generateQuestionBankUpdate } from '../services/geminiService';

interface QuestionBankProps {
  banks: QuestionBank[];
  onUpdateBank: (bank: QuestionBank) => void;
  onDeleteBank: (id: string) => void;
  onBack: () => void;
}

const QuestionBankView: React.FC<QuestionBankProps> = ({ banks, onUpdateBank, onDeleteBank, onBack }) => {
  const [selectedBoard, setSelectedBoard] = useState<string>(BOARDS[0]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Construct precise subject name for lookups
  // Since Telugu is removed, we use the raw selected subject.
  const displaySubjectName = selectedSubject;

  // Find existing bank matching criteria
  const currentBank = banks.find(b => 
    b.subject === displaySubjectName && 
    b.grade === selectedClass && 
    (b.board === selectedBoard || (!b.board && selectedBoard === BOARDS[0]))
  );

  const handleUpdate = async () => {
    if (!selectedSubject || !selectedClass) return;
    
    setIsUpdating(true);
    try {
      // Use the explicit display name as the subject so AI knows context
      const newContent = await generateQuestionBankUpdate(displaySubjectName, selectedClass, selectedBoard);
      
      const updatedBank: QuestionBank = currentBank 
        ? {
            ...currentBank,
            board: selectedBoard,
            lastUpdated: Date.now(),
            content: `### Update: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n${newContent}\n\n---\n\n${currentBank.content}`
          }
        : {
            id: crypto.randomUUID(),
            board: selectedBoard,
            subject: displaySubjectName,
            grade: selectedClass,
            lastUpdated: Date.now(),
            content: `### Question Bank: ${displaySubjectName} (${selectedClass}) - ${selectedBoard}\n\n${newContent}`
          };
      
      onUpdateBank(updatedBank);
    } catch (error) {
      console.error(error);
      alert("Failed to update question bank. Please check your connection or API limit.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownload = () => {
    if (!currentBank) return;
    const blob = new Blob([currentBank.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QuestionBank_${currentBank.subject.replace(/[^a-zA-Z0-9]/g, '_')}_${currentBank.grade}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBoard(e.target.value);
    setSelectedClass('');
    setSelectedSubject('');
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedSubject('');
  };

  // Get subjects based on selected class and board
  const boardData = CURRICULUM_DATA[selectedBoard];
  const classData = boardData ? boardData[selectedClass] : null;
  const availableSubjects = classData ? Object.keys(classData) : [];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button 
          onClick={onBack}
          className="text-white hover:text-white/80 flex items-center gap-2 font-medium drop-shadow-sm transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md flex items-center gap-3 justify-center text-center">
          Master Question Bank
          <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-[#3C128D] text-[10px] sm:text-xs font-black uppercase tracking-tighter shadow-md border border-amber-500/40 flex-shrink-0">
            🚧 Beta
          </span>
        </h1>
      </div>

      {/* Beta Warning Banner */}
      <div className="mb-8 glass-panel border-l-4 border-amber-500 p-4 flex items-start gap-4 animate-fade-in bg-amber-50/10">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-amber-900 text-sm">Beta Feature</h4>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-200 text-amber-700 text-[10px] cursor-help" title="We are actively improving this feature. Full functionality coming soon.">ℹ️</span>
          </div>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            This feature is currently in Beta. Some functions may not work as expected. We are actively improving this feature. Full functionality coming soon.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="font-bold text-gray-700 mb-4 border-b border-gray-200/50 pb-2">Select Context</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Board / Curriculum</label>
                <select 
                  className="w-full px-3 py-2.5 rounded-lg border dark-dropdown text-sm"
                  value={selectedBoard}
                  onChange={handleBoardChange}
                >
                  {BOARDS.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Class / Grade</label>
                <select 
                  className="w-full px-3 py-2.5 rounded-lg border dark-dropdown text-sm"
                  value={selectedClass}
                  onChange={handleClassChange}
                >
                  <option value="">Select Class</option>
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Subject</label>
                <select 
                  className="w-full px-3 py-2.5 rounded-lg border dark-dropdown text-sm disabled:opacity-50"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">
                    {!selectedClass ? 'Select Class first' : 'Select Subject'}
                  </option>
                  {availableSubjects.map(subj => (
                    <option key={subj} value={subj}>
                        {subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={!selectedSubject || !selectedClass || isUpdating}
              className={`btn-glass btn-glass-primary w-full mt-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2
                ${(!selectedSubject || !selectedClass || isUpdating) 
                    ? 'opacity-60 cursor-not-allowed shadow-none' 
                    : 'active:scale-95'
                }
              `}
            >
              {isUpdating ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                currentBank ? 'Add Questions' : 'Create Bank'
              )}
            </button>
          </div>
          
          {currentBank && (
            <div className="glass-panel p-4 rounded-xl border-l-4 border-[#8A2CB0] text-sm">
               <p className="font-bold text-[#3C128D] mb-1">Status: Active</p>
               <p className="text-gray-600 text-xs">Last updated: {new Date(currentBank.lastUpdated).toLocaleDateString()}</p>
               <button 
                 onClick={handleDownload}
                 className="mt-3 text-xs font-bold text-[#8A2CB0] hover:text-[#3C128D] underline block"
               >
                 Download Content (.txt)
               </button>
               <button 
                 onClick={() => {
                    if(window.confirm("Are you sure you want to delete this entire question bank?")) {
                        onDeleteBank(currentBank.id);
                    }
                 }}
                 className="mt-2 text-xs font-bold text-rose-500 hover:text-rose-700 underline block"
               >
                 Delete Bank
               </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-xl min-h-[600px] flex flex-col overflow-hidden bg-white">
            {currentBank ? (
              <div className="p-8 paper-font overflow-y-auto max-h-[800px]">
                <MarkdownRenderer content={currentBank.content} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10"></path>
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600">Question Bank Empty</h3>
                <p className="max-w-md mt-2 text-sm">Select a Class, Subject, and Syllabus Version from the sidebar to create or view a repository.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestionBankView;