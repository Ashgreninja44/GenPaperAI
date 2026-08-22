
export const BOARDS = [
  "CBSE / NCERT (New)",
  "CBSE / NCERT (Old)",
  "AP SCERT",
  "Telangana SCERT"
];

export const GRADES = [
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
];

export const PRESET_SCHOOLS = [
  "Aditya Birla Public School",
  "DAV Public School",
  "Delhi Public School (DPS)",
  "Kendriya Vidyalaya",
  "Jawahar Navodaya Vidyalaya",
  "Sri Chaitanya School",
  "Narayana School",
  "Other School (Custom Name)"
];

export const FONT_OPTIONS = [
  { label: 'Times New Roman (Serif)', value: '"Times New Roman", Times, serif' },
  { label: 'Arial (Sans-serif)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia (Serif)', value: 'Georgia, serif' },
  { label: 'Merriweather (Serif)', value: '"Merriweather", serif' },
  { label: 'Playfair Display (Serif)', value: '"Playfair Display", serif' },
  { label: 'Inter (Sans-serif)', value: '"Inter", sans-serif' },
  { label: 'Roboto (Sans-serif)', value: '"Roboto", sans-serif' },
  { label: 'Open Sans (Sans-serif)', value: '"Open Sans", sans-serif' },
];

export const TEST_TYPES = [
  "Periodic Test 1",
  "Periodic Test 2",
  "Weekly Test",
  "Practice Test",
  "Chapter-wise Test",
  "Half Yearly Exam",
  "Annual Exam",
  "CBSE Board Exam", // Triggers Official Pattern
  "Custom Test" // Triggers the Custom Builder
];

export const QUESTION_TYPES_DROPDOWN = [
  { value: "Multiple Choice Question (MCQ)", label: "MCQ" },
  { value: "Assertion-Reason", label: "Assertion-Reason" },
  { value: "Fill in the Blanks", label: "Fill in the Blanks" },
  { value: "True/False", label: "True/False" },
  { value: "Very Short Answer (VSAQ)", label: "Very Short Answer" },
  { value: "Short Answer (SAQ)", label: "Short Answer" },
  { value: "Long Answer (LAQ)", label: "Long Answer" },
  { value: "Case Study / Source Based", label: "Case Study" },
  { value: "Picture Based", label: "Picture Based" },
  { value: "Match the Following", label: "Match the Following" }
];

