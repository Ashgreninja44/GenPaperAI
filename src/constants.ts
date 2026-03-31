
export const BOARDS = [
  "CBSE / NCERT",
  "AP SCERT"
];

export const GRADES = [
  "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
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
        "section": "A",
        "title": "Reading Section (అపరిచిత గద్యం)",
        "num_questions": 1,
        "question_types": "Passage comprehension",
        "marks_each": 10,
        "total_marks": 10,
        "internal_choice": "Internal choice (attempt one of two)"
      },
      {
        "section": "B",
        "title": "Writing Section",
        "num_questions": 2,
        "question_types": "Letter, application, etc.",
        "marks_each": [5, 5],
        "total_marks": 13,
        "internal_choice": "Internal choice in each question"
      },
      {
        "section": "C",
        "title": "Grammar Section",
        "num_questions": 7,
        "question_types": "Poetry & prose-based MCQs/short answers",
        "marks_each": 20/7,
        "total_marks": 20,
        "internal_choice": "Internal choice in many questions"
      },
      {
        "section": "D",
        "title": "Literature Textbook Section",
        "num_questions": 7,
        "question_types": "Prose/poetry interpretation and paragraph writing",
        "marks_each": [4, 4, 4, 4, 4, 4, 13],
        "total_marks": 37,
        "internal_choice": "Internal choice in each question"
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
  }
};


// ------------------------------------------------------------------
// SYLLABUS DEFINITIONS (2024-25)
// ------------------------------------------------------------------

// CBSE Hindi Chapters (Corrected to Devanagari Script)
const CBSE_HINDI_A_10 = [
  "सूरदास के पद", 
  "राम-लक्ष्मण-परशुराम संवाद", 
  "सवैया / कवित्त (देव)", 
  "आत्मकथ्य (जयशंकर प्रसाद)", 
  "उत्साह / अट नहीं रही है (निराला)", 
  "यह दंतुरित मुस्कान / फसल (नागार्जुन)", 
  "संगतकार (मंगलेश डबराल)", 
  "नेताजी का चश्मा", 
  "बालगोबिन भगत", 
  "लखनवी अंदाज़", 
  "मानवीय करुणा की दिव्य चमक", 
  "एक कहानी यह भी", 
  "स्त्री शिक्षा के विरोधी कुतर्कों का खंडन", 
  "नौबतखाने में इबादत", 
  "संस्कृति", 
  "माता का अंचल", 
  "साना-साना हाथ जोड़ि", 
  "मैं क्यों लिखता हूँ?"
];

const CBSE_HINDI_B_10 = [
  "साखी (कबीर)", 
  "पद (मीरा)", 
  "बड़े भाई साहब", 
  "डायरी का एक पन्ना", 
  "ततांरा-वामीरो कथा", 
  "तीसरी कसम के शिल्पकार शैलेंद्र", 
  "अब कहाँ दूसरे के दुख से दुखी होने वाले", 
  "पतझड़ में टूटी पत्तियाँ", 
  "कारतूस", 
  "मनुष्यता", 
  "पर्वत प्रदेश में पावस", 
  "तोप", 
  "कर चले हम फ़िदा", 
  "आत्मत्राण", 
  "हरिहर काका", 
  "सपनों के-से दिन", 
  "टोपी शुक्ला"
];

// Common Math Chapters (Used for both Basic and Standard)
const CBSE_MATH_10 = ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry", "Circles", "Constructions", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"];

// Common English Chapters
const CBSE_ENGLISH_10 = ["A Letter to God", "Dust of Snow", "Fire and Ice", "Nelson Mandela: Long Walk to Freedom", "A Tiger in the Zoo", "Two Stories about Flying", "How to Tell Wild Animals", "The Ball Poem", "From the Diary of Anne Frank", "Amanda!", "The Hundred Dresses - I", "The Hundred Dresses - II", "Animals", "Glimpses of India", "The Trees", "Mijbil the Otter", "Fog", "Madam Rides the Bus", "The Tale of Custard the Dragon", "The Sermon at Benares", "For Anne Gregory", "The Proposal"];


