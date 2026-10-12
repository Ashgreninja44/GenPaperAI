import React from 'react';
import { GeneratedPaper, Question } from '../types';
import MathRenderer from './MathRenderer';
import MarkdownRenderer from './MarkdownRenderer';
import AnswerKeyRenderer from './AnswerKeyRenderer';
import { PaperLayoutSettings } from './PaperLayoutModal';

export interface QuestionPaperTemplateProps {
  paper: GeneratedPaper;
  layoutSettings: PaperLayoutSettings;
  processedLogo?: string | null;
  isPlaceholderMode?: boolean;
  placeholderSubject?: string;
  isEditingEnabled?: boolean;
  onUpdateQuestionText?: (questionId: string, text: string) => void;
  onUpdateQuestionOption?: (questionId: string, index: number, text: string) => void;
  onUpdateAnswerKey?: (keyText: string) => void;
}

// Subject Layout Descriptors aligned with PDF spec
export const SUBJECT_LAYOUT_DESCRIPTORS: Record<string, {
  layoutName: string;
  description: string;
  specialContentLabel: string;
  optionsLabel: string;
  fontFamily?: string;
}> = {
  'Mathematics': {
    layoutName: 'Equations, numerical work, geometry and graphs',
    description: 'Inline/display mathematics, geometric figures, coordinate planes, numerical problem sets',
    specialContentLabel: 'GEOMETRY FIGURE / GRAPH / COORDINATE PLANE',
    optionsLabel: 'OPTIONS / DATA'
  },
  'Science': {
    layoutName: 'Physics, Chemistry and Biology',
    description: 'Chemical equations, physics formulas, scientific notation, experiment setups, observation tables',
    specialContentLabel: 'LABELLED DIAGRAM / EXPERIMENT / BIOLOGICAL FIGURE',
    optionsLabel: 'OBSERVATION TABLE / DATA TABLE'
  },
  'English': {
    layoutName: 'Reading, literature, grammar and writing',
    description: 'Reading passages, literature extracts with preserved paragraphs, grammar tasks, writing prompts',
    specialContentLabel: 'GRAMMAR QUESTION / SENTENCE / LITERATURE EXTRACT',
    optionsLabel: 'WRITING TASK PROMPT / ESSAY'
  },
  'Social Studies': {
    layoutName: 'History, Geography, Civics and Economics',
    description: 'Source extracts, case studies, map-work placeholders, timelines, data tables and charts',
    specialContentLabel: 'MAP / MAP-WORK PLACEHOLDER / HISTORICAL TIMELINE',
    optionsLabel: 'SOURCE TABLE / CHART / SOURCE IMAGE'
  },
  'Telugu': {
    layoutName: 'Telugu script, prose, poetry, grammar and writing',
    description: 'Native Telugu script (పద్యం, గద్యం, వ్యాకరణం), literature extracts and writing tasks',
    specialContentLabel: 'పద్యం / గద్యం / వ్యాకరణ ప్రstyle (POETRY / PROSE / GRAMMAR)',
    optionsLabel: 'వ్యాసరూప ప్రశ్నలు / సృజనాత్మకత (WRITING TASKS)',
    fontFamily: "'Noto Sans Telugu', 'Noto Serif Telugu', 'Gidugu', 'Peddana', sans-serif"
  },
  'Hindi': {
    layoutName: 'Devanagari script, prose, poetry, grammar and writing',
    description: 'Devanagari script (अपठित गद्यांश, काव्यांश, व्याकरण), literature extracts and creative writing',
    specialContentLabel: 'अपठित गद्यांश / काव्यांश / व्याकरण (PROSE / POETRY / GRAMMAR)',
    optionsLabel: 'रचनात्मक लेखन / निबंध (CREATIVE WRITING / ESSAY)',
    fontFamily: "'Noto Sans Devanagari', 'Noto Serif Devanagari', 'Rozha One', sans-serif"
  },
  'Artificial Intelligence': {
    layoutName: 'Concepts, technical terminology and case studies',
    description: 'Technical terminology, scenario case studies, code blocks, workflow process diagrams',
    specialContentLabel: 'WORKFLOW / PROCESS DIAGRAM / ALGORITHM FLOWCHART',
    optionsLabel: 'CODE BLOCK / TECHNICAL TERMS / STRUCTURED DATA'
  },
  'PAT': {
    layoutName: 'Configurable assessment layout; do not assume one fixed PAT meaning',
    description: 'Assessment format as provided by configuration (Periodic Assessment Test / Progress Test)',
    specialContentLabel: 'ASSESSMENT ACTIVITY / TASK PROMPT',
    optionsLabel: 'MCQ / SHORT ANSWER / LONG ANSWER / CONFIGURED TYPE'
  },
  'Other Subjects': {
    layoutName: 'Flexible fallback for all other subjects',
    description: 'Adaptable layout supporting passages, diagrams, tables, subquestions, and response spaces',
    specialContentLabel: 'DIAGRAM / SOURCE / TABLE / SPECIAL CONTENT',
    optionsLabel: 'ANSWER OPTIONS / CONFIGURED DATA'
  }
};