// ------------------------------------------------------------------
// CBSE OFFICIAL EXAM PATTERNS (Class 10)
// ------------------------------------------------------------------
export const CBSE_EXAM_PATTERNS: Record<string, any> = {
  "English Language & Literature": {
    "subject": "English Language & Literature",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "A",
        "title": "Reading Skills",
        "num_questions": 2,
        "question_types": "Passage-based comprehension (MCQs and short answers)",
        "marks_each": [10, 10],
        "total_marks": 20,
        "internal_choice": "No overall choice"
      },
      {
        "section": "B",
        "title": "Grammar and Creative Writing Skills",
        "num_questions": 2,
        "question_types": "Grammar tasks (fill-in, error correction, etc.) & Writing (letter/notice/paragraph)",
        "marks_each": [10, 10],
        "total_marks": 20,
        "internal_choice": "Grammar: any 10 of 12 tasks; Writing: two questions (attempt any one)"
      },
      {
        "section": "C",
        "title": "Literature Textbook",
        "num_questions": 8,
        "question_types": "Short and long answers based on prose/poems (MCQs, SA, LA)",
        "marks_each": [6, 5, 5, 12, 3, 6, 6, 7],
        "total_marks": 40,
        "internal_choice": "Internal choice in questions: Q7 (5A/5B), Q8 (any 4 of 5), Q10, Q11 (1 of 2 options)"
      }
    ]
  },
  "Hindi Course A": {
    "subject": "Hindi Course A",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "क",
        "title": "अपठित गद्यांश (Unseen passage)",
        "num_questions": 2,
        "question_types": "Comprehension questions on unseen passages",
        "marks_each": [7, 7],
        "total_marks": 14,
        "internal_choice": "No choice (all sub-questions compulsory)"
      },
      {
        "section": "ख",
        "title": "व्यावहारिक व्याकरण (Functional Grammar)",
        "num_questions": 4,
        "question_types": "Grammar exercises (transformation, usage, etc.)",
        "marks_each": ["varies"],
        "total_marks": 30,
        "internal_choice": "Answer any 16 out of 20 sub-questions (≈33% choice)"
      },
      {
        "section": "ग",
        "title": "पाठ्यपुस्तक (Textbook)",
        "num_questions": 5,
        "question_types": "Questions from syllabus",
        "marks_each": ["varies"],
        "total_marks": 30,
        "internal_choice": "Internal choice in sections"
      },
       {
        "section": "घ",
        "title": "रचनात्मक लेखन (Creative Writing)",
        "num_questions": 3,
        "question_types": "Writing tasks",
        "marks_each": ["varies"],
        "total_marks": 6,
        "internal_choice": "Internal options provided"
      }
    ]
  },
  "Hindi Course B": {
    "subject": "Hindi Course B",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "क",
        "title": "अपठित गद्यांश (Unseen passage)",
        "num_questions": 2,
        "question_types": "Comprehension questions on unseen passages",
        "marks_each": [7, 7],
        "total_marks": 14,
        "internal_choice": "No choice (all sub-questions compulsory)"
      },
      {
        "section": "ख",
        "title": "व्यावहारिक व्याकरण (Functional Grammar)",
        "num_questions": 4,
        "question_types": "Grammar exercises (fill-ups, error correction, etc.)",
        "marks_each": ["varies"],
        "total_marks": 30,
        "internal_choice": "Answer any 16 out of 20 sub-questions (approx. 33% choice)"
      },
      {
        "section": "ग",
        "title": "पाठ्यपुस्तक आधारित प्रश्न (Textbook-based)",
        "num_questions": 6,
        "question_types": "Questions from syllabus (MCQ, SA, LA on prescribed text)",
        "marks_each": ["varies"],
        "total_marks": 30,
        "internal_choice": "Internal choice in some questions"
      },
      {
        "section": "घ",
        "title": "रचनात्मक लेखन (Creative Writing)",
        "num_questions": 4,
        "question_types": "Writing tasks (letter, story, etc.)",
        "marks_each": ["varies"],
        "total_marks": 6,
        "internal_choice": "Each question has internal choice"
      }
    ]
  },
  "Mathematics (Basic)": {
    "subject": "Mathematics (Basic)",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "A",
        "title": "Multiple Choice Questions",
        "num_questions": 20,
        "question_types": "MCQ including Assertion-Reason",
        "marks_each": 1,
        "total_marks": 20,
        "internal_choice": "No choice (all 20 compulsory)"
      },
      {
        "section": "B",
        "title": "Very Short Answer (VSA)",
        "num_questions": 5,
        "question_types": "VSA type questions",
        "marks_each": 2,
        "total_marks": 10,
        "internal_choice": "Internal choice in 2 questions (attempt either)"
      },
      {
        "section": "C",
        "title": "Short Answer (SA)",
        "num_questions": 6,
        "question_types": "SA type questions",
        "marks_each": 3,
        "total_marks": 18,
        "internal_choice": "Internal choice in 2 questions (attempt either)"
      },
      {
        "section": "D",
        "title": "Long Answer (LA)",
        "num_questions": 4,
        "question_types": "LA type questions",
        "marks_each": 5,
        "total_marks": 20,
        "internal_choice": "Internal choice in 2 questions (attempt either)"
      },
      {
        "section": "E",
        "title": "Case Study-Based",
        "num_questions": 3,
        "question_types": "Case-study questions with sub-parts",
        "marks_each": 4,
        "total_marks": 12,
        "internal_choice": "Internal choice in all 2-mark sub-parts"
      }
    ]
  },
  "Mathematics (Standard)": {
    "subject": "Mathematics (Standard)",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "A",
        "title": "Multiple Choice Questions",
        "num_questions": 20,
        "question_types": "MCQ including Assertion-Reason",
        "marks_each": 1,
        "total_marks": 20,
        "internal_choice": "No choice (all 20 compulsory)"
      },
      {
        "section": "B",
        "title": "Very Short Answer (VSA)",
        "num_questions": 5,
        "question_types": "VSA type questions",
        "marks_each": 2,
        "total_marks": 10,
        "internal_choice": "Internal choice in 2 questions (attempt either)"
      },
      {
        "section": "C",
        "title": "Short Answer (SA)",
        "num_questions": 6,
        "question_types": "SA type questions",
        "marks_each": 3,
        "total_marks": 18,
        "internal_choice": "Internal choice in 2 questions (attempt either)"
      },
      {
        "section": "D",
        "title": "Long Answer (LA)",
        "num_questions": 4,
        "question_types": "LA type questions",
        "marks_each": 5,
        "total_marks": 20,
        "internal_choice": "Internal choice in 2 questions (attempt either)"
      },
      {
        "section": "E",
        "title": "Case Study-Based",
        "num_questions": 3,
        "question_types": "Case-study questions with sub-parts",
        "marks_each": 4,
        "total_marks": 12,
        "internal_choice": "Internal choice in all 2-mark sub-parts"
      }
    ]
  },
  "Science": {
    "subject": "Science",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "A",
        "title": "MCQ and Assertion-Reason",
        "num_questions": 20,
        "question_types": "16 MCQs + 4 Assertion-Reason (1 mark each)",
        "marks_each": 1,
        "total_marks": 20,
        "internal_choice": "Internal choice in ~33% questions"
      },
      {
        "section": "B",
        "title": "Short Answer-I",
        "num_questions": 6,
        "question_types": "SA-I questions",
        "marks_each": 2,
        "total_marks": 12,
        "internal_choice": "No overall choice (some sub-choices within Qs)"
      },
      {
        "section": "C",
        "title": "Short Answer-II",
        "num_questions": 7,
        "question_types": "SA-II questions",
        "marks_each": 3,
        "total_marks": 21,
        "internal_choice": "No overall choice (some sub-choices within Qs)"
      },
      {
        "section": "D",
        "title": "Long Answer",
        "num_questions": 3,
        "question_types": "LA questions",
        "marks_each": 5,
        "total_marks": 15,
        "internal_choice": "No overall choice (one question with choice)"
      },
      {
        "section": "E",
        "title": "Case/Source-Based",
        "num_questions": 3,
        "question_types": "Source/case/passage-based (4 marks each)",
        "marks_each": 4,
        "total_marks": 12,
        "internal_choice": "Sub-parts with internal choice (1/2/3 marks)"
      }
    ]
  },
  "Social Science": {
    "subject": "Social Science",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "A",
        "title": "MCQs (History, Geography, Civics, Economics)",
        "num_questions": 20,
        "question_types": "Objective MCQs (1 mark each)",
        "marks_each": 1,
        "total_marks": 20,
        "internal_choice": "No overall choice"
      },
      {
        "section": "B",
        "title": "Very Short Answer",
        "num_questions": 4,
        "question_types": "VSA questions",
        "marks_each": 2,
        "total_marks": 8,
        "internal_choice": "Internal choice in 1 question"
      },
      {
        "section": "C",
        "title": "Short Answer",
        "num_questions": 5,
        "question_types": "SA questions",
        "marks_each": 3,
        "total_marks": 15,
        "internal_choice": "Internal choice in 1 question"
      },
      {
        "section": "D",
        "title": "Long Answer",
        "num_questions": 4,
        "question_types": "LA questions",
        "marks_each": 5,
        "total_marks": 20,
        "internal_choice": "Internal choice in 1 question"
      },
      {
        "section": "E",
        "title": "Case-Based",
        "num_questions": 3,
        "question_types": "Case-based passages with sub-questions (4 marks each)",
        "marks_each": 4,
        "total_marks": 12,
        "internal_choice": "Sub-questions with internal choices"
      },
      {
        "section": "F",
        "title": "Map Work",
        "num_questions": 1,
        "question_types": "Map marking",
        "marks_each": 5,
        "total_marks": 5,
        "internal_choice": "No choice"
      }
    ]
  },
  "Telugu (Andhra Pradesh)": {
    "subject": "Telugu (Andhra Pradesh)",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "విభాగం - అ",
        "title": "అవగాహన - ప్రతిస్పందన (Reading & Comprehension)",
        "num_questions": 4,
        "question_types": "అపరిచిత గద్యం, అపరిచిత పద్యం, పరిచిత గద్యం/పద్యం ఆధారిత ప్రశ్నలు (16 మార్కులు)",
        "marks_each": 4,
        "total_marks": 16,
        "internal_choice": "అన్ని ప్రశ్నలలో అంతర్గత ఎంపిక కలదు"
      },
      {
        "section": "విభాగం - ఆ",
        "title": "వ్యక్తీకరణ - సృజనాత్మకత (Writing & Creative Expression)",
        "num_questions": 4,
        "question_types": "స్వీయ రచన (లఘు & దీర్ఘ సమాధానాలు), లేఖా రచన / కరపత్రం / ప్రకటన / సంభాషణ రచన (32 మార్కులు)",
        "marks_each": 8,
        "total_marks": 32,
        "internal_choice": "ప్రతి ప్రశ్నకు అంతర్గత ఎంపిక (ఈ క్రింది వానిలో ఒకదానికి సమాధానం రాయండి)"
      },
      {
        "section": "విభాగం - ఇ",
        "title": "భాషాంశాలు & వ్యాకరణం (Grammar & Vocabulary)",
        "num_questions": 16,
        "question_types": "సంధులు, సమాసాలు, అలంకారాలు, ఛందస్సు, పర్యాయపదాలు, నానార్థాలు, జాతీయాలు, సామెతలు, ప్రకృతి-వికృతులు (32 మార్కులు)",
        "marks_each": 2,
        "total_marks": 32,
        "internal_choice": "లక్ష్యాత్మక & సంక్షిప్త వ్యాకరణ ప్రశ్నలు"
      }
    ]
  },
  "Telugu (Telangana)": {
    "subject": "Telugu (Telangana)",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "A",
        "title": "Reading Section",
        "num_questions": 1,
        "question_types": "Passage-based comprehension (పాఠ్య భాగం)",
        "marks_each": 10,
        "total_marks": 10,
        "internal_choice": "Internal choice (attempt any one)"
      },
      {
        "section": "B",
        "title": "Writing Section",
        "num_questions": 2,
        "question_types": "Letter/Essay (వచనం)",
        "marks_each": [6, 5],
        "total_marks": 11,
        "internal_choice": "Internal choice in each question"
      },
      {
        "section": "C",
        "title": "Grammar Section",
        "num_questions": 9,
        "question_types": "Poetry and prose MCQs/SAQs (వ్యాకరణ భాగం)",
        "marks_each": 29/9,
        "total_marks": 29,
        "internal_choice": "Internal choice in many questions"
      },
      {
        "section": "D",
        "title": "Literature Textbook Section",
        "num_questions": 6,
        "question_types": "Paragraph writing and comprehension (విద్యాసంగ्रहం)",
        "marks_each": 5,
        "total_marks": 30,
        "internal_choice": "Internal choice in each question"
      }
    ]
  },
  "Sanskrit": {
    "subject": "Sanskrit",
    "total_marks": 80,
    "duration": 180,
    "sections": [
      {
        "section": "क",
        "title": "अपठित-अवबोधनम् (Unseen Passage)",
        "num_questions": 1,
        "question_types": "One-word and full-sentence comprehension, title selection (10 marks)",
        "marks_each": 10,
        "total_marks": 10,
        "internal_choice": "No choice"
      },
      {
        "section": "ख",
        "title": "रचनात्मक-कार्यम् (Creative Writing)",
        "num_questions": 3,
        "question_types": "Letter writing, Picture description, Sentence composition (15 marks)",
        "marks_each": 5,
        "total_marks": 15,
        "internal_choice": "Internal choices provided in each task"
      },
      {
        "section": "ग",
        "title": "अनुप्रयुक्त-व्याकरणम् (Applied Grammar)",
        "num_questions": 7,
        "question_types": "Sandhi, Samasa, Pratyaya, Avyaya, Vachana, Samaya, etc. (25 marks)",
        "marks_each": ["varies"],
        "total_marks": 25,
        "internal_choice": "Answer any 4 out of 5 in each sub-part"
      },
      {
        "section": "घ",
        "title": "पठित-अवबोधनम् (Reading Comprehension)",
        "num_questions": 6,
        "question_types": "Prose/poetry/drama comprehension, Shloka matching, word-meaning (30 marks)",
        "marks_each": ["varies"],
        "total_marks": 30,
        "internal_choice": "Internal choice in comprehension and matching"
      }
    ]
  }
};