// Structure: Board -> Grade -> Subject -> Topics[]
// This holds the CURRENT Syllabus (2024-25)
// STRICTLY FILTERED: Core Academic Subjects Only (Math, Science, Social Science, EVS)
export const CURRICULUM_DATA: Record<string, Record<string, Record<string, string[]>>> = {
  "CBSE / NCERT": {
    "Class 3": {
      "Mathematics": ["Where to Look From", "Fun with Numbers", "Give and Take", "Long and Short", "Shapes and Designs", "Fun with Give and Take", "Time Goes On", "Who is Heavier?", "How Many Times?", "Play with Patterns", "Jugs and Mugs", "Can We Share?", "Smart Charts", "Rupees and Paise"],
      "EVS": ["Poonam's Day out", "The Plant Fairy", "Water O' Water!", "Our First School", "Chhotu's House", "Foods We Eat", "Saying without Speaking", "Flying High", "It's Raining", "What is Cooking", "From Here to There", "Work We Do", "Sharing Our Feelings", "The Story of Food", "Making Pots", "Games We Play", "Here comes a Letter", "A House Like This", "Our Friends-Animals", "Drop by Drop", "Families can be Different", "Left-Right", "A Beautiful Cloth", "Web of Life"]
    },
    "Class 4": {
      "Mathematics": ["Building with Bricks", "Long and Short", "A Trip to Bhopal", "Tick-Tick-Tick", "The Way The World Looks", "The Junk Seller", "Jugs and Mugs", "Carts and Wheels", "Halves and Quarters", "Play with Patterns", "Tables and Shares", "How Heavy? How Light?", "Fields and Fences", "Smart Charts"],
      "EVS": ["Going to School", "Ear to Ear", "A Day with Nandu", "The Story of Amrita", "Anita and the Honeybees", "Omana's Journey", "From the Window", "Reaching Grandmother's House", "Changing Families", "Hu Tu Tu, Hu Tu Tu", "The Valley of Flowers", "Changing Times", "A River's Tale", "Basva's Farm", "From Market to Home", "A Busy Month", "Nandita in Mumbai", "Too Much Water, Too Little Water", "Abdul in the Garden", "Eating Together", "Food and Fun", "The World in my Home", "Pochampalli", "Home and Abroad", "Spicy Riddles", "Defence Officer: Wahida", "Chuskit Goes to School"]
    },
    "Class 5": {
      "Mathematics": ["The Fish Tale", "Shapes and Angles", "How Many Squares?", "Parts and Wholes", "Does it Look the Same?", "Be My Multiple, I'll be Your Factor", "Can You See the Pattern?", "Mapping Your Way", "Boxes and Sketches", "Tenths and Hundredths", "Area and its Boundary", "Smart Charts", "Ways to Multiply and Divide", "How Big? How Heavy?"],
      "EVS": ["Super Senses", "A Snake Charmer’s Story", "From Tasting to Digesting", "Mangoes Round the Year", "Seeds and Seeds", "Every Drop Counts", "Experiments with Water", "A Treat for Mosquitoes", "Up You Go!", "Walls Tell Stories", "Sunita in Space", "What if it Finishes...?", "A Shelter so High!", "When the Earth Shook!", "Blow Hot, Blow Cold", "Who will do this Work?", "Across the Wall", "No Place for Us?", "A Seed tells a Farmer’s Story", "Whose Forests?", "Like Father, Like Daughter", "On the Move Again"]
    },
    "Class 6": {
      "Mathematics": ["Knowing Our Numbers", "Whole Numbers", "Playing with Numbers", "Basic Geometrical Ideas", "Understanding Elementary Shapes", "Integers", "Fractions", "Decimals", "Data Handling", "Mensuration", "Algebra", "Ratio and Proportion", "Symmetry", "Practical Geometry"],
      "Science": ["Food: Where Does It Come From?", "Components of Food", "Fibre to Fabric", "Sorting Materials into Groups", "Separation of Substances", "Changes Around Us", "Getting to Know Plants", "Body Movements", "The Living Organisms and Their Surroundings", "Motion and Measurement of Distances", "Light, Shadows and Reflections", "Electricity and Circuits", "Fun with Magnets", "Water", "Air Around Us", "Garbage In, Garbage Out"],
      "Social Science": ["What, Where, How and When?", "From Hunting–Gathering to Growing Food", "In the Earliest Cities", "What Books and Burials Tell Us", "Kingdoms, Kings and an Early Republic", "New Questions and Ideas", "Ashoka, The Emperor Who Gave Up War", "Vital Villages, Thriving Towns", "Traders, Kings and Pilgrims", "New Empires and Kingdoms", "Buildings, Paintings and Books", "The Earth in the Solar System", "Globe: Latitudes and Longitudes", "Motions of the Earth", "Maps", "Major Domains of the Earth", "Major Landforms of the Earth", "Our Country – India", "India: Climate, Vegetation and Wildlife", "Understanding Diversity", "Diversity and Discrimination", "What is Government?", "Key Elements of a Democratic Government", "Panchayati Raj", "Rural Administration", "Urban Administration", "Rural Livelihoods", "Urban Livelihoods"]
    },
    "Class 7": {
      "Mathematics": ["Integers", "Fractions and Decimals", "Data Handling", "Simple Equations", "Lines and Angles", "The Triangle and its Properties", "Congruence of Triangles", "Comparing Quantities", "Rational Numbers", "Practical Geometry", "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers", "Symmetry", "Visualising Solid Shapes"],
      "Science": ["Nutrition in Plants", "Nutrition in Animals", "Fibre to Fabric", "Heat", "Acids, Bases and Salts", "Physical and Chemical Changes", "Weather, Climate and Adaptations of Animals to Climate", "Winds, Storms and Cyclones", "Soil", "Respiration in Organisms", "Transportation in Animals and Plants", "Reproduction in Plants", "Motion and Time", "Electric Current and its Effects", "Light", "Water: A Precious Resource", "Forests: Our Lifeline", "Wastewater Story"],
      "Social Science": ["Tracing Changes Through a Thousand Years", "New Kings and Kingdoms", "The Delhi Sultans", "The Mughal Empire", "Rulers and Buildings", "Towns, Traders and Craftspersons", "Tribes, Nomads and Settled Communities", "Devotional Paths to the Divine", "The Making of Regional Cultures", "Eighteenth-Century Political Formations", "Environment", "Inside Our Earth", "Our Changing Earth", "Air", "Water", "Natural Vegetation and Wildlife", "Human Environment – Settlement, Transport and Communication", "Human Environment Interactions", "Life in the Deserts", "On Equality", "Role of the Government in Health", "How the State Government Works", "Growing up as Boys and Girls", "Women Change the World", "Understanding Media", "Markets Around Us", "A Shirt in the Market", "Struggles for Equality"]
    },
    "Class 8": {
      "Mathematics": ["Rational Numbers", "Linear Equations in One Variable", "Understanding Quadrilaterals", "Practical Geometry", "Data Handling", "Squares and Square Roots", "Cubes and Cube Roots", "Comparing Quantities", "Algebraic Expressions and Identities", "Visualising Solid Shapes", "Mensuration", "Exponents and Powers", "Direct and Inverse Proportions", "Factorisation", "Introduction to Graphs", "Playing with Numbers"],
      "Science": ["Crop Production and Management", "Microorganisms: Friend and Foe", "Synthetic Fibres and Plastics", "Materials: Metals and Non-Metals", "Coal and Petroleum", "Combustion and Flame", "Conservation of Plants and Animals", "Cell - Structure and Functions", "Reproduction in Animals", "Reaching the Age of Adolescence", "Force and Pressure", "Friction", "Sound", "Chemical Effects of Electric Current", "Some Natural Phenomena", "Light", "Stars and The Solar System", "Pollution of Air and Water"],
      "Social Science": ["How, When and Where", "From Trade to Territory", "Ruling the Countryside", "Tribals, Dikus and the Vision of a Golden Age", "When People Rebel", "Colonialism and the City", "Weavers, Iron Smelters and Factory Owners", "Civilising the “Native”, Educating the Nation", "Women, Caste and Reform", "The Changing World of Visual Arts", "The Making of the National Movement", "India After Independence", "Resources", "Land, Soil, Water, Natural Vegetation and Wildlife Resources", "Mineral and Power Resources", "Agriculture", "Industries", "Human Resources", "The Indian Constitution", "Understanding Secularism", "Why Do We Need a Parliament?", "Understanding Laws", "Judiciary", "Understanding Our Criminal Justice System", "Understanding Marginalisation", "Confronting Marginalisation", "Public Facilities", "Law and Social Justice"]
    },
    "Class 9": {
      "Mathematics": ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Areas of Parallelograms and Triangles", "Circles", "Constructions", "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"],
      "Science": ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom", "The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Why Do We Fall Ill", "Natural Resources", "Improvement in Food Resources"],
      "Social Science": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World", "India - Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population", "What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "Democratic Rights", "The Story of Village Palampur", "People as Resource", "Poverty as a Challenge", "Food Security in India"]
    },
    "Class 10": {
      "Mathematics (Standard)": CBSE_MATH_10,
      "Mathematics (Basic)": CBSE_MATH_10,
      "Science": ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements", "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Light – Reflection and Refraction", "The Human Eye and the Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy", "Our Environment", "Sustainable Management of Natural Resources"],
      "Social Science": ["The Rise of Nationalism in Europe", "Nationalism in India", "The Making of a Global World", "The Age of Industrialisation", "Print Culture and the Modern World", "Resources and Development", "Forest and Wildlife Resources", "Water Resources", "Agriculture", "Minerals and Energy Resources", "Manufacturing Industries", "Lifelines of National Economy", "Power Sharing", "Federalism", "Democracy and Diversity", "Gender, Religion and Caste", "Popular Struggles and Movements", "Political Parties", "Outcomes of Democracy", "Challenges to Democracy", "Development", "Sectors of the Indian Economy", "Money and Credit", "Globalisation and the Indian Economy", "Consumer Rights"]
    }
  },
  "AP SCERT": {
    "Class 3": {},
    "Class 4": {},
    "Class 5": {},
    "Class 6": {},
    "Class 7": {},
    "Class 8": {},
    "Class 9": {},
    "Class 10": {}
  }
};