/**
 * Detects the subject category key from full subject string (e.g. "Class 10 Physics" -> "Science")
 */
export function normalizeSubjectKey(subjectStr?: string): string {
  if (!subjectStr) return 'Other Subjects';
  const s = subjectStr.trim().toLowerCase();
  
  if (s.includes('math') || s.includes('algebra') || s.includes('geometry') || s.includes('calculus')) return 'Mathematics';
  if (s.includes('science') || s.includes('physics') || s.includes('chem') || s.includes('bio')) return 'Science';
  if (s.includes('english') || s.includes('literature')) return 'English';
  if (s.includes('social') || s.includes('history') || s.includes('geography') || s.includes('civics') || s.includes('political') || s.includes('economics') || s.includes('sst')) return 'Social Studies';
  if (s.includes('telugu')) return 'Telugu';
  if (s.includes('hindi')) return 'Hindi';
  if (s.includes('ai') || s.includes('artificial intelligence') || s.includes('computer') || s.includes('it') || s.includes('information tech') || s.includes('coding')) return 'Artificial Intelligence';
  if (s.includes('pat') || s.startsWith('pat') || s.includes('periodic assessment')) return 'PAT';
  
  return 'Other Subjects';
}

export const QuestionPaperTemplate: React.FC<QuestionPaperTemplateProps> = ({
  paper,
  layoutSettings,
  processedLogo,
  isPlaceholderMode = false,
  placeholderSubject,
  isEditingEnabled = false,
  onUpdateQuestionText,
  onUpdateQuestionOption,
  onUpdateAnswerKey
}) => {
  const { config } = paper;
  const activeSubject = isPlaceholderMode ? (placeholderSubject || 'Mathematics') : (config.subject || 'General');
  const subjectKey = normalizeSubjectKey(activeSubject);
  const layoutSpec = SUBJECT_LAYOUT_DESCRIPTORS[subjectKey] || SUBJECT_LAYOUT_DESCRIPTORS['Other Subjects'];

  const schoolName = config.schoolName || '[SCHOOL NAME]';
  const examinationName = paper.title || `${config.testType || 'EXAMINATION'}`;
  const academicSession = config.academicSession || '2026-27';
  const paperCode = `${subjectKey.slice(0, 3).toUpperCase()}-${config.grade ? config.grade.replace(/[^0-9]/g, '') : '10'}`;
  const timeAllowed = config.timeAllowed || '3 Hours';
  const totalMarks = config.totalMarks || 80;
  const gradeLabel = config.grade || 'Class 10';

  // Fonts
  const headingFont = config.headingFont || 'Times New Roman, serif';
  const bodyFont = layoutSpec.fontFamily || config.bodyFont || 'Times New Roman, serif';

  const generalInstructions = config.generalInstructions || 
    `(i) All questions are compulsory unless stated otherwise in individual sections.\n` +
    `(ii) Read each question carefully before attempting.\n` +
    `(iii) Wherever applicable, draw neat and labeled diagrams / show formula steps clearly.`;

  const instructionsList = generalInstructions.split('\n').filter(i => i.trim().length > 0);

  // Group questions by section
  const questionsBySection = React.useMemo(() => {
    if (isPlaceholderMode || !paper.questions || paper.questions.length === 0) {
      return {};
    }
    const grouped: Record<string, Question[]> = {};
    paper.questions.forEach(q => {
      const sect = q.section || 'SECTION A';
      if (!grouped[sect]) grouped[sect] = [];
      grouped[sect].push(q);
    });
    return grouped;
  }, [paper.questions, isPlaceholderMode]);

  const sectionsList = Object.keys(questionsBySection);

  // Render a question item according to subject-aware layout rules
  const renderQuestionItem = (q: Question, index: number, isSubquestion: boolean = false) => {
    const isMcq = q.answer_type === 'MCQ' || (q.options && q.options.length > 0);
    const isCaseStudy = q.answer_type?.toLowerCase().includes('case') || q.question_text?.toLowerCase().includes('case study') || q.question_text?.toLowerCase().includes('read the passage');
    const isCodeBlock = subjectKey === 'Artificial Intelligence' && (q.question_text?.includes('```') || q.question_text?.includes('def ') || q.question_text?.includes('import ') || q.question_text?.includes('class '));

    return (
      <div 
        key={q.question_id || `q-${index}`} 
        className="mb-4 text-gray-900 break-inside-avoid page-break-inside-avoid"
        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2 flex-1">
            <span className="font-bold text-gray-900 shrink-0">{index + 1}.</span>
            <div className="flex-1 space-y-2">
              {/* Question Text */}
              {isEditingEnabled && onUpdateQuestionText ? (
                <textarea
                  value={q.question_text}
                  onChange={(e) => onUpdateQuestionText(q.question_id, e.target.value)}
                  className="w-full p-2 border border-purple-300 rounded text-sm font-serif text-gray-900 bg-purple-50/50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
              ) : isCaseStudy ? (
                <div className="bg-slate-50 border-l-4 border-[#005A70] p-3 rounded-r my-1 text-sm font-serif text-gray-900 leading-relaxed shadow-xs">
                  <MarkdownRenderer content={q.question_text} bodyFont={bodyFont} />
                </div>
              ) : (
                <div className="text-sm font-serif text-gray-900 leading-relaxed">
                  <MarkdownRenderer content={q.question_text} bodyFont={bodyFont} />
                </div>
              )}

              {/* Code Block for AI Subject */}
              {isCodeBlock && !isEditingEnabled && (
                <div className="font-mono bg-slate-900 text-emerald-400 p-3 rounded text-xs overflow-x-auto my-2 border border-slate-700">
                  <pre>{q.question_text.match(/```(?:python|js|json)?\s*([\s\S]*?)\s*```/)?.[1] || q.question_text}</pre>
                </div>
              )}

              {/* Diagram / Special Content Figure */}
              {q.image_url && (
                <div className="my-2 p-1 border border-gray-300 bg-white inline-block rounded shadow-2xs">
                  <img 
                    src={q.image_url} 
                    alt="Question Diagram" 
                    className="max-h-56 max-w-full object-contain mx-auto" 
                  />
                  {q.diagram_prompt && (
                    <p className="text-[10px] text-gray-500 text-center mt-1 italic">{q.diagram_prompt}</p>
                  )}
                </div>
              )}

              {/* MCQ Options */}
              {isMcq && q.options && q.options.length > 0 && (
                <div className={`mt-2.5 grid ${q.options.some(o => o.length > 35) ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-4'} gap-x-4 gap-y-2 text-xs font-serif text-gray-900 pl-2`}>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-baseline gap-1.5 bg-gray-50/60 p-1.5 rounded border border-gray-200">
                      <span className="font-bold text-[#005A70]">({String.fromCharCode(65 + optIdx)})</span>
                      {isEditingEnabled && onUpdateQuestionOption ? (
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => onUpdateQuestionOption(q.question_id, optIdx, e.target.value)}
                          className="flex-1 p-1 border border-purple-200 rounded text-xs bg-white"
                        />
                      ) : (
                        <span className="flex-1"><MathRenderer content={opt} inline /></span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Solution / Answer Space if enabled */}
              {q.solution && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-sans print:hidden">
                  <strong>Answer/Hint:</strong> <MathRenderer content={q.solution} inline />
                </div>
              )}
            </div>
          </div>

          {/* Question Marks Tag */}
          <div className="font-bold text-xs text-[#005A70] bg-sky-50 px-2 py-1 rounded border border-[#005A70]/30 shrink-0 ml-2">
            [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="bg-white text-gray-900 p-6 sm:p-10 md:p-12 print:p-8 max-w-5xl mx-auto shadow-lg print:shadow-none border border-gray-300 print:border-none rounded-lg"
      style={{ fontFamily: bodyFont }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. AUTHORITATIVE SCHOOL HEADER & BRANDING BAR                 */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b-2 border-[#005A70] pb-4 mb-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
          {/* School Logo */}
          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            {processedLogo ? (
              <img src={processedLogo} alt="School Logo" className="max-h-20 max-w-full object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#005A70] to-[#0088A8] text-white flex items-center justify-center text-xs font-black uppercase text-center p-1 border-2 border-[#005A70] shadow-2xs">
                [LOGO]
              </div>
            )}
          </div>

          {/* School Title & Exam Metadata */}
          <div className="flex-1 text-center">
            <h1 style={{ fontFamily: headingFont }} className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#005A70]">
              {schoolName}
            </h1>
            <div className="text-xs font-bold uppercase tracking-wide text-gray-700 mt-1">
              {config.board || 'CBSE'} EXAMINATION • ACADEMIC SESSION {academicSession}
            </div>
            <div className="text-base font-bold text-gray-900 mt-1 uppercase tracking-wide">
              {examinationName} — [{activeSubject.toUpperCase()}]
            </div>
            <div className="text-xs text-gray-600 font-medium mt-0.5">
              Grade: {gradeLabel} • Paper Code: <span className="font-mono font-bold text-[#005A70]">{paperCode}</span>
            </div>
          </div>

          {/* Right Placeholder Cell for Symmetry */}
          <div className="w-20 hidden sm:block"></div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. TIME ALLOWED & MAXIMUM MARKS BORDERED ROW                  */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full border-2 border-[#005A70] bg-white rounded-xs flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x-2 divide-[#005A70] my-3 text-sm font-bold text-gray-900">
          <div className="flex-1 py-2 px-4 text-left flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-600">Time Allowed:</span>
            <span className="text-gray-900 font-extrabold">{timeAllowed}</span>
          </div>
          <div className="flex-1 py-2 px-4 text-right flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-600">Maximum Marks:</span>
            <span className="text-[#005A70] font-extrabold">{totalMarks} Marks</span>
          </div>
        </div>

        {/* Subject Layout Subtitle Note */}
        <div className="text-[11px] font-semibold text-gray-600 tracking-wide uppercase text-center mt-1">
          SUBJECT LAYOUT ({activeSubject.toUpperCase()}): {layoutSpec.layoutName}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. GENERAL INSTRUCTIONS SECTION                               */}
      {/* ------------------------------------------------------------- */}
      <div className="mb-6 p-4 bg-slate-50 border border-gray-300 rounded-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#005A70] mb-2 border-b border-gray-200 pb-1">
          GENERAL INSTRUCTIONS
        </h3>
        <div className="text-xs text-gray-800 space-y-1.5 leading-relaxed font-serif">
          {instructionsList.map((inst, i) => (
            <p key={i}>{inst}</p>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. SECTION BARS & QUESTION LAYOUTS                           */}
      {/* ------------------------------------------------------------- */}

      {isPlaceholderMode ? (
        /* =========================================================== */
        /* PLACEHOLDER SPECIFICATION DEMO LAYOUT FOR PDF SPECIFICATION */
        /* =========================================================== */
        <div className="space-y-6">
          {/* Sample Section Header Bar */}
          <div className="border-2 border-[#005A70] bg-[#E0F2FE] rounded-xs flex items-center justify-between overflow-hidden shadow-2xs">
            <div className="px-3 py-1.5 bg-[#005A70] text-white font-bold text-xs uppercase tracking-widest border-r border-[#005A70]">
              [SECTION A]
            </div>
            <div className="px-4 py-1.5 flex-1 font-extrabold text-sm text-[#005A70] uppercase tracking-wide">
              SECTION TITLE: OBJECTIVE & SHORT QUESTIONS
            </div>
            <div className="px-3 py-1.5 bg-[#005A70] text-white font-bold text-xs uppercase tracking-wider border-l border-[#005A70]">
              [20 MARKS]
            </div>
          </div>

          <div className="text-xs italic text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
            [OPTIONAL SECTION NOTE / DESCRIPTION: Read instructions carefully. Questions carry marks indicated on the right.]
          </div>

          {/* Content Block / Special Content Placeholder */}
          <div className="p-4 border border-dashed border-[#005A70] rounded bg-sky-50/40 space-y-3">
            <div className="font-bold text-xs text-[#005A70] uppercase tracking-wider">
              CONTENT BLOCK / {layoutSpec.specialContentLabel}
            </div>
            <p className="text-xs text-gray-700 font-serif leading-relaxed">
              [SUBJECT SPECIFIC CONTENT: {layoutSpec.description}]
            </p>

            {/* Subject Specific Sample Layout Representation */}
            {subjectKey === 'Mathematics' && (
              <div className="p-3 bg-white border border-gray-300 text-xs font-serif space-y-2">
                <div className="font-bold text-gray-900">Equation & Figure Placeholder:</div>
                <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded my-1 font-mono">
                  <MathRenderer content={"$$\\int_0^\\infty \\frac{x^3}{e^x - 1} \\, dx = \\frac{\\pi^4}{15}$$"} />
                </div>
                <div className="flex justify-between items-center text-gray-700 pt-1">
                  <span>(A) [OPTION A]</span>
                  <span>(B) [OPTION B]</span>
                  <span>(C) [OPTION C]</span>
                  <span>(D) [OPTION D]</span>
                </div>
              </div>
            )}

            {subjectKey === 'Science' && (
              <div className="p-3 bg-white border border-gray-300 text-xs font-serif space-y-2">
                <div className="font-bold text-gray-900">Chemical Equation & Observation Table:</div>
                <div className="text-center font-mono p-1.5 bg-slate-50 rounded">
                  2Na + 2H₂O → 2NaOH + H₂↑ (Exothermic Reaction)
                </div>
                <table className="w-full border-collapse border border-gray-400 text-[11px] my-1 text-center">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-400 font-bold">
                      <th className="p-1 border-r border-gray-400">Sample</th>
                      <th className="p-1 border-r border-gray-400">pH Value</th>
                      <th className="p-1">Inference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border-r border-gray-300">Solution A</td>
                      <td className="p-1 border-r border-gray-300">2.5</td>
                      <td className="p-1">Strong Acid</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {subjectKey === 'Telugu' && (
              <div className="p-3 bg-white border border-gray-300 text-xs font-serif space-y-2" style={{ fontFamily: layoutSpec.fontFamily }}>
                <div className="font-bold text-[#005A70]">తెలుగు పద్యం / గద్య భాగం (TELUGU SCRIPT DEMO):</div>
                <div className="p-2 bg-sky-50/60 rounded border border-sky-200 leading-relaxed text-gray-900 font-medium">
                  సత్యమునకంటె పవిత్రమైన ధర్మము మరొకటి లేదు. విద్య విద్యార్థులకు క్రమశిక్షణను, సదాచారమును నేర్పవలెను.
                </div>
              </div>
            )}

            {subjectKey === 'Hindi' && (
              <div className="p-3 bg-white border border-gray-300 text-xs font-serif space-y-2" style={{ fontFamily: layoutSpec.fontFamily }}>
                <div className="font-bold text-[#005A70]">हिंदी गद्यांश / काव्यांश (DEVANAGARI SCRIPT DEMO):</div>
                <div className="p-2 bg-amber-50/60 rounded border border-amber-200 leading-relaxed text-gray-900 font-medium">
                  शिक्षा केवल ज्ञान अर्जन का साधन नहीं, अपितु चरित्र निर्माण की आधारशिला है। सत्य और अहिंसा भारतीय संस्कृति के मूल मंत्र हैं।
                </div>
              </div>
            )}

            {subjectKey === 'Artificial Intelligence' && (
              <div className="p-3 bg-white border border-gray-300 text-xs font-mono space-y-2">
                <div className="font-bold text-gray-900 font-sans">Structured Code / Scenario Text:</div>
                <pre className="bg-slate-900 text-emerald-400 p-2 rounded text-[11px] overflow-x-auto">
{`import numpy as np
# Train Convolutional Neural Network
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')`}
                </pre>
              </div>
            )}

            {/* Internal Choice Separator Demo */}
            <div className="text-center font-bold text-xs text-[#005A70] tracking-widest my-3 border-y border-dashed border-[#005A70]/40 py-1">
              ── OR (INTERNAL CHOICE SEPARATOR) ──
            </div>

            <div className="text-xs text-gray-600 font-serif">
              SUBPART / CHOICE: (a) [OPTION A SUBQUESTION] OR (b) [OPTION B SUBQUESTION]
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================== */
        /* ACTUAL GENERATED QUESTION PAPER CONTENT                    */
        /* =========================================================== */
        <div className="space-y-6">
          {sectionsList.length > 0 ? (
            sectionsList.map((sectName) => {
              const sectQuestions = questionsBySection[sectName] || [];
              const sectTotalMarks = sectQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);

              return (
                <div key={sectName} className="space-y-4">
                  {/* Section Title Bar */}
                  <div className="border-2 border-[#005A70] bg-[#E0F2FE] rounded-xs flex items-center justify-between overflow-hidden shadow-2xs">
                    <div className="px-3 py-1.5 bg-[#005A70] text-white font-bold text-xs uppercase tracking-widest border-r border-[#005A70]">
                      {sectName.split(' ')[1] ? `SECTION ${sectName.split(' ')[1]}` : sectName}
                    </div>
                    <div className="px-4 py-1.5 flex-1 font-extrabold text-sm text-[#005A70] uppercase tracking-wide">
                      {sectName}
                    </div>
                    <div className="px-3 py-1.5 bg-[#005A70] text-white font-bold text-xs uppercase tracking-wider border-l border-[#005A70]">
                      [{sectTotalMarks} MARKS]
                    </div>
                  </div>

                  {/* Render Questions in Section */}
                  <div className="space-y-4 pt-1">
                    {sectQuestions.map((q, idx) => renderQuestionItem(q, idx))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-4">
              {paper.questions.map((q, idx) => renderQuestionItem(q, idx))}
            </div>
          )}

          {/* Optional Answer Key Section if included */}
          {layoutSettings.showAnswerKey && paper.answerKey && (
            <div className="mt-12 pt-8 border-t-2 border-[#005A70] page-break-before-always">
              <div className="text-center mb-6">
                <h2 style={{ fontFamily: headingFont }} className="text-xl font-bold uppercase tracking-wider text-[#005A70]">
                  ANSWER KEY & MARKING SCHEME
                </h2>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {schoolName} • {paper.title} • Total Marks: {totalMarks}
                </p>
              </div>
              <AnswerKeyRenderer
                rawText={paper.answerKey}
                isEditingEnabled={isEditingEnabled}
                onUpdate={onUpdateAnswerKey}
              />
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. RUNNING FOOTER                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500 font-sans tracking-wide uppercase flex items-center justify-between">
        <span>{schoolName} • {activeSubject} • {gradeLabel}</span>
        <span>Session {academicSession}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};

export default QuestionPaperTemplate;