const NEW_NCERT_SYLLABUS: Record<string, Record<string, any>> = {
  "Class 6": {
    "Mathematics": {
      "book": "Ganit Prakash",
      "chapters": [
        "Patterns in Mathematics",
        "Lines and Angles",
        "Number Play",
        "Data Handling and Presentation",
        "Prime Time",
        "Perimeter and Area",
        "Fractions",
        "Playing with Constructions",
        "Symmetry",
        "The Other Side of Zero"
      ]
    },
    "Science": {
      "book": "Curiosity",
      "chapters": [
        "The Wonderful World of Science",
        "Diversity in the Living World",
        "Mindful Eating: A Path to a Healthy Body",
        "Exploring Magnets",
        "Measurement of Length and Motion",
        "Materials Around Us",
        "Temperature and its Measurement",
        "A Journey through States of Water",
        "Methods of Separation in Everyday Life",
        "Living Creatures: Exploring their Characteristics",
        "Nature's Treasures",
        "Beyond Earth"
      ]
    },
    "English": {
      "book": "Poorvi",
      "chapters": [
        "A Bottle of Dew",
        "The Raven and the Fox",
        "Rama to the Rescue",
        "The Unlikely Best Friends",
        "A Friend's Prayer",
        "The Chair",
        "Neem Baba",
        "What a Bird Thought",
        "Spices that Heal Us",
        "Change of Heart",
        "The Winner",
        "Yoga—A Way of Life",
        "Hamara Bharat—Incredible India!",
        "The Kites",
        "Ila Sachani: Embroidering Dreams with her Feet",
        "National War Memorial"
      ]
    },
    "Hindi": {
      "book": "Malhar",
      "chapters": [
        "मातृभूमि",
        "गोल",
        "पहली बूँद",
        "हार की जीत",
        "रहीम के दोहे",
        "मेरी माँ",
        "जलाते चलो",
        "सत्रिया और बिहू नृत्य",
        "मैया मैं नहीं माखन खायो",
        "परीक्षा",
        "चेतक की वीरता",
        "हिंद महासागर में छोटा-सा हिंदुस्तान",
        "पेड़ की बात"
      ]
    },
    "Social Science": {
      "book": "Exploring Society: India and Beyond",
      "chapters": [
        "Locating Places on the Earth",
        "Oceans and Continents",
        "Landforms and Life",
        "Timeline and Sources of History",
        "India, That Is Bharat",
        "The Beginnings of Indian Civilisation",
        "India's Cultural Roots",
        "Unity in Diversity, or 'Many in the One'",
        "Family and Community",
        "Grassroots Democracy – Part 1: Governance",
        "Grassroots Democracy – Part 2: Local Government in Rural Areas",
        "Grassroots Democracy – Part 3: Local Government in Urban Areas",
        "The Value of Work",
        "Economic Activities Around Us"
      ]
    }
  },
  "Class 7": {
    "Mathematics": {
      "book": "Ganit Prakash",
      "chapters": [
        "Large Numbers Around Us",
        "Arithmetic Expressions",
        "A Peek Beyond the Point",
        "Expressions using Letter-Numbers",
        "Parallel and Intersecting Lines",
        "Number Play",
        "A Tale of Three Intersecting Lines",
        "Working with Fractions",
        "Geometric Twins",
        "Operations with Integers",
        "Finding Common Ground",
        "Another Peek Beyond the Point",
        "Connecting the Dots...",
        "Constructions and Tilings",
        "Finding the Unknown"
      ]
    },
    "Science": {
      "book": "Curiosity",
      "chapters": [
        "The Ever-Evolving World of Science",
        "Exploring Substances: Acidic, Basic, and Neutral",
        "Electricity: Circuits and their Components",
        "The World of Metals and Non-metals",
        "Changes Around Us: Physical and Chemical",
        "Adolescence: A Stage of Growth and Change",
        "Heat Transfer in Nature",
        "Measurement of Time and Motion",
        "Life Processes in Animals",
        "Life Processes in Plants",
        "Light: Shadows and Reflections",
        "Earth, Moon, and the Sun"
      ]
    },
    "English": {
      "book": "Poorvi",
      "chapters": [
        "The Day the River Spoke",
        "Try Again",
        "Three Days to See",
        "Animals, Birds, and Dr. Dolittle",
        "A Funny Man",
        "Say the Right Thing",
        "My Brother's Great Invention",
        "Paper Boats",
        "North, South, East, West",
        "The Tunnel",
        "Travel",
        "Conquering the Summit",
        "A Homage to Our Brave Soldiers",
        "My Dear Soldiers",
        "Rani Abbakka"
      ]
    },
    "Hindi": {
      "book": "Malhar",
      "chapters": [
        "माँ, कह एक कहानी",
        "तीन बुद्धिमान",
        "फूल और काँटा",
        "पानी रे पानी",
        "नहीं होना बीमार",
        "गिरिधर कविराय की कुंडलियाँ",
        "वर्षा-बहार",
        "बिरजू महाराज से साक्षात्कार",
        "चिड़िया",
        "मीरा के पद"
      ]
    },
    "Social Science": {
      "book": "Exploring Society: India and Beyond",
      "chapters": [
        "Geographical Diversity of India",
        "Understanding the Weather",
        "Climates of India",
        "New Beginnings: Cities and States",
        "The Rise of Empires",
        "The Age of Reorganisation",
        "The Gupta Era: An Age of Tireless Creativity",
        "How the Land Becomes Sacred",
        "From the Rulers to the Ruled: Types of Governments",
        "The Constitution of India — An Introduction",
        "From Barter to Money",
        "Understanding Markets"
      ]
    }
  },
  "Class 8": {
    "Mathematics": {
      "book": "Ganit Prakash",
      "chapters": [
        "A Square and A Cube",
        "Power Play",
        "A Story of Numbers",
        "Quadrilaterals",
        "Number Play",
        "We Distribute, Yet Things Multiply",
        "Proportional Reasoning-1",
        "Fractions in Disguise",
        "The Baudhayana-Pythagoras Theorem",
        "Proportional Reasoning-2",
        "Exploring Some Geometric Themes",
        "Tales by Dots and Lines",
        "Algebra Play",
        "Area"
      ]
    },
    "Science": {
      "book": "Curiosity",
      "chapters": [
        "Exploring the Investigative World of Science",
        "The Invisible Living World: Beyond Our Naked Eye",
        "Health: The Ultimate Treasure",
        "Electricity: Magnetic and Heating Effects",
        "Exploring Forces",
        "Pressure, Winds, Storms, and Cyclones",
        "Particulate Nature of Matter",
        "Nature of Matter: Elements, Compounds, and Mixtures",
        "The Amazing World of Solutes, Solvents, and Solutions",
        "Light: Mirrors and Lenses",
        "Keeping Time with the Skies",
        "How Nature Works in Harmony",
        "Our Home: Earth, a Unique Life Sustaining Planet"
      ]
    },
    "English": {
      "book": "Poorvi",
      "chapters": [
        "The Wit that Won Hearts",
        "A Concrete Example",
        "Wisdom Paves the Way",
        "A Tale of Valour: Major Somnath Sharma",
        "Somebody's Mother",
        "Verghese Kurien - I Too Had A Dream",
        "The Case of the Fifth Word",
        "The Magic Brush of Dreams",
        "Spectacular Wonders",
        "The Cherry Tree",
        "Harvest Hymn",
        "Waiting for the Rain",
        "Feathered Friend",
        "Magnifying Glass",
        "Bibha Chowdhuri: The Beam of Light"
      ]
    },
    "Hindi": {
      "book": "Malhar",
      "chapters": [
        "स्वदेश",
        "दो गौरैैया",
        "एक आशीर्वाद",
        "हरिद्वार",
        "कबीर के दोहे",
        "एक टोकरी भर मिट्टी",
        "मत बाँधो",
        "नए मेहमान",
        "आदमी का अनुपात",
        "तरुण के स्वप्न"
      ]
    },
    "Social Science": {
      "book": "Exploring Society: India and Beyond",
      "chapters": [
        "Natural Resources and Their Use",
        "Reshaping India's Political Map",
        "The Rise of the Marathas",
        "The Colonial Era in India",
        "Universal Franchise and India's Electoral System",
        "The Parliamentary System: Legislature and Executive",
        "Factors of Production"
      ]
    },
    "Sanskrit": {
      "book": "Deepakam",
      "chapters": [
        "संगच्छध्वं संवदध्वम्",
        "अल्पानामपि वस्तूनां संहतिः कार्यसाधिका",
        "सुभाषितरसं पीत्वा जीवनं सफलं कुरु",
        "प्रणम्यो देशभक्तोऽयं गोपबन्धुर्महामनाः",
        "गीता सुगीता कर्तव्या",
        "डिजिभारतम् युगपरिवर्तनम्",
        "मञ्जुलमञ्जूषा सुन्दरसुरभाषा",
        "पश्यत कोणमैशान्यं भारतस्य मनोहरम्",
        "कोऽरुक्? कोऽरुक्? कोऽरुक्?",
        "सन्निमित्ते वरं त्यागः (क-भागः)",
        "सन्निमित्ते वरं त्यागः (ख-भागः)",
        "सम्यग्वर्णप्रयोगेण ब्रह्मलोके महीयते",
        "वर्णोच्चारण-शिक्षा १"
      ]
    },
    "Telugu (Andhra Pradesh)": {
      "book": "Telugu Parimalam",
      "chapters": [
        "Dharma Deeksha",
        "Pratigna",
        "Srujana",
        "Telugu Velugu",
        "Desha Bhakthi",
        "Matti Manushulu"
      ]
    },
    "Telugu (Telangana)": {
      "book": "Singidi",
      "chapters": [
        "Thyagam",
        "Sankranthi mela",
        "Telangana Vaibhavam",
        "Charithra",
        "Veerulu",
        "Samskruthi"
      ]
    }
  },
  "Class 9": {
    "Mathematics": {
      "books": [
        {
          "name": "Mathematics (NCERT Standard)",
          "part": "Standard Course",
          "chapters": [
            "Number Systems",
            "Polynomials",
            "Coordinate Geometry",
            "Linear Equations in Two Variables",
            "Introduction to Euclid's Geometry",
            "Lines and Angles",
            "Triangles",
            "Quadrilaterals",
            "Circles",
            "Heron's Formula",
            "Surface Areas and Volumes",
            "Statistics"
          ]
        },
        {
          "name": "Ganita Manjari Part 1",
          "part": "NCF 2026-27 Reform",
          "chapters": [
            "Orienting Yourself: The Use of Coordinates",
            "Introduction to Linear Polynomials",
            "The World of Numbers",
            "Exploring Algebraic Identities",
            "I'm Up and Down, and Round and Round",
            "Measuring Space: Perimeter and Area",
            "The Mathematics of Maybe: Introduction to Probability",
            "Predicting What Comes Next?: Exploring Sequences and Progressions"
          ]
        }
      ]
    },
    "Science": {
      "books": [
        {
          "name": "Science (NCERT Standard)",
          "part": "Standard Course",
          "chapters": [
            "Matter in Our Surroundings",
            "Is Matter Around Us Pure",
            "Atoms and Molecules",
            "Structure of the Atom",
            "The Fundamental Unit of Life",
            "Tissues",
            "Motion",
            "Force and Laws of Motion",
            "Gravitation",
            "Work and Energy",
            "Sound",
            "Improvement in Food Resources"
          ]
        },
        {
          "name": "Exploration",
          "part": "NCF 2026-27 Reform",
          "chapters": [
            "Cell",
            "Tissues",
            "Reproduction",
            "Diversity",
            "Exploring Mixtures and Their Separation",
            "Atoms and Molecules",
            "Structure of an Atom",
            "Earth as a System: Energy, Matter and Life",
            "Motion",
            "Force and Laws of Motion",
            "Work, Energy and Simple Machines",
            "Sound"
          ]
        }
      ]
    },
    "English": {
      "books": [
        {
          "name": "Beehive",
          "part": "Prose",
          "chapters": [
            "The Fun They Had",
            "The Sound of Music",
            "The Little Girl",
            "A Truly Beautiful Mind",
            "The Snake and the Mirror",
            "My Childhood",
            "Reach for the Top",
            "Kathmandu",
            "If I Were You"
          ]
        },
        {
          "name": "Beehive",
          "part": "Poetry",
          "chapters": [
            "The Road Not Taken",
            "Wind",
            "Rain on the Roof",
            "The Lake Isle of Innisfree",
            "A Legend of the Northland",
            "No Men Are Foreign",
            "On Killing a Tree",
            "A Slumber Did My Spirit Seal"
          ]
        },
        {
          "name": "Moments",
          "part": "Supplementary Reader",
          "chapters": [
            "The Lost Child",
            "The Adventures of Toto",
            "Iswaran the Storyteller",
            "In the Kingdom of Fools",
            "The Happy Prince",
            "The Last Leaf",
            "A House Is Not a Home",
            "The Beggar"
          ]
        },
        {
          "name": "Kaveri",
          "part": "NCF 2026-27 Reform Reader",
          "chapters": [
            "How I Taught My Grandmother to Read",
            "The Pot Maker",
            "Winds of Change",
            "Vitamin-M",
            "The World of Limitless Possibilities",
            "Twin Melodies",
            "Carrier of Words",
            "Follow That Dream",
            "Bharat Our Land",
            "Gifts of Grace: Honouring Our Vocations",
            "Canvas of Soil",
            "I Cannot Remember My Mother",
            "Nine Gold Medals",
            "A Friend Found in Music",
            "Words",
            "Believe in Yourself"
          ]
        }
      ]
    },
    "Hindi Course A": {
      "books": [
        {
          "name": "Kshitij Part 1",
          "part": "Poetry (काव्य खंड)",
          "chapters": [
            "कबीर - साखियाँ एवं सबद",
            "ललद्यद - वाख",
            "रसखान - सवैये",
            "माखनलाल चतुर्वेदी - कैदी और कोकिला",
            "सुमित्रानंदन पंत - ग्राम श्री",
            "सर्वेश्वर दयाल सक्सेना - मेघ आए",
            "राजेश जोशी - बच्चे काम पर जा रहे हैं"
          ]
        },
        {
          "name": "Kshitij Part 1",
          "part": "Prose (गद्य खंड)",
          "chapters": [
            "प्रेमचंद - दो बैलों की कथा",
            "राहुल सांकृत्यायन - ल्हासा की ओर",
            "श्यामाचरण दुबे - उपभोक्तावाद की संस्कृति",
            "जाबिर हुसैन - साँवले सपनों की याद",
            "हरिशंकर परसाई - प्रेमचंद के फटे जूते",
            "महादेवी वर्मा - मेरे बचपन के दिन"
          ]
        },
        {
          "name": "Kritika Part 1",
          "part": "Supplementary Reader (पूरक पाठ्यपुस्तक)",
          "chapters": [
            "फणीश्वरनाथ 'रेणु' - इस जल प्रलय में",
            "मृदुला गर्ग - मेरे संग की औरतें",
            "जगदीश चंद्र माथुर - रीढ़ की हड्डी"
          ]
        },
        {
          "name": "Ganga",
          "part": "NCF 2026-27 Reform Reader",
          "chapters": [
            "दो बैलों की कथा",
            "क्या लिखूँ?",
            "संवादहीन",
            "ऐसी भी बातें होती हैं",
            "आखिरी चट्टान तक",
            "रीढ़ की हड्डी",
            "मैं और मेरा देश",
            "पद",
            "राम-लक्ष्मण-परशुराम संवाद",
            "भारति, जय, विजयकरे!",
            "झाँसी की रानी",
            "घर की याद"
          ]
        }
      ]
    },
    "Hindi Course B": {
      "books": [
        {
          "name": "Sparsh Part 1",
          "part": "Poetry (काव्य खंड)",
          "chapters": [
            "रैदास - पद",
            "रहीम - दोहे",
            "नज़ीर अकबराबादी - आदमी नामा",
            "सियारामशरण गुप्त - एक फूल की चाह",
            "रामधारी सिंह 'दिनकर' - गीत-अगीत",
            "हरिवंश राय बच्चन - अग्नि पथ",
            "अरुण कमल - नए इलाके में..., खुशबू रचते हैं हाथ"
          ]
        },
        {
          "name": "Sparsh Part 1",
          "part": "Prose (गद्य खंड)",
          "chapters": [
            "यशपाल - दुःख का अधिकार",
            "बचेंद्री पाल - एवरेस्ट : मेरी शिखर यात्रा",
            "शरद जोशी - तुम कब जाओगे, अतिथि",
            "धीरंजन मालवे - वैज्ञानिक चेतना के वाहक : चन्द्र शेखर वेंकट रामन्",
            "स्वामी आनंद - शुक्रतारे के समान"
          ]
        },
        {
          "name": "Sanchayan Part 1",
          "part": "Supplementary Reader (पूरक पाठ्यपुस्तक)",
          "chapters": [
            "गिल्लू",
            "स्मृति",
            "कल्लू कुम्हार की उनाकोटी",
            "मेरा छोटा-सा निजी पुस्तकालय"
          ]
        }
      ]
    },
    "Hindi": {
      "books": [
        {
          "name": "Kshitij Part 1",
          "part": "Poetry (काव्य खंड)",
          "chapters": [
            "कबीर - साखियाँ एवं सबद",
            "ललद्यद - वाख",
            "रसखान - सवैये",
            "माखनलाल चतुर्वेदी - कैदी और कोकिला",
            "सुमित्रानंदन पंत - ग्राम श्री",
            "सर्वेश्वर दयाल सक्सेना - मेघ आए",
            "राजेश जोशी - बच्चे काम पर जा रहे हैं"
          ]
        },
        {
          "name": "Kshitij Part 1",
          "part": "Prose (गद्य खंड)",
          "chapters": [
            "प्रेमचंद - दो बैलों की कथा",
            "राहुल सांकृत्यायन - ल्हासा की ओर",
            "श्यामाचरण दुबे - उपभोक्तावाद की संस्कृति",
            "जाबिर हुसैन - साँवले सपनों की याद",
            "हरिशंकर परसाई - प्रेमचंद के फटे जूते",
            "महादेवी वर्मा - मेरे बचपन के दिन"
          ]
        },
        {
          "name": "Kritika Part 1",
          "part": "Supplementary Reader (पूरक पाठ्यपुस्तक)",
          "chapters": [
            "फणीश्वरनाथ 'रेणु' - इस जल प्रलय में",
            "मृदुला गर्ग - मेरे संग की औरतें",
            "जगदीश चंद्र माथुर - रीढ़ की हड्डी"
          ]
        }
      ]
    },
    "Social Science": {
      "books": [
        {
          "name": "India and the Contemporary World - I",
          "part": "History",
          "chapters": [
            "The French Revolution",
            "Socialism in Europe and the Russian Revolution",
            "Nazism and the Rise of Hitler",
            "Forest Society and Colonialism",
            "Pastoralists in the Modern World"
          ]
        },
        {
          "name": "Contemporary India - I",
          "part": "Geography",
          "chapters": [
            "India – Size and Location",
            "Physical Features of India",
            "Drainage",
            "Climate",
            "Natural Vegetation and Wildlife",
            "Population"
          ]
        },
        {
          "name": "Democratic Politics - I",
          "part": "Political Science",
          "chapters": [
            "What is Democracy? Why Democracy?",
            "Constitutional Design",
            "Electoral Politics",
            "Working of Institutions",
            "Democratic Rights"
          ]
        },
        {
          "name": "Economics",
          "part": "Economics",
          "chapters": [
            "The Story of Village Palampur",
            "People as Resource",
            "Poverty as a Challenge",
            "Food Security in India"
          ]
        },
        {
          "name": "Understanding Society: India and Beyond",
          "part": "NCF 2026-27 Integrated Social Science",
          "chapters": [
            "Understanding Social Science",
            "Shaping of the Earth's Surface",
            "Atmosphere and Climate",
            "Early Humans and Beginning of Civilisation",
            "State and Society (up to 1000 CE)",
            "Democracy",
            "Elections",
            "Building Blocks in Economics",
            "The Price Puzzle: What Drives the Market",
            "Oceans and Life",
            "Life on Earth",
            "Resistance and Resilience (1000 CE–1700 CE)",
            "India and the World-I (1900 BCE–1200 CE)",
            "Authority",
            "Entrepreneurship and Financial Literacy",
            "Personal Finance and Start-up Ecosystems"
          ]
        }
      ]
    },
    "Sanskrit": {
      "books": [
        {
          "name": "Shemushi Part 1",
          "part": "NCERT Standard",
          "chapters": [
            "भारतीवसन्तगीतिः",
            "स्वर्णकाकः",
            "गोदोहनम्",
            "सूक्तिमौक्तिकम्",
            "भ्रान्तो बालः",
            "सिकतासेतुः",
            "जटायोः शौर्यम्",
            "पर्यावरणम्",
            "वाङ्मनःप्राणस्वरूपम्"
          ]
        },
        {
          "name": "Sharda",
          "part": "NCF 2026-27 Reform",
          "chapters": [
            "सत्यं शिवं सुन्दरं संस्कृतम्",
            "सुखस्य मूलं धर्मः धर्मस्य मूलम् अर्थः",
            "आत्मवत्सर्वभूतेषु यः पश्यति सः पण्डितः",
            "न खलु वयस्तेजसो हेतुः",
            "एषा सा कृतकबुद्धिः मानवबुद्धेः सहकरी",
            "मनःपूतं समाचरेत्",
            "उपायं चिन्तयेत् प्राज्ञस्तथापायं च चिन्तयेत्",
            "अन्नाद् आनन्दं प्रति",
            "कृतं प्रतिकृतं भूयादेष धर्मः सनातनः",
            "णमो अरिहन्ताणम्",
            "वर्णोच्चारण - शिक्षा २"
          ]
        }
      ]
    },
    "Telugu (Andhra Pradesh)": {
      "books": [
        {
          "name": "Telugu Parimalam",
          "part": "First Language",
          "chapters": [
            "Dharmabodha",
            "Chaitanyam",
            "Harivillu",
            "Aatmakatha",
            "Sneham",
            "Teerpu",
            "Maatamahima",
            "Illalakagane",
            "Ashavadi"
          ]
        },
        {
          "name": "Telugu Parimalam Upavachakam",
          "part": "Supplementary Reader",
          "chapters": [
            "Nyapathi Subbarao",
            "Kasinaathuni Nageshwar Rao",
            "Ponaka Kanakamma"
          ]
        },
        {
          "name": "Telugu Sudha-1",
          "part": "Second Language",
          "chapters": [
            "Desamante...",
            "Lakumuki Pitta",
            "Uduta Saayam",
            "Prakruti",
            "Metlu",
            "Jaabilli, Asadrushudu",
            "Mutyala Moote",
            "Pattana Samasyalu",
            "Telugu Nela - Telugu Velugulu",
            "Nenu... Chindulu Ellammanu",
            "Gaalib Geethalu",
            "Iddaru Mitrulu",
            "Koti-Mosali Katha",
            "Sheethakaalam"
          ]
        }
      ]
    },
    "Telugu (Telangana)": {
      "books": [
        {
          "name": "Singidi 1",
          "part": "Prose & Poetry",
          "chapters": [
            "ధర్మార్జునులు",
            "నేనెరిగిన బూర్గుల",
            "వలసకూలీ",
            "రంగస్థలం",
            "శతక మధురిమ",
            "ప్రేరణ",
            "తీర్పు",
            "ఆటా పాట",
            "హరివిల్లు",
            "చెలిమి"
          ]
        },
        {
          "name": "Singidi 1",
          "part": "Supplementary",
          "chapters": [
            "కోమటి శెట్టి గారి విచారము",
            "బొమ్మైయి",
            "చిరునవ్వు",
            "వీరభద్రం"
          ]
        }
      ]
    }
  },
  "Class 10": {
    "Mathematics (Basic)": {
      "book": "Mathematics",
      "chapters": [
        "Real Numbers",
        "Polynomials",
        "Pair of Linear Equations in Two Variables",
        "Quadratic Equations",
        "Arithmetic Progressions",
        "Coordinate Geometry",
        "Triangles",
        "Circles",
        "Introduction to Trigonometry",
        "Trigonometric Identities",
        "Some Applications of Trigonometry",
        "Areas Related to Circles",
        "Surface Areas and Volumes",
        "Statistics",
        "Probability"
      ]
    },
    "Mathematics (Standard)": {
      "book": "Mathematics",
      "chapters": [
        "Real Numbers",
        "Polynomials",
        "Pair of Linear Equations in Two Variables",
        "Quadratic Equations",
        "Arithmetic Progressions",
        "Coordinate Geometry",
        "Triangles",
        "Circles",
        "Introduction to Trigonometry",
        "Trigonometric Identities",
        "Some Applications of Trigonometry",
        "Areas Related to Circles",
        "Surface Areas and Volumes",
        "Statistics",
        "Probability"
      ]
    },
    "Mathematics": {
      "book": "Mathematics",
      "chapters": [
        "Real Numbers",
        "Polynomials",
        "Pair of Linear Equations in Two Variables",
        "Quadratic Equations",
        "Arithmetic Progressions",
        "Coordinate Geometry",
        "Triangles",
        "Circles",
        "Introduction to Trigonometry",
        "Trigonometric Identities",
        "Some Applications of Trigonometry",
        "Areas Related to Circles",
        "Surface Areas and Volumes",
        "Statistics",
        "Probability"
      ]
    },
    "Science": {
      "book": "Science",
      "chapters": [
        "Chemical Reactions and Equations",
        "Acids, Bases and Salts",
        "Metals and Non-Metals",
        "Carbon and Its Compounds",
        "Life Processes",
        "Control and Coordination",
        "How Do Organisms Reproduce?",
        "Heredity",
        "Light – Reflection and Refraction",
        "The Human Eye and the Colourful World",
        "Electricity",
        "Magnetic Effects of Electric Current",
        "Our Environment"
      ]
    },
    "English Language & Literature": {
      "books": [
        {
          "name": "First Flight",
          "part": "Prose",
          "chapters": [
            "A Letter to God",
            "Nelson Mandela: Long Walk to Freedom",
            "Two Stories About Flying",
            "From the Diary of Anne Frank",
            "Glimpses of India",
            "Mijbil the Otter",
            "Madam Rides the Bus",
            "The Sermon at Benares",
            "The Proposal"
          ]
        },
        {
          "name": "First Flight",
          "part": "Poetry",
          "chapters": [
            "Dust of Snow",
            "Fire and Ice",
            "A Tiger in the Zoo",
            "How to Tell Wild Animals",
            "The Ball Poem",
            "Amanda!",
            "The Trees",
            "Fog",
            "The Tale of Custard the Dragon",
            "For Anne Gregory"
          ]
        },
        {
          "name": "Footprints Without Feet",
          "part": "Supplementary Reader",
          "chapters": [
            "A Triumph of Surgery",
            "The Thief's Story",
            "The Midnight Visitor",
            "A Question of Trust",
            "Footprints Without Feet",
            "The Making of a Scientist",
            "The Necklace",
            "Bholi",
            "The Book That Saved the Earth"
          ]
        }
      ]
    },
    "English": {
      "books": [
        {
          "name": "First Flight",
          "part": "Prose",
          "chapters": [
            "A Letter to God",
            "Nelson Mandela: Long Walk to Freedom",
            "Two Stories About Flying",
            "From the Diary of Anne Frank",
            "Glimpses of India",
            "Mijbil the Otter",
            "Madam Rides the Bus",
            "The Sermon at Benares",
            "The Proposal"
          ]
        },
        {
          "name": "First Flight",
          "part": "Poetry",
          "chapters": [
            "Dust of Snow",
            "Fire and Ice",
            "A Tiger in the Zoo",
            "How to Tell Wild Animals",
            "The Ball Poem",
            "Amanda!",
            "The Trees",
            "Fog",
            "The Tale of Custard the Dragon",
            "For Anne Gregory"
          ]
        },
        {
          "name": "Footprints Without Feet",
          "part": "Supplementary Reader",
          "chapters": [
            "A Triumph of Surgery",
            "The Thief's Story",
            "The Midnight Visitor",
            "A Question of Trust",
            "Footprints Without Feet",
            "The Making of a Scientist",
            "The Necklace",
            "Bholi",
            "The Book That Saved the Earth"
          ]
        }
      ]
    },
    "Hindi Course A": {
      "books": [
        {
          "name": "Kshitij Part 2",
          "part": "Poetry (काव्य खंड)",
          "chapters": [
            "सूरदास - पद",
            "तुलसीदास - राम-लक्ष्मण-परशुराम संवाद",
            "जयशंकर प्रसाद - आत्मकथ्य",
            "सूर्यकांत त्रिपाठी 'निराला' - उत्साह, अट नहीं रही है",
            "नागार्जुन - यह दंतुरित मुसकान, फसल",
            "मंगलेश डबराल - संगतकार"
          ]
        },
        {
          "name": "Kshitij Part 2",
          "part": "Prose (गद्य खंड)",
          "chapters": [
            "स्वयं प्रकाश - नेताजी का चश्मा",
            "रामवृक्ष बेनीपुरी - बालगोबिन भगत",
            "यशपाल - लखनवी अंदाज़",
            "मन्नू भंडारी - एक कहानी यह भी",
            "यतींद्र मिश्र - नौबतखाने में इबादत",
            "भदंत आनंद कौसल्यायन - संस्कृति"
          ]
        },
        {
          "name": "Kritika Part 2",
          "part": "Supplementary Reader (पूरक पाठ्यपुस्तक)",
          "chapters": [
            "शिवपूजन सहाय - माता का अंचल",
            "मधु कांकरिया - साना-साना हाथ जोड़ि...",
            "अज्ञेय - मैं क्यों लिखता हूँ?"
          ]
        }
      ]
    },
    "Hindi Course B": {
      "books": [
        {
          "name": "Sparsh Part 2",
          "part": "Poetry (काव्य खंड)",
          "chapters": [
            "कबीर - साखी",
            "मीरा - पद",
            "मैथिलीशरण गुप्त - मनुष्यता",
            "सुमित्रानंदन पंत - पर्वत प्रदेश में पावस",
            "वीरेन डंगवाल - तोप",
            "कैफ़ी आज़मी - कर चले हम फ़िदा",
            "रवीन्द्रनाथ ठाकुर - आत्मत्राण"
          ]
        },
        {
          "name": "Sparsh Part 2",
          "part": "Prose (गद्य खंड)",
          "chapters": [
            "प्रेमचंद - बड़े भाई साहब",
            "लीलाधर मंडलोई - ततँरा-वामीरो कथा",
            "निदा फ़ाज़ली - अब कहाँ दूसरे के दुख से दुखी होने वाले",
            "रवीन्द्र केलेकर - पतझड़ में टूटी पत्तियाँ (गिन्नौर का सोना)",
            "हबीब तनवीर - कारतूस"
          ]
        },
        {
          "name": "Sanchayan Part 2",
          "part": "Supplementary Reader (पूरक पाठ्यपुस्तक)",
          "chapters": [
            "मिथिलेश्वर - हरिहर काका",
            "गुरदयाल सिंह - सपनों के-से दिन",
            "राही मासूम रज़ा - टोपी शुक्ला"
          ]
        }
      ]
    },
    "Hindi": {
      "books": [
        {
          "name": "Kshitij Part 2",
          "part": "Poetry (काव्य खंड)",
          "chapters": [
            "सूरदास - पद",
            "तुलसीदास - राम-लक्ष्मण-परशुराम संवाद",
            "जयशंकर प्रसाद - आत्मकथ्य",
            "सूर्यकांत त्रिपाठी 'निराला' - उत्साह, अट नहीं रही है",
            "नागार्जुन - यह दंतुरित मुसकान, फसल",
            "मंगलेश डबराल - संगतकार"
          ]
        },
        {
          "name": "Kshitij Part 2",
          "part": "Prose (गद्य खंड)",
          "chapters": [
            "स्वयं प्रकाश - नेताजी का चश्मा",
            "रामवृक्ष बेनीपुरी - बालगोबिन भगत",
            "यशपाल - लखनवी अंदाज़",
            "मन्नू भंडारी - एक कहानी यह भी",
            "यतींद्र मिश्र - नौबतखाने में इबादत",
            "भदंत आनंद कौसल्यायन - संस्कृति"
          ]
        },
        {
          "name": "Kritika Part 2",
          "part": "Supplementary Reader (पूरक पाठ्यपुस्तक)",
          "chapters": [
            "शिवपूजन सहाय - माता का अंचल",
            "मधु कांकरिया - साना-साना हाथ जोड़ि...",
            "अज्ञेय - मैं क्यों लिखता हूँ?"
          ]
        }
      ]
    },
    "Social Science": {
      "books": [
        {
          "name": "India and the Contemporary World - II",
          "part": "History",
          "chapters": [
            "The Rise of Nationalism in Europe",
            "Nationalism in India",
            "The Making of a Global World",
            "The Age of Industrialisation",
            "Print Culture and the Modern World"
          ]
        },
        {
          "name": "Contemporary India - II",
          "part": "Geography",
          "chapters": [
            "Resources and Development",
            "Forest and Wildlife Resources",
            "Water Resources",
            "Agriculture",
            "Minerals and Energy Resources",
            "Manufacturing Industries",
            "Lifelines of National Economy"
          ]
        },
        {
          "name": "Democratic Politics - II",
          "part": "Political Science",
          "chapters": [
            "Power Sharing",
            "Federalism",
            "Gender, Religion and Caste",
            "Political Parties",
            "Outcomes of Democracy"
          ]
        },
        {
          "name": "Understanding Economic Development",
          "part": "Economics",
          "chapters": [
            "Development",
            "Sectors of the Indian Economy",
            "Money and Credit",
            "Globalisation and the Indian Economy",
            "Consumer Rights"
          ]
        }
      ]
    },
    "Sanskrit": {
      "books": [
        {
          "name": "Shemushi Part 2",
          "part": "NCERT Standard",
          "chapters": [
            "शुचिपर्यावरणम् (Shuchiparyavaranam)",
            "बुद्धिर्बलवती सदा (Buddhibalavatee Sada)",
            "शिशुलालनम् (Shishulaalanam)",
            "जननी तुल्यवत्सला (Jananee Tulya Vatsalaa)",
            "सुभाषितानि (Subhaashitaani)",
            "सौहार्दं प्रकृतेः शोभा (Sauhaardam Praakriteh Shobhaa)",
            "विचित्रः साक्षी (Vichitrah Saakshee)",
            "सूक्तयः (Sooktah)",
            "भूकम्पविभीषिका (Bhookampavibheeshikaa)",
            "अन्योक्तयः (Anyoktah)"
          ]
        },
        {
          "name": "Manika Part 2",
          "part": "CBSE Sanskrit Communicative",
          "chapters": [
            "वाङ्‌मयंतपः",
            "नास्ति त्यागसमं सुखम्",
            "रमणीया हि सृष्टिरेषा",
            "आज्ञा गुरुणां ह्यविचारणीया",
            "अभ्यासवशगं मनः",
            "साधुवृत्तिं समाचरेत्",
            "रम्यं उद्यानम्",
            "तिरुक्कुरल्-सूक्ति-सौरभम्"
          ]
        }
      ]
    },
    "Telugu (Andhra Pradesh)": {
      "books": [
        {
          "name": "Telugu Parimalam",
          "part": "Detailed Lessons (పాఠ్యాంశాలు)",
          "chapters": [
            "1. ప్రత్యక్ష దైవాలు (ఇతిహాసం - ఎఱ్ఱన)",
            "2. బతుకు గంప (కథానిక - మూలింటి చంద్రకళ)",
            "3. శతక మాధుర్యం (శతకం - వివిధ శతక కవులు)",
            "4. ఉపన్యాస కళ (వ్యాసం - వాసిరెడ్డి సీతాదేవి)",
            "5. జలియన్ వాలా బాగ్ (ఖండకావ్యం - ఉమర్ అలీషా)",
            "6. ప్రకృతి సందేశం (గేయం - వై.సి.వి.రెడ్డి)",
            "7. చేజారిన బాల్యం (వ్యాసం - శీలా వీర్రాజు)",
            "8. జీవని (కథ - వి. చంద్రశేఖరరావు)",
            "9. రాజధర్మం (ప్రబంధం - శ్రీకృష్ణ దేవరాయలు)",
            "10. కన్యాశుల్కం (నాటకం - గురజాడ అప్పారావు)",
            "11. యుద్ధ విజేత (వచన కవిత - నేతల ప్రతాప్ కుమార్)",
            "12. సూక్తి సుధ (సాహిత్య వ్యాసం - ఎస్. గంగప్ప)"
          ]
        },
        {
          "name": "Telugu Parimalam",
          "part": "Non-Detailed Lessons (ఉపవాచకం - రామాయణం)",
          "chapters": [
            "1. బాలకాండ (శ్రీరామ జననం, యాగ రక్షణ, సీతా కల్యాణం)",
            "2. అయోధ్యకాండ (పట్టాభిషేక ప్రయత్నం, వనవాస గమనం)",
            "3. అరణ్యకాండ (దండకారణ్య ప్రవేశం, శూర్పణఖ, సీతాపహరణం)",
            "4. కిష్కింధకాండ (సుగ్రీవ మైత్రి, వాలి వధ, సీతాన్వేషణ)",
            "5. సుందరకాండ (సముద్ర లంఘనం, సీతా దర్శనం, లంకా దహనం)",
            "6. యుద్ధకాండ (సేతు నిర్మాణం, రావణ సంహారం, పట్టాభిషేకం)"
          ]
        },
        {
          "name": "Telugu Parimalam",
          "part": "Grammar & Composition (భాషాంశాలు & వ్యాకరణం)",
          "chapters": [
            "1. సంధులు (సవర్ణదీర్ఘ, గుణ, వృద్ధి, యణాదేశ, ఉత్వ, ఇత్వ, అత్వ, సరళాదేశ, గసడదవాదేశ, రుగాగమ, త్రిక)",
            "2. సమాసాలు (ద్వంద్వ, ద్విగు, తత్పురుష, కర్మధారయ, బహువ్రీహి, రూపక)",
            "3. ఛందస్సు (ఉత్పలమాల, చంపకమాల, శార్దూలం, మత్తేభం, కందం, తేటగీతి, ఆటవెలది, ద్విపద)",
            "4. అలంకారాలు (వృత్యానుప్రాస, ఛేకానుప్రాస, అంత్యానుప్రాస, లాటానుప్రాస, ఉపమ, రూపక, ఉత్ప్రేక్ష, అతిశయోక్తి)",
            "5. పదజాలం (పర్యాయపదాలు, నానార్థాలు, ప్రకృతి-వికృతులు, వ్యుత్పత్యర్థాలు, జాతీయాలు, సామెతలు)",
            "6. సృజనాత్మక రచన & లేఖారచన (లేఖలు, కరపత్రాలు, ప్రకటనలు, వ్యాసాలు, సంభాషణలు, నినాదాలు)",
            "7. అపరిచిత గద్యం & పద్యం (అవగాహన - ప్రతిస్పందన)"
          ]
        }
      ]
    },
    "Telugu (Telangana)": {
      "books": [
        {
          "name": "Singidi 2",
          "part": "Poetry (పద్య భాగం)",
          "chapters": [
            "దానశీలము (Daana Sheelam)",
            "వీర తెలంగాణ (Veera Telangana)",
            "నగర గీతం (Nagara Geetham)",
            "శతక మధురిమ (Shathaka Madhurima)",
            "జీవన భాష్యం (Jeevana Bhashyam)",
            "భిక్ష (Bhiksha)"
          ]
        },
        {
          "name": "Singidi 2",
          "part": "Prose (గద్య భాగం)",
          "chapters": [
            "ఎవరి భాష వారికి వినసొంపు (Evari Bhasha Variki Vinasompu)",
            "కొత్తబాట (Kothabata)",
            "లక్ష్యసిద్ధి (Lakshya Siddhi)",
            "గోల్కొండ పట్టణం (Golkonda Pattanam)"
          ]
        },
        {
          "name": "Singidi 2",
          "part": "Non-Detail (మన ఇతిహాసం - రామాయణం)",
          "chapters": [
            "బాలకాండ (Balakanda)",
            "అయోధ్యకాండ (Ayodhyakanda)",
            "అరణ్యకాండ (Aranyakanda)",
            "కిష్కింధకాండ (Kishkindhakanda)",
            "సుందరకాండ (Sundarakanda)",
            "యుద్ధకాండ (Yuddhakanda)"
          ]
        }
      ]
    }
  }
};

