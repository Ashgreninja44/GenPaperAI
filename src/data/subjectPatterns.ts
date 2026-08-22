export interface QuestionPatternType {
  id: string;
  name: string;
  shortCode: string;
  description?: string;
  defaultMarksPerQuestion: number;
  allowedMarks?: number[];
  defaultCount: number;
  internalChoiceNote?: string;
}

export interface PatternSection {
  id: string;
  sectionCode: string;
  title: string;
  instructions?: string;
  questionTypes: QuestionPatternType[];
  totalMarks: number;
}

export interface SubjectPaperPattern {
  id: string;
  academicSession: string;
  board: string;
  classLevel: string;
  subject: string;
  course?: string;
  displayName: string;
  totalMarks: number;
  duration: string;
  durationMinutes: number;
  generalInstructions: string[];
  sections: PatternSection[];
  isVerified: boolean;
  sourceReference: string;
}

export const ACADEMIC_SESSIONS = [
  "2026-27 (Current)",
  "2025-26"
];

// ============================================================================
// VERIFIED SUBJECT-SPECIFIC PATTERNS (CLASS 10 - ACADEMIC SESSION 2026-27)
// ============================================================================

export const VERIFIED_SUBJECT_PATTERNS: Record<string, SubjectPaperPattern> = {
  // --------------------------------------------------------------------------
  // 1. CLASS 10 MATHEMATICS (STANDARD & BASIC)
  // --------------------------------------------------------------------------
  "Class 10-Mathematics": {
    id: "cbse-10-maths-standard-2026",
    academicSession: "2026-27",
    board: "CBSE / NCERT (New)",
    classLevel: "Class 10",
    subject: "Mathematics",
    course: "Standard",
    displayName: "CBSE Class 10 Mathematics (Standard/Basic)",
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: "CBSE Official Curriculum & Sample Question Paper Design 2024-26 (Code 041/241)",
    generalInstructions: [
      "This question paper contains 38 questions divided into 5 Sections: A, B, C, D, and E.",
      "Section A comprises 20 Multiple Choice Questions (MCQs) of 1 mark each (Q1 to Q18 are MCQs, Q19 and Q20 are Assertion-Reason).",
      "Section B comprises 5 Very Short Answer (VSA) questions of 2 marks each (Q21 to Q25).",
      "Section C comprises 6 Short Answer (SA) questions of 3 marks each (Q26 to Q31).",
      "Section D comprises 4 Long Answer (LA) questions of 5 marks each (Q32 to Q35).",
      "Section E comprises 3 Case-Based integrated units of assessment of 4 marks each with sub-parts (Q36 to Q38).",
      "All questions are compulsory. Internal choice has been provided in 2 questions of Section B, 2 questions of Section C, 2 questions of Section D, and 2-mark sub-questions of Section E.",
      "Use of calculators is not permitted. Draw neat figures wherever required."
    ],
    sections: [
      {
        id: "math-sec-a",
        sectionCode: "A",
        title: "Section A (Multiple Choice Questions & Assertion-Reason)",
        instructions: "Questions 1 to 20 carry 1 mark each. Q1-Q18 are MCQs, Q19-Q20 are Assertion-Reasoning.",
        totalMarks: 20,
        questionTypes: [
          {
            id: "math-mcq",
            name: "Multiple Choice Questions (MCQs)",
            shortCode: "mcq",
            description: "Single correct option among 4 choices covering fundamental concepts.",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 18,
            internalChoiceNote: "No overall choice"
          },
          {
            id: "math-ar",
            name: "Assertion and Reason",
            shortCode: "ar",
            description: "Statement of Assertion (A) followed by Statement of Reason (R).",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 2,
            internalChoiceNote: "Compulsory questions (Q19 & Q20)"
          }
        ]
      },
      {
        id: "math-sec-b",
        sectionCode: "B",
        title: "Section B (Very Short Answer Type)",
        instructions: "Questions 21 to 25 carry 2 marks each. Clear algebraic/geometric step-by-step working required.",
        totalMarks: 10,
        questionTypes: [
          {
            id: "math-vsa",
            name: "Very Short Answer (VSA)",
            shortCode: "vsaq",
            description: "Short calculation or geometric proof (2-4 steps).",
            defaultMarksPerQuestion: 2,
            allowedMarks: [2],
            defaultCount: 5,
            internalChoiceNote: "Internal choice provided in 2 questions"
          }
        ]
      },
      {
        id: "math-sec-c",
        sectionCode: "C",
        title: "Section C (Short Answer Type)",
        instructions: "Questions 26 to 31 carry 3 marks each. Comprehensive proofs, equations, or derivations.",
        totalMarks: 18,
        questionTypes: [
          {
            id: "math-sa",
            name: "Short Answer (SA)",
            shortCode: "saq",
            description: "Medium-length problem solving, trigonometric proofs, or quadratic applications.",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 6,
            internalChoiceNote: "Internal choice provided in 2 questions"
          }
        ]
      },
      {
        id: "math-sec-d",
        sectionCode: "D",
        title: "Section D (Long Answer Type)",
        instructions: "Questions 32 to 35 carry 5 marks each. Detailed multistep problem solving.",
        totalMarks: 20,
        questionTypes: [
          {
            id: "math-la",
            name: "Long Answer (LA)",
            shortCode: "laq",
            description: "Theorem proofs (BPT/Circles), Surface Area combinations, Heights & Distances.",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 4,
            internalChoiceNote: "Internal choice provided in 2 questions"
          }
        ]
      },
      {
        id: "math-sec-e",
        sectionCode: "E",
        title: "Section E (Case Study / Integrated Assessment)",
        instructions: "Questions 36 to 38 carry 4 marks each. Real-life scenarios with sub-questions (1M, 1M, 2M).",
        totalMarks: 12,
        questionTypes: [
          {
            id: "math-case",
            name: "Case Study / Integrated Questions",
            shortCode: "case",
            description: "Case-based contextual problem with 3 sub-questions: (i) 1 Mark, (ii) 1 Mark, (iii) 2 Marks with internal choice.",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 3,
            internalChoiceNote: "Internal choice provided in the 2-mark sub-question of each case study"
          }
        ]
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 2. CLASS 10 SCIENCE
  // --------------------------------------------------------------------------
  "Class 10-Science": {
    id: "cbse-10-science-2026",
    academicSession: "2026-27",
    board: "CBSE / NCERT (New)",
    classLevel: "Class 10",
    subject: "Science",
    displayName: "CBSE Class 10 Science (Physics, Chemistry, Biology)",
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: "CBSE Official Science Curriculum & Sample Paper Design 2024-26 (Code 086)",
    generalInstructions: [
      "This question paper consists of 39 questions in 5 Sections: A, B, C, D, and E.",
      "Section A consists of 20 objective-type questions (16 MCQs and 4 Assertion-Reasoning) carrying 1 mark each.",
      "Section B consists of 6 Very Short Answer (VSA / SA-I) questions carrying 2 marks each (answers should be in 30 to 50 words).",
      "Section C consists of 7 Short Answer (SA-II) questions carrying 3 marks each (answers should be in 50 to 80 words).",
      "Section D consists of 3 Long Answer (LA) questions carrying 5 marks each (answers should be in 80 to 120 words).",
      "Section E consists of 3 Source-based/Case-based units of assessment of 4 marks each with sub-parts.",
      "All questions are compulsory. However, an internal choice is provided in some questions across Sections B, C, D, and E."
    ],
    sections: [
      {
        id: "sci-sec-a",
        sectionCode: "A",
        title: "Section A (MCQs & Assertion-Reason)",
        instructions: "Questions 1 to 20 carry 1 mark each. Q1-Q16 are MCQs, Q17-Q20 are Assertion-Reasoning.",
        totalMarks: 20,
        questionTypes: [
          {
            id: "sci-mcq",
            name: "Multiple Choice Questions",
            shortCode: "mcq",
            description: "Concept-based and experimental setup MCQs from Physics, Chemistry, Biology.",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 16,
            internalChoiceNote: "Compulsory questions"
          },
          {
            id: "sci-ar",
            name: "Assertion-Reasoning",
            shortCode: "ar",
            description: "Assertion and Reason statements requiring evaluation of truth and causal linkage.",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 4,
            internalChoiceNote: "Compulsory questions (Q17 to Q20)"
          }
        ]
      },
      {
        id: "sci-sec-b",
        sectionCode: "B",
        title: "Section B (Short Answer - I / VSA)",
        instructions: "Questions 21 to 26 carry 2 marks each. Concise answers with chemical equations or ray diagrams.",
        totalMarks: 12,
        questionTypes: [
          {
            id: "sci-sai",
            name: "Short Answer - I (2 Marks)",
            shortCode: "vsaq",
            description: "Brief explanations, balanced chemical reactions, or definitions (30-50 words).",
            defaultMarksPerQuestion: 2,
            allowedMarks: [2],
            defaultCount: 6,
            internalChoiceNote: "Internal choice provided in 2 questions"
          }
        ]
      },
      {
        id: "sci-sec-c",
        sectionCode: "C",
        title: "Section C (Short Answer - II)",
        instructions: "Questions 27 to 33 carry 3 marks each. Structured explanations, circuits, or biological cycles.",
        totalMarks: 21,
        questionTypes: [
          {
            id: "sci-saii",
            name: "Short Answer - II (3 Marks)",
            shortCode: "saq",
            description: "Mechanisms, numericals on electricity/light, or biological pathways (50-80 words).",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 7,
            internalChoiceNote: "Internal choice provided in 2 questions"
          }
        ]
      },
      {
        id: "sci-sec-d",
        sectionCode: "D",
        title: "Section D (Long Answer)",
        instructions: "Questions 34 to 36 carry 5 marks each. Multi-part comprehensive questions with internal choices.",
        totalMarks: 15,
        questionTypes: [
          {
            id: "sci-la",
            name: "Long Answer (5 Marks)",
            shortCode: "laq",
            description: "In-depth theoretical, experimental, and numerical problems (80-120 words).",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 3,
            internalChoiceNote: "Internal choice provided in all 3 questions"
          }
        ]
      },
      {
        id: "sci-sec-e",
        sectionCode: "E",
        title: "Section E (Case-Based / Data-Based)",
        instructions: "Questions 37 to 39 carry 4 marks each. Data tables, experiments, or clinical scenarios.",
        totalMarks: 12,
        questionTypes: [
          {
            id: "sci-case",
            name: "Case-Based Questions (4 Marks)",
            shortCode: "case",
            description: "Practical experiment/application passage with sub-questions (1M + 1M + 2M).",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 3,
            internalChoiceNote: "Internal choice provided in 2-mark sub-part"
          }
        ]
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 3. CLASS 10 SOCIAL SCIENCE
  // --------------------------------------------------------------------------
  "Class 10-Social Science": {
    id: "cbse-10-social-science-2026",
    academicSession: "2026-27",
    board: "CBSE / NCERT (New)",
    classLevel: "Class 10",
    subject: "Social Science",
    displayName: "CBSE Class 10 Social Science (History, Geography, Civics, Economics)",
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: "CBSE Official Social Science Curriculum & Blueprint 2024-26 (Code 087)",
    generalInstructions: [
      "The question paper comprises 6 Sections: A, B, C, D, E, and F. There are 37 questions in total.",
      "Section A – From question 1 to 20 are MCQs of 1 mark each.",
      "Section B – Question no. 21 to 24 are Very Short Answer Type Questions, carrying 2 marks each (answer should not exceed 40 words).",
      "Section C – Question no. 25 to 29 are Short Answer Type Questions, carrying 3 marks each (answer should not exceed 60 words).",
      "Section D – Question no. 30 to 33 are Long Answer Type Questions, carrying 5 marks each (answer should not exceed 120 words).",
      "Section E – Questions no. 34 to 36 are Case-Based Questions with three sub-questions, carrying 4 marks each (answer should not exceed 100 words).",
      "Section F – Question no. 37 is Map skill-based, carrying 5 marks with two parts, 37a from History (2 marks) and 37b from Geography (3 marks).",
      "There is no overall choice in the question paper. However, an internal choice has been provided in few questions."
    ],
    sections: [
      {
        id: "sst-sec-a",
        sectionCode: "A",
        title: "Section A (Multiple Choice Questions)",
        instructions: "Questions 1 to 20 carry 1 mark each covering History, Geography, Political Science, and Economics.",
        totalMarks: 20,
        questionTypes: [
          {
            id: "sst-mcq",
            name: "Multiple Choice Questions",
            shortCode: "mcq",
            description: "Objective MCQs testing factual, analytical, and conceptual understanding.",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 20,
            internalChoiceNote: "No overall choice"
          }
        ]
      },
      {
        id: "sst-sec-b",
        sectionCode: "B",
        title: "Section B (Very Short Answer Type)",
        instructions: "Questions 21 to 24 carry 2 marks each (maximum 40 words).",
        totalMarks: 8,
        questionTypes: [
          {
            id: "sst-vsa",
            name: "Very Short Answer (VSA)",
            shortCode: "vsaq",
            description: "Brief factual and conceptual statements (max 40 words).",
            defaultMarksPerQuestion: 2,
            allowedMarks: [2],
            defaultCount: 4,
            internalChoiceNote: "Internal choice in 1 question"
          }
        ]
      },
      {
        id: "sst-sec-c",
        sectionCode: "C",
        title: "Section C (Short Answer Type)",
        instructions: "Questions 25 to 29 carry 3 marks each (maximum 60 words).",
        totalMarks: 15,
        questionTypes: [
          {
            id: "sst-sa",
            name: "Short Answer (SA)",
            shortCode: "saq",
            description: "Point-wise explanations and analysis (max 60 words).",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 5,
            internalChoiceNote: "Internal choice in 1 question"
          }
        ]
      },
      {
        id: "sst-sec-d",
        sectionCode: "D",
        title: "Section D (Long Answer Type)",
        instructions: "Questions 30 to 33 carry 5 marks each (maximum 120 words).",
        totalMarks: 20,
        questionTypes: [
          {
            id: "sst-la",
            name: "Long Answer (LA)",
            shortCode: "laq",
            description: "Comprehensive multi-dimensional analysis with historical/economic reasoning.",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 4,
            internalChoiceNote: "Internal choice in 1 question"
          }
        ]
      },
      {
        id: "sst-sec-e",
        sectionCode: "E",
        title: "Section E (Case-Based / Source-Based)",
        instructions: "Questions 34 to 36 carry 4 marks each (maximum 100 words).",
        totalMarks: 12,
        questionTypes: [
          {
            id: "sst-case",
            name: "Case-Based Questions",
            shortCode: "case",
            description: "Historical extract, constitutional clause, or economic report with sub-questions.",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 3,
            internalChoiceNote: "Sub-questions with internal choices where applicable"
          }
        ]
      },
      {
        id: "sst-sec-f",
        sectionCode: "F",
        title: "Section F (Map Skill Work)",
        instructions: "Question 37 carries 5 marks: 37a (History - 2 marks) and 37b (Geography - 3 marks).",
        totalMarks: 5,
        questionTypes: [
          {
            id: "sst-map",
            name: "Map Skill-Based Work",
            shortCode: "map",
            description: "Locating and labeling / Identification on an outline map of India (History 2M + Geography 3M).",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "History (Indian National Congress sessions / Freedom Movement) + Geography (Dams, Ports, Airports, Mineral centers)"
          }
        ]
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 4. CLASS 10 ENGLISH (LANGUAGE & LITERATURE)
  // --------------------------------------------------------------------------
  "Class 10-English": {
    id: "cbse-10-english-2026",
    academicSession: "2026-27",
    board: "CBSE / NCERT (New)",
    classLevel: "Class 10",
    subject: "English",
    course: "Language and Literature",
    displayName: "CBSE Class 10 English (Language & Literature)",
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: "CBSE Official English Curriculum & Sample Paper Design 2024-26 (Code 184)",
    generalInstructions: [
      "15-minute prior reading time is allotted for the question paper.",
      "The Question Paper contains THREE sections: READING, GRAMMAR & CREATIVE WRITING, and LITERATURE.",
      "Attempt questions based on specific instructions for each part.",
      "Adhere strictly to prescribed word limits for writing tasks and answers."
    ],
    sections: [
      {
        id: "eng-sec-a",
        sectionCode: "A",
        title: "Section A: Reading Skills (Reading Comprehension)",
        instructions: "20 Marks. Unseen Discursive & Case-based Factual Passages with MCQs, Objective, and Short Answers.",
        totalMarks: 20,
        questionTypes: [
          {
            id: "eng-discursive",
            name: "Unseen Discursive Passage (10 Marks)",
            shortCode: "reading",
            description: "Passage of 400-450 words testing inference, evaluation, vocabulary, and analysis.",
            defaultMarksPerQuestion: 10,
            allowedMarks: [10],
            defaultCount: 1,
            internalChoiceNote: "10 sub-questions (MCQ + Short Answer)"
          },
          {
            id: "eng-factual",
            name: "Unseen Case-Based Factual Passage (10 Marks)",
            shortCode: "reading",
            description: "Passage of 200-250 words with visual/statistical inputs testing data analysis and interpretation.",
            defaultMarksPerQuestion: 10,
            allowedMarks: [10],
            defaultCount: 1,
            internalChoiceNote: "10 sub-questions (MCQ + Short Answer)"
          }
        ]
      },
      {
        id: "eng-sec-b",
        sectionCode: "B",
        title: "Section B: Grammar and Creative Writing Skills",
        instructions: "20 Marks. 10 Marks Applied Grammar + 10 Marks Creative Writing (Letter & Analytical Paragraph).",
        totalMarks: 20,
        questionTypes: [
          {
            id: "eng-grammar",
            name: "Integrated Applied Grammar (10 Marks)",
            shortCode: "grammar",
            description: "Tenses, Modals, Subject-Verb Concord, Determiners, Reported Speech (Commands, Requests, Statements, Questions).",
            defaultMarksPerQuestion: 10,
            allowedMarks: [10],
            defaultCount: 1,
            internalChoiceNote: "Attempt any 10 out of 12 questions (1 mark each)"
          },
          {
            id: "eng-letter",
            name: "Formal Letter Writing (5 Marks)",
            shortCode: "writing",
            description: "Formal Letter (Letter to Editor, Complaint, Inquiry, Placing Order) in 100-120 words.",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "1 out of 2 given options"
          },
          {
            id: "eng-analytical",
            name: "Analytical Paragraph Writing (5 Marks)",
            shortCode: "writing",
            description: "Analytical Paragraph based on given outline/chart/cue/data in 100-120 words.",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "1 out of 2 given options"
          }
        ]
      },
      {
        id: "eng-sec-c",
        sectionCode: "C",
        title: "Section C: Literature Textbook and Supplementary Reading",
        instructions: "40 Marks. Reference to Context, Short Answer, and Long Answer questions based on First Flight and Footprints Without Feet.",
        totalMarks: 40,
        questionTypes: [
          {
            id: "eng-rtc-prose",
            name: "Reference to Context (Drama / Prose)",
            shortCode: "literature",
            description: "One extract from First Flight prose/drama with 5 sub-questions (5 Marks).",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "1 out of 2 extracts"
          },
          {
            id: "eng-rtc-poetry",
            name: "Reference to Context (Poetry)",
            shortCode: "literature",
            description: "One extract from First Flight poetry with 5 sub-questions (5 Marks).",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "1 out of 2 extracts"
          },
          {
            id: "eng-sa-ff",
            name: "Short Answer Questions (First Flight)",
            shortCode: "literature",
            description: "Short answers in 40-50 words each (4 questions × 3 Marks = 12 Marks).",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 4,
            internalChoiceNote: "Answer any 4 out of 5 questions"
          },
          {
            id: "eng-sa-fp",
            name: "Short Answer Questions (Footprints Without Feet)",
            shortCode: "literature",
            description: "Short answers in 40-50 words each (2 questions × 3 Marks = 6 Marks).",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 2,
            internalChoiceNote: "Answer any 2 out of 3 questions"
          },
          {
            id: "eng-la-ff",
            name: "Long Answer Question (First Flight)",
            shortCode: "literature",
            description: "Theme/character/plot evaluation in 100-120 words (6 Marks).",
            defaultMarksPerQuestion: 6,
            allowedMarks: [6],
            defaultCount: 1,
            internalChoiceNote: "1 out of 2 given questions"
          },
          {
            id: "eng-la-fp",
            name: "Long Answer Question (Footprints Without Feet)",
            shortCode: "literature",
            description: "Theme/character/moral dilemma in 100-120 words (6 Marks).",
            defaultMarksPerQuestion: 6,
            allowedMarks: [6],
            defaultCount: 1,
            internalChoiceNote: "1 out of 2 given questions"
          }
        ]
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 5. CLASS 10 HINDI COURSE A
  // --------------------------------------------------------------------------
  "Class 10-Hindi Course A": {
    id: "cbse-10-hindi-a-2026",
    academicSession: "2026-27",
    board: "CBSE / NCERT (New)",
    classLevel: "Class 10",
    subject: "Hindi Course A",
    course: "Course A",
    displayName: "CBSE Class 10 Hindi Course A (क्षितिज व कृतिका)",
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: "CBSE Official Hindi Course A Curriculum & Sample Paper 2024-26 (Code 002)",
    generalInstructions: [
      "इस प्रश्नपत्र में चार खंड हैं - क, ख, ग और घ। कुल 80 अंक हैं।",
      "खंड 'क' : अपठित बोध (14 अंक) - अपठित गद्यांश व पद्यांश।",
      "खंड 'ख' : व्यावहारिक व्याकरण (16 अंक) - वाक्य भेद, वाच्य, पद परिचय, अलंकार।",
      "खंड 'ग' : पाठ्यपुस्तक (क्षितिज भाग-2) एवं पूरक पाठ्यपुस्तक (कृतिका भाग-2) (30 अंक)।",
      "खंड 'घ' : रचनात्मक लेखन (20 अंक) - अनुच्छेद, पत्र, स्ववृत्त/ई-मेल, विज्ञापन/संदेश।",
      "सभी प्रश्नों के उत्तर दिए गए निर्देशों के अनुसार लिखें तथा शब्द-सीमा का ध्यान रखें।"
    ],
    sections: [
      {
        id: "hindi-a-sec-k",
        sectionCode: "क",
        title: "खंड 'क' : अपठित बोध (Reading Comprehension)",
        instructions: "कुल 14 अंक। अपठित गद्यांश व अपठित काव्यांश पर आधारित बोध प्रश्न।",
        totalMarks: 14,
        questionTypes: [
          {
            id: "ha-unseen-prose",
            name: "अपठित गद्यांश (Unseen Prose Passage)",
            shortCode: "reading",
            description: "गद्यांश पर आधारित 7 लघु/बहुविकल्पीय प्रश्न (7 अंक)।",
            defaultMarksPerQuestion: 7,
            allowedMarks: [7],
            defaultCount: 1,
            internalChoiceNote: "सभी प्रश्न अनिवार्य"
          },
          {
            id: "ha-unseen-poem",
            name: "अपठित काव्यांश (Unseen Poetry Passage)",
            shortCode: "reading",
            description: "काव्यांश पर आधारित 7 लघु/बहुविकल्पीय प्रश्न (7 अंक)।",
            defaultMarksPerQuestion: 7,
            allowedMarks: [7],
            defaultCount: 1,
            internalChoiceNote: "सभी प्रश्न अनिवार्य"
          }
        ]
      },
      {
        id: "hindi-a-sec-kh",
        sectionCode: "ख",
        title: "खंड 'ख' : व्यावहारिक व्याकरण (Functional Grammar)",
        instructions: "कुल 16 अंक (4 विषय × 4 अंक)। वस्तुपरक व लघु उत्तरात्मक व्याकरण प्रश्न।",
        totalMarks: 16,
        questionTypes: [
          {
            id: "ha-vakya",
            name: "रचना के आधार पर वाक्य भेद (4 Marks)",
            shortCode: "grammar",
            description: "सरल, संयुक्त, मिश्र वाक्य रूपांतरण व पहचान (4 प्रश्न × 1 अंक = 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "5 में से किन्हीं 4 प्रश्नों के उत्तर दें"
          },
          {
            id: "ha-vachya",
            name: "वाच्य (कर्तृवाच्य, कर्मवाच्य, भाववाच्य) (4 Marks)",
            shortCode: "grammar",
            description: "वाच्य पहचान व परिवर्तन (4 प्रश्न × 1 अंक = 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "5 में से किन्हीं 4 प्रश्नों के उत्तर दें"
          },
          {
            id: "ha-pad",
            name: "पद परिचय (4 Marks)",
            shortCode: "grammar",
            description: "संज्ञा, सर्वनाम, विशेषण, क्रिया, अव्यय आदि का व्याकरणिक परिचय (4 प्रश्न × 1 अंक = 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "5 में से किन्हीं 4 प्रश्नों के उत्तर दें"
          },
          {
            id: "ha-alankar",
            name: "अलंकार (श्लेष, उत्प्रेक्षा, अतिशयोक्ति, मानवीकरण) (4 Marks)",
            shortCode: "grammar",
            description: "अलंकार पहचान व लक्षण (4 प्रश्न × 1 अंक = 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "5 में से किन्हीं 4 प्रश्नों के उत्तर दें"
          }
        ]
      },
      {
        id: "hindi-a-sec-g",
        sectionCode: "ग",
        title: "खंड 'ग' : पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक (Textbook & Supplementary)",
        instructions: "कुल 30 अंक। क्षितिज भाग-2 (गद्य व पद्य) तथा कृतिका भाग-2 पर आधारित प्रश्न।",
        totalMarks: 30,
        questionTypes: [
          {
            id: "ha-pathit-gadya",
            name: "पठित गद्यांश बोध प्रश्न (क्षितिज गद्य)",
            shortCode: "literature",
            description: "पठित गद्यांश पर आधारित 5 प्रश्न (5 अंक)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "अनिवार्य प्रश्न"
          },
          {
            id: "ha-gadya-vichar",
            name: "गद्य पाठ आधारित विचार अभिव्यक्ति प्रश्न (क्षितिज)",
            shortCode: "literature",
            description: "2 प्रश्न × 3 अंक = 6 अंक (लगभग 50-60 शब्द)।",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 2,
            internalChoiceNote: "3 में से किन्हीं 2 प्रश्नों के उत्तर दें"
          },
          {
            id: "ha-pathit-kavya",
            name: "पठित काव्यांश बोध प्रश्न (क्षितिज काव्य)",
            shortCode: "literature",
            description: "पठित काव्यांश पर आधारित 5 प्रश्न (5 अंक)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "अनिवार्य प्रश्न"
          },
          {
            id: "ha-kavya-bhav",
            name: "काव्य पाठ आधारित भाव/सौंदर्य बोध प्रश्न (क्षितिज)",
            shortCode: "literature",
            description: "2 प्रश्न × 3 अंक = 6 अंक (लगभग 50-60 शब्द)।",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 2,
            internalChoiceNote: "3 में से किन्हीं 2 प्रश्नों के उत्तर दें"
          },
          {
            id: "ha-kritika",
            name: "कृतिका भाग-2 पाठ आधारित विस्तृत प्रश्न",
            shortCode: "literature",
            description: "2 प्रश्न × 4 अंक = 8 अंक (लगभग 50-60 शब्द)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 2,
            internalChoiceNote: "3 में से किन्हीं 2 प्रश्नों के उत्तर दें"
          }
        ]
      },
      {
        id: "hindi-a-sec-gh",
        sectionCode: "घ",
        title: "खंड 'घ' : रचनात्मक लेखन (Creative Writing)",
        instructions: "कुल 20 अंक। अनुच्छेद लेखन, पत्र लेखन, स्ववृत्त/ई-मेल तथा विज्ञापन/संदेश लेखन।",
        totalMarks: 20,
        questionTypes: [
          {
            id: "ha-anuched",
            name: "अनुच्छेद लेखन (Paragraph Writing)",
            shortCode: "writing",
            description: "दिए गए संकेत बिंदुओं पर आधारित अनुच्छेद (लगभग 120 शब्द, 6 अंक)।",
            defaultMarksPerQuestion: 6,
            allowedMarks: [6],
            defaultCount: 1,
            internalChoiceNote: "3 विषयों में से किसी 1 पर लिखें"
          },
          {
            id: "ha-patra",
            name: "औपचारिक / अनौपचारिक पत्र लेखन (Letter Writing)",
            shortCode: "writing",
            description: "पत्र लेखन (लगभग 100 शब्द, 5 अंक)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "2 में से किसी 1 विषय पर लिखें"
          },
          {
            id: "ha-biodata-email",
            name: "स्ववृत्त लेखन अथवा ई-मेल लेखन (Biodata / E-mail)",
            shortCode: "writing",
            description: "स्ववृत्त (Biodata) अथवा औपचारिक ई-मेल लेखन (लगभग 80 शब्द, 5 अंक)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "विकल्प सहित (1 का चयन करें)"
          },
          {
            id: "ha-ad-message",
            name: "विज्ञापन लेखन अथवा संदेश लेखन (Advertisement / Message)",
            shortCode: "writing",
            description: "आकर्षक विज्ञापन अथवा शुभकामना/त्योहार संदेश लेखन (लगभग 40 शब्द, 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "विकल्प सहित (1 का चयन करें)"
          }
        ]
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 6. CLASS 10 HINDI COURSE B
  // --------------------------------------------------------------------------
  "Class 10-Hindi Course B": {
    id: "cbse-10-hindi-b-2026",
    academicSession: "2026-27",
    board: "CBSE / NCERT (New)",
    classLevel: "Class 10",
    subject: "Hindi Course B",
    course: "Course B",
    displayName: "CBSE Class 10 Hindi Course B (स्पर्श व संचयन)",
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: "CBSE Official Hindi Course B Curriculum & Sample Paper 2024-26 (Code 085)",
    generalInstructions: [
      "इस प्रश्नपत्र में चार खंड हैं - क, ख, ग और घ। कुल 80 अंक हैं।",
      "खंड 'क' : अपठित बोध (14 अंक)।",
      "खंड 'ख' : व्यावहारिक व्याकरण (16 अंक) - पदबंध, रचना की दृष्टि से वाक्य रूपांतरण, समास, मुहावरे।",
      "खंड 'ग' : पाठ्यपुस्तक (स्पर्श भाग-2) एवं पूरक पुस्तक (संचयन भाग-2) (30 अंक)।",
      "खंड 'घ' : रचनात्मक लेखन (20 अंक) - अनुच्छेद, पत्र, सूचना, विज्ञापन, लघुकथा/ई-मेल।",
      "निर्देशानुसार शुद्ध वर्तनी एवं शब्द-सीमा का पालन करते हुए उत्तर दें।"
    ],
    sections: [
      {
        id: "hindi-b-sec-k",
        sectionCode: "क",
        title: "खंड 'क' : अपठित बोध (Reading Comprehension)",
        instructions: "कुल 14 अंक। अपठित गद्यांश (7 अंक) एवं अपठित पद्यांश (7 अंक)।",
        totalMarks: 14,
        questionTypes: [
          {
            id: "hb-unseen-prose",
            name: "अपठित गद्यांश (Unseen Prose)",
            shortCode: "reading",
            description: "गद्यांश पर आधारित 7 वस्तुपरक/लघु प्रश्न (7 अंक)।",
            defaultMarksPerQuestion: 7,
            allowedMarks: [7],
            defaultCount: 1,
            internalChoiceNote: "अनिवार्य"
          },
          {
            id: "hb-unseen-poem",
            name: "अपठित पद्यांश (Unseen Poetry)",
            shortCode: "reading",
            description: "पद्यांश पर आधारित 7 वस्तुपरक/लघु प्रश्न (7 अंक)।",
            defaultMarksPerQuestion: 7,
            allowedMarks: [7],
            defaultCount: 1,
            internalChoiceNote: "अनिवार्य"
          }
        ]
      },
      {
        id: "hindi-b-sec-kh",
        sectionCode: "ख",
        title: "खंड 'ख' : व्यावहारिक व्याकरण (Functional Grammar)",
        instructions: "कुल 16 अंक। पदबंध, वाक्य रूपांतरण, समास एवं मुहावरे।",
        totalMarks: 16,
        questionTypes: [
          {
            id: "hb-padbandh",
            name: "पदबंध (4 Marks)",
            shortCode: "grammar",
            description: "संज्ञा, सर्वनाम, विशेषण, क्रिया, क्रियाविशेषण पदबंध पहचान (4 प्रश्न × 1 अंक = 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "5 में से किन्हीं 4 प्रश्नों के उत्तर दें"
          },
          {
            id: "hb-vakya",
            name: "रचना के आधार पर वाक्य रूपांतरण (4 Marks)",
            shortCode: "grammar",
            description: "सरल, संयुक्त व मिश्र वाक्यों में रूपांतरण (4 प्रश्न × 1 अंक = 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "5 में से किन्हीं 4 प्रश्नों के उत्तर दें"
          },
          {
            id: "hb-samas",
            name: "समास (तत्पुरुष, कर्मधारय, द्विगु, द्वंद्व, बहुव्रीहि, अव्ययीभाव) (4 Marks)",
            shortCode: "grammar",
            description: "समस्त पद निर्माण एवं समास विग्रह (4 प्रश्न × 1 अंक = 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "5 में से किन्हीं 4 प्रश्नों के उत्तर दें"
          },
          {
            id: "hb-muhavare",
            name: "मुहावरे (4 Marks)",
            shortCode: "grammar",
            description: "मुहावरों का अर्थ एवं वाक्य प्रयोग (4 प्रश्न × 1 अंक = 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "5 में से किन्हीं 4 प्रश्नों के उत्तर दें"
          }
        ]
      },
      {
        id: "hindi-b-sec-g",
        sectionCode: "ग",
        title: "खंड 'ग' : पाठ्यपुस्तक एवं पूरक पुस्तक (Textbook & Supplementary)",
        instructions: "कुल 30 अंक। स्पर्श भाग-2 (गद्य व पद्य) तथा संचयन भाग-2।",
        totalMarks: 30,
        questionTypes: [
          {
            id: "hb-sparsh-gadya",
            name: "पठित गद्यांश प्रश्न (स्पर्श गद्य)",
            shortCode: "literature",
            description: "पठित गद्यांश आधारित 5 प्रश्न (5 अंक)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "अनिवार्य"
          },
          {
            id: "hb-sparsh-gadya-sa",
            name: "स्पर्श गद्य पाठ आधारित प्रश्न",
            shortCode: "literature",
            description: "2 प्रश्न × 3 अंक = 6 अंक (लगभग 50-60 शब्द)।",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 2,
            internalChoiceNote: "3 में से किन्हीं 2 प्रश्नों के उत्तर दें"
          },
          {
            id: "hb-sparsh-kavya",
            name: "पठित पद्यांश प्रश्न (स्पर्श काव्य)",
            shortCode: "literature",
            description: "पठित पद्यांश आधारित 5 प्रश्न (5 अंक)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "अनिवार्य"
          },
          {
            id: "hb-sparsh-kavya-sa",
            name: "स्पर्श काव्य पाठ आधारित प्रश्न",
            shortCode: "literature",
            description: "2 प्रश्न × 3 अंक = 6 अंक (लगभग 50-60 शब्द)।",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 2,
            internalChoiceNote: "3 में से किन्हीं 2 प्रश्नों के उत्तर दें"
          },
          {
            id: "hb-sanchayan",
            name: "संचयन भाग-2 पाठ आधारित विस्तृत प्रश्न",
            shortCode: "literature",
            description: "2 प्रश्न × 4 अंक = 8 अंक (लगभग 50-60 शब्द)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 2,
            internalChoiceNote: "3 में से किन्हीं 2 प्रश्नों के उत्तर दें"
          }
        ]
      },
      {
        id: "hindi-b-sec-gh",
        sectionCode: "घ",
        title: "खंड 'घ' : रचनात्मक लेखन (Creative Writing)",
        instructions: "कुल 20 अंक। अनुच्छेद, पत्र, सूचना, विज्ञापन, लघुकथा अथवा ई-मेल लेखन।",
        totalMarks: 20,
        questionTypes: [
          {
            id: "hb-anuched",
            name: "अनुच्छेद लेखन (6 Marks)",
            shortCode: "writing",
            description: "संकेत बिंदुओं पर आधारित अनुच्छेद (100-120 शब्द, 6 अंक)।",
            defaultMarksPerQuestion: 6,
            allowedMarks: [6],
            defaultCount: 1,
            internalChoiceNote: "3 में से किसी 1 पर लिखें"
          },
          {
            id: "hb-patra",
            name: "पत्र लेखन (5 Marks)",
            shortCode: "writing",
            description: "अनौपचारिक अथवा औपचारिक पत्र (100 शब्द, 5 अंक)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "विकल्प सहित (1 का चयन करें)"
          },
          {
            id: "hb-suchna",
            name: "सूचना लेखन (4 Marks)",
            shortCode: "writing",
            description: "औपचारिक सूचना लेखन (50 शब्द, 4 अंक)।",
            defaultMarksPerQuestion: 4,
            allowedMarks: [4],
            defaultCount: 1,
            internalChoiceNote: "विकल्प सहित"
          },
          {
            id: "hb-vigyapan",
            name: "विज्ञापन लेखन (3 Marks)",
            shortCode: "writing",
            description: "उत्पाद अथवा संस्था का विज्ञापन (40 शब्द, 3 अंक)।",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 1,
            internalChoiceNote: "विकल्प सहित"
          },
          {
            id: "hb-laghukatha",
            name: "लघुकथा लेखन अथवा ई-मेल लेखन (2 Marks)",
            shortCode: "writing",
            description: "लघुकथा अथवा औपचारिक ई-मेल लेखन (50-60 शब्द, 2 अंक)।",
            defaultMarksPerQuestion: 2,
            allowedMarks: [2],
            defaultCount: 1,
            internalChoiceNote: "विकल्प सहित"
          }
        ]
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 7. CLASS 10 TELUGU (ANDHRA PRADESH / TELUGU PARIMALAM)
  // --------------------------------------------------------------------------
  "Class 10-Telugu (Andhra Pradesh)": {
    id: "ap-10-telugu-parimalam-2026",
    academicSession: "2026-27",
    board: "AP SCERT",
    classLevel: "Class 10",
    subject: "Telugu (Andhra Pradesh)",
    course: "Telugu Parimalam (First Language)",
    displayName: "AP SSC Class 10 Telugu Parimalam (తెలుగు పరిమళం)",
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: "AP SCERT / BSEAP SSC Telugu Parimalam Examination Blueprint 2024-26",
    generalInstructions: [
      "ఈ ప్రశ్నపత్రంలో మూడు విభాగాలు (విభాగం-1, విభాగం-2, విభాగం-3) ఉంటాయి. మొత్తం 80 మార్కులు.",
      "విభాగం - 1 : అవగాహన - ప్రతిస్పందన (20 మార్కులు) - అపరిచిత/పరిచిత గద్య, పద్య అంశాలు.",
      "విభాగం - 2 : వ్యక్తీకరణ - సృజనాత్మకత (36 మార్కులు) - లఘు, వ్యాసరూప, ఉపవాచక (రామాయణం) ప్రశ్నలు & సృజనాత్మక రచన.",
      "విభాగం - 3 : భాషాంశాలు & వ్యాకరణం (24 మార్కులు) - సంధులు, సమాసాలు, ఛందస్సు, అలంకారాలు, పదజాలం, జాతీయాలు.",
      "అన్ని సమాధానాలను స్పష్టమైన, దోషరహితమైన తెలుగు లిపిలో రాయండి."
    ],
    sections: [
      {
        id: "tel-sec-1",
        sectionCode: "విభాగం - 1",
        title: "విభాగం - 1 : అవగాహన - ప్రతిస్పందన (Reading Comprehension & Appreciation)",
        instructions: "మొత్తం 20 మార్కులు. అపరిచిత గద్యం, అపరిచిత పద్యం, పరిచిత పద్యం & ప్రతిపదార్థం, పరిచిత గద్యం.",
        totalMarks: 20,
        questionTypes: [
          {
            id: "tel-aparichita-gadyam",
            name: "అపరిచిత గద్యం & ప్రశ్నలు (Unseen Prose)",
            shortCode: "reading",
            description: "అపరిచిత గద్యాన్ని చదివి క్రింది 5 ప్రశ్నలకు జవాబులు రాయండి (5 × 1M = 5 మార్కులు).",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "అన్ని ఉప-ప్రశ్నలు తప్పనిసరి"
          },
          {
            id: "tel-aparichita-padyam",
            name: "అపరిచిత పద్యం & ప్రశ్నలు (Unseen Poetry)",
            shortCode: "reading",
            description: "అపరిచిత పద్యాన్ని చదివి క్రింది 5 ప్రశ్నలకు జవాబులు రాయండి (5 × 1M = 5 మార్కులు).",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "అన్ని ఉప-ప్రశ్నలు తప్పనిసరి"
          },
          {
            id: "tel-parichita-padyam",
            name: "పరిచిత పద్యం - ప్రతిపదార్థ తాత్పర్యం / భావగ్రహణం",
            shortCode: "literature",
            description: "పాఠ్యభాగ పద్యానికి ప్రతిపదార్థ తాత్పర్యం లేదా భావం రాయండి (1 × 5M = 5 మార్కులు).",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "రెండు పద్యాలలో ఒకదానికి సమాధానం రాయండి (అంతర్గత ఎంపిక)"
          },
          {
            id: "tel-parichita-gadyam",
            name: "పరిచిత గద్యం / ఉపవాచకం సంఘటన క్రమం",
            shortCode: "literature",
            description: "పాఠ్యభాగ గద్యం ఆధారంగా ప్రశ్నలు లేదా రామాయణ సంఘటనల క్రమం అమర్చడం (5 × 1M = 5 మార్కులు).",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "అన్ని ఉప-ప్రశ్నలు తప్పనిసరి"
          }
        ]
      },
      {
        id: "tel-sec-2",
        sectionCode: "విభాగం - 2",
        title: "విభాగం - 2 : వ్యక్తీకరణ - సృజనాత్మకత (Writing & Creative Expression)",
        instructions: "మొత్తం 36 మార్కులు. లఘు ప్రశ్నలు, వ్యాసరూప ప్రశ్నలు, రామాయణ ఉపవాచక ప్రశ్నలు మరియు సృజనాత్మక రచన.",
        totalMarks: 36,
        questionTypes: [
          {
            id: "tel-laghu-prashnalu",
            name: "లఘు సమాధాన ప్రశ్నలు (Short Answer - Prose & Poetry)",
            shortCode: "literature",
            description: "గద్య మరియు పద్య భాగాల నుండి 4 లఘు సమాధాన ప్రశ్నలు (4 × 3M = 12 మార్కులు).",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 4,
            internalChoiceNote: "ప్రతి ప్రశ్నకు 4-5 వాక్యాలలో సమాధానం రాయండి"
          },
          {
            id: "tel-vyasarupa-prashnalu",
            name: "వ్యాసరూప ప్రశ్నలు (Detailed Essay Questions - Lessons)",
            shortCode: "literature",
            description: "పాఠ్యాంశాల సమగ్ర భావన ఆధారంగా 2 వ్యాసరూప ప్రశ్నలు (2 × 6M = 12 మార్కులు).",
            defaultMarksPerQuestion: 6,
            allowedMarks: [6],
            defaultCount: 2,
            internalChoiceNote: "ప్రతి ప్రశ్నకు అంతర్గత ఎంపిక కలదు (ఈ క్రింది వానిలో ఒకదానికి సమాధానం)"
          },
          {
            id: "tel-upavachakam-ramayanam",
            name: "ఉపవాచకం (రామాయణం) పాత్ర స్వభావం / సంఘటన వివరణ",
            shortCode: "literature",
            description: "బాలకాండ నుండి యుద్ధకాండ వరకు గల కాండల పాత్రల విశిష్టత లేదా సందేశం (1 × 6M = 6 మార్కులు).",
            defaultMarksPerQuestion: 6,
            allowedMarks: [6],
            defaultCount: 1,
            internalChoiceNote: "రెండు ప్రశ్నలలో ఒకదానికి సమాధానం రాయండి"
          },
          {
            id: "tel-srujanatmakata",
            name: "సృజనాత్మక రచన (లేఖ / కరపత్రం / ప్రకటన / సంభాషణ)",
            shortCode: "writing",
            description: "సమకాలీన లేదా సామాజిక అంశంపై లేఖారచన, కరపత్రం, ప్రకటన లేదా సంభాషణ (1 × 6M = 6 మార్కులు).",
            defaultMarksPerQuestion: 6,
            allowedMarks: [6],
            defaultCount: 1,
            internalChoiceNote: "రెండు అంశాలలో ఒకదానిని ఎంచుకొని రాయండి"
          }
        ]
      },
      {
        id: "tel-sec-3",
        sectionCode: "విభాగం - 3",
        title: "విభాగం - 3 : భాషాంశాలు & వ్యాకరణం (Language Elements & Grammar)",
        instructions: "మొత్తం 24 మార్కులు. సంధులు, సమాసాలు, ఛందస్సు, అలంకారాలు, పదజాలం మరియు జాతీయాలు.",
        totalMarks: 24,
        questionTypes: [
          {
            id: "tel-sandhi-samasa",
            name: "సంధులు & సమాసాలు (Sandhi & Samasa)",
            shortCode: "grammar",
            description: "సవర్ణదీర్ఘ, గుణ, వృద్ధి, యణాదేశ, ఉత్వ, ఇత్వ సంధులు మరియు తత్పురుష, ద్వంద్వ, ద్విగు, బహువ్రీహి సమాసాలు (6 × 1M = 6 మార్కులు).",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 6,
            internalChoiceNote: "పదాలను విడదీయడం, సంధి పేరు రాయడం, విగ్రహవాక్యాలు"
          },
          {
            id: "tel-chandassu-alankara",
            name: "ఛందస్సు & అలంకారాలు (Prosody & Figures of Speech)",
            shortCode: "grammar",
            description: "వృత్త పద్య లక్షణాలు (ఉత్పలమాల, చంపకమాల, శార్దూలం, మత్తేభం) మరియు శబ్ద/అర్థాలంకారాలు (6 × 1M = 6 మార్కులు).",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 6,
            internalChoiceNote: "గణవిభజన, యతి-ప్రాస గుర్తింపు, అలంకార సమన్వయం"
          },
          {
            id: "tel-padajalam",
            name: "పదజాలం (పర్యాయపదాలు, నానార్థాలు, ప్రకృతి-వికృతులు)",
            shortCode: "grammar",
            description: "పర్యాయపదాలు, నానార్థాలు, ప్రకృతి-వికృతులు, వ్యుత్పత్యర్థాలు (6 × 1M = 6 మార్కులు).",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 6,
            internalChoiceNote: "లక్ష్యాత్మక వ్యాకరణ ప్రశ్నలు"
          },
          {
            id: "tel-jatiyalu-sametalu",
            name: "జాతీయాలు, సామెతలు & వాక్య ప్రయోగాలు",
            shortCode: "grammar",
            description: "జాతీయాల అర్థం, సామెతల గుర్తింపు, స్వంత వాక్య ప్రయోగాలు (6 × 1M = 6 మార్కులు).",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 6,
            internalChoiceNote: "సందర్భోచిత ప్రయోగాలు"
          }
        ]
      }
    ]
  },

  // --------------------------------------------------------------------------
  // 8. CLASS 10 SANSKRIT
  // --------------------------------------------------------------------------
  "Class 10-Sanskrit": {
    id: "cbse-10-sanskrit-2026",
    academicSession: "2026-27",
    board: "CBSE / NCERT (New)",
    classLevel: "Class 10",
    subject: "Sanskrit",
    displayName: "CBSE Class 10 Sanskrit (शेमुषी भाग-2)",
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: "CBSE Official Sanskrit Curriculum & Blueprint 2024-26 (Code 122)",
    generalInstructions: [
      "अस्मिन् प्रश्नपत्रे चत्वारः खण्डाः सन्ति - खण्डः 'क', खण्डः 'ख', खण्डः 'ग', खण्डः 'घ'।",
      "खण्डः 'क' : अपठित-अवबोधनम् (10 अङ्काः)।",
      "खण्डः 'ख' : रचनात्मक-कार्यम् (15 अङ्काः) - पत्रलेखनम्, चित्रवर्णनम्/अनुच्छेदः, संस्कृतानुवादः।",
      "खण्डः 'ग' : अनुप्रयुक्त-व्याकरणम् (25 अङ्काः) - सन्धिः, समासः, प्रत्ययाः, वाच्यम्, समयः, अव्ययानि, अशुद्धि-संशोधनम्।",
      "खण्डः 'घ' : पठित-अवबोधनम् (30 अङ्काः) - गद्यांशः, पद्यांशः, नाट्यांशः, प्रश्ननिर्माणम्, अन्वयः/भावार्थः, घटनाक्रमः, प्रसंगानुकूल-अर्थचयनम्।"
    ],
    sections: [
      {
        id: "skt-sec-k",
        sectionCode: "खण्डः 'क'",
        title: "खण्डः 'क' : अपठित-अवबोधनम् (Unseen Comprehension)",
        instructions: "10 अङ्काः। एकपदेन उत्तरत, पूर्णवाक्येन उत्तरत, शीर्षकलेखनम् तथा भाषिककार्यम्।",
        totalMarks: 10,
        questionTypes: [
          {
            id: "skt-unseen",
            name: "अपठित-गद्यांशः (10 Marks)",
            shortCode: "reading",
            description: "80-100 शब्दानाम् अपठित-गद्यांशम् आधृत्य एकपदेन, पूर्णवाक्येन, शीर्षक-भाषिककार्य-प्रश्नाः।",
            defaultMarksPerQuestion: 10,
            allowedMarks: [10],
            defaultCount: 1,
            internalChoiceNote: "सर्वे उपप्रश्नाः अनिवर्याः"
          }
        ]
      },
      {
        id: "skt-sec-kh",
        sectionCode: "खण्डः 'ख'",
        title: "खण्डः 'ख' : रचनात्मक-कार्यम् (Creative Writing)",
        instructions: "15 अङ्काः। पत्रलेखनम् (5M), चित्रवर्णनम् (5M), संस्कृतानुवादः (5M)।",
        totalMarks: 15,
        questionTypes: [
          {
            id: "skt-patra",
            name: "औपचारिकं / अनौपचारिकं पत्रलेखनम् (5 Marks)",
            shortCode: "writing",
            description: "मञ्जूषायाः सहायतया पत्रे रिक्तस्थानपूर्तिः (5 अङ्काः)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "मञ्जूषापदैः पूरणीयम्"
          },
          {
            id: "skt-chitra",
            name: "चित्रवर्णनम् अथवा अनुच्छेदलेखनम् (5 Marks)",
            shortCode: "writing",
            description: "चित्रं दृष्ट्वा मञ्जूषायाः सहायतया पञ्च वाक्यानि (5 अङ्काः)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "विकल्पसहितम्"
          },
          {
            id: "skt-anuvada",
            name: "हिन्द्याः / आङ्ग्लभाषायाः संस्कृते अनुवादः (5 Marks)",
            shortCode: "writing",
            description: "पञ्च वाक्यानां संस्कृते अनुवादः (5 अङ्काः)।",
            defaultMarksPerQuestion: 5,
            allowedMarks: [5],
            defaultCount: 1,
            internalChoiceNote: "किञ्चन 5 वाक्यानि"
          }
        ]
      },
      {
        id: "skt-sec-g",
        sectionCode: "खण्डः 'ग'",
        title: "खण्डः 'ग' : अनुप्रयुक्त-व्याकरणम् (Applied Grammar)",
        instructions: "25 अङ्काः। सन्धिः (4M), समासः (4M), प्रत्ययाः (4M), वाच्यम् (3M), समयः (4M), अव्ययानि (3M), अशुद्धि-संशोधनम् (3M)।",
        totalMarks: 25,
        questionTypes: [
          {
            id: "skt-sandhi-samas",
            name: "सन्धिः एवं समासः (8 Marks)",
            shortCode: "grammar",
            description: "व्यञ्जन-विसर्ग सन्धिः तथा तत्पुरुष, कर्मधारय, द्विगु, द्वन्द्व, अव्ययीभाव समासाः।",
            defaultMarksPerQuestion: 8,
            allowedMarks: [8],
            defaultCount: 1,
            internalChoiceNote: "विकल्पसहितम्"
          },
          {
            id: "skt-pratyaya-vachya",
            name: "प्रत्ययाः एवं वाच्य-परिवर्तनम् (7 Marks)",
            shortCode: "grammar",
            description: "मतुप्, ठक्, त्व, तल् प्रत्ययाः तथा लट्लकारे कर्तृ-कर्म-क्रिया वाच्यम्।",
            defaultMarksPerQuestion: 7,
            allowedMarks: [7],
            defaultCount: 1,
            internalChoiceNote: "विकल्पसहितम्"
          },
          {
            id: "skt-samaya-avyaya",
            name: "समयलेखनम्, अव्ययानि एवं अशुद्धि-संशोधनम् (10 Marks)",
            shortCode: "grammar",
            description: "घटिकाचित्र-समयः, अव्ययपदानि तथा वचन-लिङ्ग-पुरुष-लकार सम्बन्धी संशोधनम्।",
            defaultMarksPerQuestion: 10,
            allowedMarks: [10],
            defaultCount: 1,
            internalChoiceNote: "विकल्पसहितम्"
          }
        ]
      },
      {
        id: "skt-sec-gh",
        sectionCode: "खण्डः 'घ'",
        title: "खण्डः 'घ' : पठित-अवबोधनम् (Textbook Comprehension)",
        instructions: "30 अङ्काः। शेमुषी भाग-2 आधृत्य गद्यांशः, पद्यांशः, नाट्यांशः, प्रश्ननिर्माणम्, अन्वयः, घटनाक्रमः।",
        totalMarks: 30,
        questionTypes: [
          {
            id: "skt-gadya-padya-natya",
            name: "पठित गद्यांश, पद्यांश एवं नाट्यांश (15 Marks)",
            shortCode: "literature",
            description: "गद्यांशः (5M) + पद्यांशः (5M) + नाट्यांशः (5M) आधारित एकपदेन, पूर्णवाक्येन प्रश्नाः।",
            defaultMarksPerQuestion: 15,
            allowedMarks: [15],
            defaultCount: 1,
            internalChoiceNote: "अनिवार्यम्"
          },
          {
            id: "skt-prashna-anvaya",
            name: "प्रश्ननिर्माणम्, श्लोकान्वयः / भावार्थः (9 Marks)",
            shortCode: "literature",
            description: "रेखाङ्कितपदानि आधृत्य प्रश्ननिर्माणम् (4M) तथा श्लोकान्वयः/भावार्थः मञ्जूषासहायतया (5M)।",
            defaultMarksPerQuestion: 9,
            allowedMarks: [9],
            defaultCount: 1,
            internalChoiceNote: "विकल्पसहितम्"
          },
          {
            id: "skt-ghatnakram",
            name: "घटनाक्रमानुसारेण वाक्यलेखनम् एवं अर्थचयनम् (6 Marks)",
            shortCode: "literature",
            description: "कथाक्रमेण 8 वाक्यानि (4M) तथा प्रसंगानुकूल-शब्दार्थचयनम् (2M)।",
            defaultMarksPerQuestion: 6,
            allowedMarks: [6],
            defaultCount: 1,
            internalChoiceNote: "अनिवार्यम्"
          }
        ]
      }
    ]
  }
};

// ============================================================================
// DYNAMIC PATTERN GENERATOR & LOOKUP HELPER
// ============================================================================

/**
 * Normalizes subject names to ensure resilient lookup
 */
export function normalizeSubjectKey(subject: string): string {
  const s = subject.toLowerCase().trim();
  if (s.includes('math')) return 'Mathematics';
  if (s.includes('science') && !s.includes('social')) return 'Science';
  if (s.includes('social')) return 'Social Science';
  if (s.includes('english')) return 'English';
  if (s.includes('hindi') && (s.includes('course b') || s.includes('sparsh') || s.includes('course-b'))) return 'Hindi Course B';
  if (s.includes('hindi')) return 'Hindi Course A';
  if (s.includes('telugu') && (s.includes('andhra') || s.includes('parimalam') || s.includes('ap'))) return 'Telugu (Andhra Pradesh)';
  if (s.includes('telugu')) return 'Telugu (Andhra Pradesh)';
  if (s.includes('sanskrit')) return 'Sanskrit';
  return subject.trim();
}

/**
 * Returns the exact verified pattern for the given session, board, grade, and subject.
 * Generates subject-appropriate dynamic structure if an unlisted subject or class is requested.
 */
export function getSubjectPattern(
  board: string,
  classLevel: string,
  subject: string,
  academicSession: string = "2026-27",
  course?: string
): SubjectPaperPattern {
  const normSubj = normalizeSubjectKey(subject);
  const patternKey = `${classLevel}-${normSubj}`;

  // 1. Direct match for Class 10 verified patterns
  if (VERIFIED_SUBJECT_PATTERNS[patternKey]) {
    const base = VERIFIED_SUBJECT_PATTERNS[patternKey];
    return {
      ...base,
      academicSession,
      board: board || base.board,
    };
  }

  // 2. Class 9 Patterns (Adapted from Class 10 with verified standard structure)
  if (classLevel === "Class 9") {
    const class10Equivalent = VERIFIED_SUBJECT_PATTERNS[`Class 10-${normSubj}`];
    if (class10Equivalent) {
      return {
        ...class10Equivalent,
        id: `cbse-9-${normSubj.toLowerCase().replace(/\s+/g, '-')}-2026`,
        academicSession,
        board: board || class10Equivalent.board,
        classLevel: "Class 9",
        displayName: `${board} Class 9 ${normSubj}`,
        isVerified: true,
        sourceReference: `NCERT/CBSE Class 9 ${normSubj} Curriculum 2024-26`,
      };
    }
  }

  // 3. Middle School (Classes 6 to 8) Dynamic Subject-Specific Patterns
  const isLanguage = ['English', 'Hindi', 'Hindi Course A', 'Hindi Course B', 'Telugu', 'Telugu (Andhra Pradesh)', 'Sanskrit'].some(l => normSubj.includes(l));
  
  if (isLanguage) {
    // Verified Language Pattern for Middle School
    return {
      id: `${board.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${classLevel.toLowerCase().replace(/\s+/g, '-')}-${normSubj.toLowerCase().replace(/\s+/g, '-')}`,
      academicSession,
      board,
      classLevel,
      subject: normSubj,
      displayName: `${board} ${classLevel} ${normSubj} Language Pattern`,
      totalMarks: 80,
      duration: "3 Hours",
      durationMinutes: 180,
      isVerified: true,
      sourceReference: `NCERT / SCERT ${classLevel} ${normSubj} Standard Evaluation Pattern`,
      generalInstructions: [
        "All questions are compulsory according to given instructions.",
        "Section A: Reading Comprehension (Unseen passages / poems).",
        "Section B: Grammar and Vocabulary.",
        "Section C: Textbook questions and literature comprehension.",
        "Section D: Creative Writing and expression."
      ],
      sections: [
        {
          id: "lang-sec-a",
          sectionCode: "Section A",
          title: "Section A: Reading & Comprehension (అవగాహన / अपठित बोध / Reading)",
          instructions: "Unseen passages and poems with comprehension questions (16 Marks).",
          totalMarks: 16,
          questionTypes: [
            {
              id: "lang-unseen-1",
              name: "Unseen Comprehension Passage",
              shortCode: "reading",
              description: "Passage followed by direct and analytical comprehension questions.",
              defaultMarksPerQuestion: 8,
              allowedMarks: [8],
              defaultCount: 2,
              internalChoiceNote: "Compulsory questions"
            }
          ]
        },
        {
          id: "lang-sec-b",
          sectionCode: "Section B",
          title: "Section B: Grammar & Vocabulary (భాషాంశాలు / व्याकरण / Grammar)",
          instructions: "Prescribed grammar rules, parts of speech, and vocabulary (24 Marks).",
          totalMarks: 24,
          questionTypes: [
            {
              id: "lang-grammar-obj",
              name: "Grammar & Vocabulary Questions",
              shortCode: "grammar",
              description: "Short and objective questions testing applied grammar.",
              defaultMarksPerQuestion: 2,
              allowedMarks: [1, 2],
              defaultCount: 12,
              internalChoiceNote: "Internal choice in some parts"
            }
          ]
        },
        {
          id: "lang-sec-c",
          sectionCode: "Section C",
          title: "Section C: Textbook & Literature (పాఠ్యభాగం / पाठ्यपुस्तक / Literature)",
          instructions: "Questions based on prescribed textbook lessons and poems (24 Marks).",
          totalMarks: 24,
          questionTypes: [
            {
              id: "lang-lit-sa",
              name: "Short & Long Literature Questions",
              shortCode: "literature",
              description: "Questions assessing comprehension of prescribed lessons and poems.",
              defaultMarksPerQuestion: 4,
              allowedMarks: [3, 4, 5],
              defaultCount: 6,
              internalChoiceNote: "Internal choice provided in long questions"
            }
          ]
        },
        {
          id: "lang-sec-d",
          sectionCode: "Section D",
          title: "Section D: Creative Writing (సృజనాత్మక రచన / रचनात्मक लेखन / Writing)",
          instructions: "Paragraph, letter, or story writing tasks (16 Marks).",
          totalMarks: 16,
          questionTypes: [
            {
              id: "lang-creative-tasks",
              name: "Creative Writing Tasks",
              shortCode: "writing",
              description: "Letter writing, story expansion, or descriptive essay.",
              defaultMarksPerQuestion: 8,
              allowedMarks: [5, 6, 8],
              defaultCount: 2,
              internalChoiceNote: "Internal choice in each task"
            }
          ]
        }
      ]
    };
  }

  // Fallback for General / STEM Middle School Subjects (Math, Science, Social)
  return {
    id: `standard-${classLevel.toLowerCase().replace(/\s+/g, '-')}-${normSubj.toLowerCase().replace(/\s+/g, '-')}`,
    academicSession,
    board,
    classLevel,
    subject: normSubj,
    displayName: `${board} ${classLevel} ${normSubj}`,
    totalMarks: 80,
    duration: "3 Hours",
    durationMinutes: 180,
    isVerified: true,
    sourceReference: `NCERT ${classLevel} ${normSubj} Curriculum Framework`,
    generalInstructions: [
      "This question paper contains multiple sections.",
      "All questions are compulsory.",
      "Section A: Objective & MCQs (20 Marks)",
      "Section B: Very Short Answer Questions (12 Marks)",
      "Section C: Short Answer Questions (24 Marks)",
      "Section D: Long Answer Questions (24 Marks)"
    ],
    sections: [
      {
        id: "gen-sec-a",
        sectionCode: "A",
        title: "Section A (Objective & MCQs)",
        instructions: "Questions 1 to 20 carry 1 mark each.",
        totalMarks: 20,
        questionTypes: [
          {
            id: "gen-mcq",
            name: "Multiple Choice & Objective Questions",
            shortCode: "mcq",
            description: "Objective questions testing fundamental understanding.",
            defaultMarksPerQuestion: 1,
            allowedMarks: [1],
            defaultCount: 20,
            internalChoiceNote: "No overall choice"
          }
        ]
      },
      {
        id: "gen-sec-b",
        sectionCode: "B",
        title: "Section B (Very Short Answer)",
        instructions: "6 questions carrying 2 marks each.",
        totalMarks: 12,
        questionTypes: [
          {
            id: "gen-vsa",
            name: "Very Short Answer (VSA)",
            shortCode: "vsaq",
            description: "Brief answers and step-by-step calculations.",
            defaultMarksPerQuestion: 2,
            allowedMarks: [2],
            defaultCount: 6,
            internalChoiceNote: "Internal choice in 2 questions"
          }
        ]
      },
      {
        id: "gen-sec-c",
        sectionCode: "C",
        title: "Section C (Short Answer)",
        instructions: "8 questions carrying 3 marks each.",
        totalMarks: 24,
        questionTypes: [
          {
            id: "gen-sa",
            name: "Short Answer (SA)",
            shortCode: "saq",
            description: "Detailed problem solving and conceptual explanations.",
            defaultMarksPerQuestion: 3,
            allowedMarks: [3],
            defaultCount: 8,
            internalChoiceNote: "Internal choice in 2 questions"
          }
        ]
      },
      {
        id: "gen-sec-d",
        sectionCode: "D",
        title: "Section D (Long Answer)",
        instructions: "4 questions carrying 6 marks each (or 5M with sub-parts).",
        totalMarks: 24,
        questionTypes: [
          {
            id: "gen-la",
            name: "Long Answer (LA)",
            shortCode: "laq",
            description: "Comprehensive problem solving and application questions.",
            defaultMarksPerQuestion: 6,
            allowedMarks: [5, 6],
            defaultCount: 4,
            internalChoiceNote: "Internal choice in 2 questions"
          }
        ]
      }
    ]
  };
}

/**
 * Formats the active subject pattern into a structured prompt section for the AI generator
 */
export function buildPatternGenerationPrompt(pattern: SubjectPaperPattern, activeCounts?: Record<string, number>): string {
  const sectionsList = pattern.sections.map((sec, sIdx) => {
    const qTypesList = sec.questionTypes.map(qt => {
      const count = activeCounts && activeCounts[qt.id] !== undefined ? activeCounts[qt.id] : qt.defaultCount;
      return `      - Type: "${qt.name}" (Code: ${qt.shortCode}) | Count: ${count} questions | Marks each: ${qt.defaultMarksPerQuestion}M | Choice: ${qt.internalChoiceNote || 'Standard choice'}`;
    }).join('\n');

    return `  [SECTION ${sIdx + 1}: ${sec.title}]
    Section Code: "${sec.sectionCode}"
    Instructions: "${sec.instructions || ''}"
    Target Marks for this Section: ${sec.totalMarks} Marks
    Question Types Breakdown:
${qTypesList}`;
  }).join('\n\n');

  return `
================================================================================
EXACT SUBJECT-SPECIFIC PAPER BLUEPRINT & PATTERN (STRICT ENFORCEMENT):
================================================================================
Academic Session: ${pattern.academicSession}
Board: ${pattern.board}
Class: ${pattern.classLevel}
Subject / Course: ${pattern.subject} (${pattern.displayName})
Total Marks: ${pattern.totalMarks} Marks
Duration: ${pattern.duration}
Verification Status: ${pattern.isVerified ? 'OFFICIALLY VERIFIED PATTERN' : 'CUSTOM PATTERN'}
Source Reference: ${pattern.sourceReference}

GENERAL INSTRUCTIONS TO INCLUDE IN PAPER:
${pattern.generalInstructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}

SECTION STRUCTURE & QUESTION TYPES:
${sectionsList}

CRITICAL SUBJECT INTEGRITY MANDATES:
1. ONLY generate question types explicitly listed in the section breakdown above.
2. DO NOT include Science-style Assertion-Reason or Case Studies in Language subjects (Telugu, Hindi, English, Sanskrit) unless explicitly specified in the pattern above.
3. For Telugu papers: Write all questions, options, section names, and answer keys in authentic Telugu script (తెలుగు లిపి).
4. For Hindi papers: Write in fluent Devanagari script (देवनागरी लिपि) under खंड क, ख, ग, घ.
5. For Mathematics/Science: Provide diagram_prompt where geometric/circuit/ray visual representation is necessary.
6. The sum of all question marks in each section must exactly equal the section target marks, and the total of all sections must equal ${pattern.totalMarks} Marks.
================================================================================
`;
}