if (NEW_NCERT_SYLLABUS["Class 10"] && NEW_NCERT_SYLLABUS["Class 10"]["Telugu (Andhra Pradesh)"]) {
  NEW_NCERT_SYLLABUS["Class 10"]["Telugu"] = NEW_NCERT_SYLLABUS["Class 10"]["Telugu (Andhra Pradesh)"];
}

// Create Old NCERT Syllabus as a clone of New NCERT Syllabus
const OLD_NCERT_SYLLABUS: Record<string, Record<string, any>> = JSON.parse(JSON.stringify(NEW_NCERT_SYLLABUS));

// Adjust Old NCERT Syllabus specific additions
if (OLD_NCERT_SYLLABUS["Class 10"]) {
  if (OLD_NCERT_SYLLABUS["Class 10"]["Mathematics"]) {
    const chapters = OLD_NCERT_SYLLABUS["Class 10"]["Mathematics"].chapters;
    if (Array.isArray(chapters) && !chapters.includes("Constructions")) {
      // Insert "Constructions" at Chapter 11
      chapters.splice(10, 0, "Constructions");
    }
  }
  if (OLD_NCERT_SYLLABUS["Class 10"]["Science"]) {
    const chapters = OLD_NCERT_SYLLABUS["Class 10"]["Science"].chapters;
    if (Array.isArray(chapters)) {
      if (!chapters.includes("Periodic Classification of Elements")) {
        chapters.splice(4, 0, "Periodic Classification of Elements");
      }
      if (!chapters.includes("Sources of Energy")) {
        chapters.push("Sources of Energy");
      }
      if (!chapters.includes("Sustainable Management of Natural Resources")) {
        chapters.push("Sustainable Management of Natural Resources");
      }
    }
  }
}

if (OLD_NCERT_SYLLABUS["Class 9"]) {
  if (OLD_NCERT_SYLLABUS["Class 9"]["Mathematics"]) {
    const chapters = OLD_NCERT_SYLLABUS["Class 9"]["Mathematics"].chapters;
    if (Array.isArray(chapters)) {
      if (!chapters.includes("Introduction to Euclid's Geometry")) {
        chapters.splice(4, 0, "Introduction to Euclid's Geometry");
      }
      if (!chapters.includes("Constructions")) {
        chapters.splice(10, 0, "Constructions");
      }
    }
  }
  if (OLD_NCERT_SYLLABUS["Class 9"]["Science"]) {
    const chapters = OLD_NCERT_SYLLABUS["Class 9"]["Science"].chapters;
    if (Array.isArray(chapters)) {
      if (!chapters.includes("Diversity in Living Organisms")) {
        chapters.splice(3, 0, "Diversity in Living Organisms");
      }
      if (!chapters.includes("Why Do We Fall Ill")) {
        chapters.push("Why Do We Fall Ill");
      }
      if (!chapters.includes("Natural Resources")) {
        chapters.push("Natural Resources");
      }
    }
  }
}

export const SYLLABUS_DATA: Record<string, any> = {
  "CBSE / NCERT (New)": { ...NEW_NCERT_SYLLABUS },
  "CBSE / NCERT (Old)": { ...OLD_NCERT_SYLLABUS },
  "AP SCERT": { ...NEW_NCERT_SYLLABUS },
  "Telangana SCERT": { ...NEW_NCERT_SYLLABUS }
};

export const CURRICULUM_DATA = SYLLABUS_DATA;

