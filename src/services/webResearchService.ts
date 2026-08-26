import { 
  ResearchMode, 
  ResearchFinding, 
  GroundingSource, 
  Question, 
  SourceCitationInfo, 
  BloomTaxonomyLevel, 
  QuestionOrigin 
} from '../types';
import { generateContentProxy, parseQuestionsFromText } from './geminiService';

/**
 * Classifies the authority level of a domain/URL for educational grounding.
 */
export function classifySourceAuthority(
  url: string, 
  title: string = ''
): GroundingSource['authority'] {
  const lowerUrl = (url || '').toLowerCase();
  const lowerTitle = (title || '').toLowerCase();

  if (lowerUrl.includes('ncert.nic.in') || lowerUrl.includes('epathshala.nic.in') || lowerTitle.includes('ncert')) {
    return 'official_ncert';
  }
  if (lowerUrl.includes('cbse.gov.in') || lowerUrl.includes('cbseacademic.nic.in') || lowerTitle.includes('cbse official')) {
    return 'official_cbse';
  }
  if (lowerUrl.includes('scert') || lowerUrl.includes('samagra.kite.kerala.gov.in') || lowerUrl.includes('scert.telangana.gov.in')) {
    return 'official_scert';
  }
  if (lowerUrl.includes('.gov.in') || lowerUrl.includes('.edu') || lowerUrl.includes('.ac.in') || lowerUrl.includes('.org.in')) {
    return 'government_edu';
  }
  if (
    lowerUrl.includes('learncbse.in') ||
    lowerUrl.includes('toppr.com') ||
    lowerUrl.includes('byjus.com') ||
    lowerUrl.includes('vedantu.com') ||
    lowerUrl.includes('khanacademy.org') ||
    lowerUrl.includes('geeksforgeeks.org') ||
    lowerUrl.includes('selfstudys.com')
  ) {
    return 'academic';
  }
  if (lowerUrl.includes('wikipedia.org') || lowerUrl.includes('britannica.com')) {
    return 'reference';
  }
  return 'general';
}

/**
 * Extracts clean domain name from URL.
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || url;
  }
}

/**
 * Parses grounding metadata from Gemini response candidates.
 */
export function extractGroundingSources(candidates?: any[]): {
  sources: GroundingSource[];
  searchQueries: string[];
} {
  const sources: GroundingSource[] = [];
  const searchQueries: string[] = [];
  const seenUrls = new Set<string>();

  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    return { sources, searchQueries };
  }

  for (const cand of candidates) {
    const groundingMeta = cand.groundingMetadata;
    if (!groundingMeta) continue;

    // Collect search queries
    if (Array.isArray(groundingMeta.webSearchQueries)) {
      for (const q of groundingMeta.webSearchQueries) {
        if (q && typeof q === 'string' && !searchQueries.includes(q)) {
          searchQueries.push(q);
        }
      }
    }

    // Collect grounding chunks (web sources)
    if (Array.isArray(groundingMeta.groundingChunks)) {
      for (const chunk of groundingMeta.groundingChunks) {
        const web = chunk.web;
        if (web && web.uri) {
          const uri = web.uri.trim();
          if (!seenUrls.has(uri)) {
            seenUrls.add(uri);
            const domain = extractDomain(uri);
            const title = web.title || domain;
            sources.push({
              title,
              url: uri,
              domain,
              authority: classifySourceAuthority(uri, title)
            });
          }
        }
      }
    }
  }

  return { sources, searchQueries };
}

/**
 * Safely fetches webpage content via backend server endpoint, falling back if unavailable.
 */
export async function fetchWebpageContent(url: string): Promise<{ text: string; url: string }> {
  try {
    const res = await fetch('/api/web/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (res.ok) {
      const data = await res.json();
      const rawHtml = data.contents;
      if (!rawHtml || typeof rawHtml !== 'string') {
        throw new Error("No readable content returned from webpage.");
      }

      // Clean HTML using DOMParser in browser
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      const junkSelectors = [
        'script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav', 'aside', 
        'form', 'button', 'svg', 'link', 'meta', '.ad', '.ads', '.sidebar', 
        '#sidebar', '#footer', '.footer', '.navbar', '.nav', '.menu', '.social-share',
        '.comments', '.related-posts', '.advertisement', 'ins.adsbygoogle', 
        '[aria-hidden="true"]', '.breadcrumb', '.promo', '.banner'
      ];
      junkSelectors.forEach(s => doc.querySelectorAll(s).forEach(el => el.remove()));

      const semanticSelectors = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'table', 'div[class*="content"]', '.entry-content', 'article'];
      const extractedParts: string[] = [];
      doc.querySelectorAll(semanticSelectors.join(',')).forEach(el => {
        const t = el.textContent?.trim();
        if (t && t.length > 15) {
          extractedParts.push(t);
        }
      });

      const cleanText = extractedParts.join('\n\n');
      if (cleanText.length < 50) {
        throw new Error("Target webpage contains insufficient readable text.");
      }

      return { text: cleanText.substring(0, 20000), url };
    }

    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server web fetch failed with status ${res.status}`);
  } catch (err: any) {
    console.warn(`[Web Research] Direct fetch failed for ${url}:`, err.message);
    throw err;
  }
}

/**
 * Performs Intelligent Web Research based on the requested mode.
 */
export async function performIntelligentWebResearch(params: {
  topic: string;
  mode: ResearchMode;
  subject?: string;
  grade?: string;
  board?: string;
  url?: string;
  chapter?: string;
  targetQuestionCount?: number;
  modelId?: string;
}): Promise<ResearchFinding> {
  const {
    topic,
    mode,
    subject = 'General',
    grade = 'Class 10',
    board = 'CBSE',
    url,
    chapter,
    targetQuestionCount = 5,
    modelId = 'gemini-3-flash-preview'
  } = params;

  const timestamp = Date.now();

  // Mode 4: URL-Based Extraction with Search Fallback
  if (mode === 'url' && url) {
    let pageText = '';
    let directFetchSuccess = false;

    try {
      const fetched = await fetchWebpageContent(url);
      pageText = fetched.text;
      directFetchSuccess = true;
    } catch (fetchErr) {
      console.warn("[Web Research] Direct URL fetch failed, falling back to Google Search grounding on URL & topic:", fetchErr);
    }

    if (directFetchSuccess && pageText.length > 80) {
      // Parse questions from fetched text
      const parsed = await parseQuestionsFromText(pageText, subject);
      const domain = extractDomain(url);
      const sourceCitation: SourceCitationInfo = {
        title: parsed.metadata.topic || topic || domain,
        url,
        domain,
        verifiedDate: new Date().toLocaleDateString(),
        isOfficialNCERT: domain.includes('ncert.nic.in'),
        isOfficialCBSE: domain.includes('cbse.gov.in')
      };

      const structuredQuestions: Question[] = (parsed.questions || []).map((q, idx) => ({
        ...q,
        origin: 'web_researched' as QuestionOrigin,
        source_info: sourceCitation,
        bloom_level: q.marks >= 4 ? 'Evaluate' : q.marks === 3 ? 'Apply' : q.marks === 2 ? 'Understand' : 'Remember',
        chapter: parsed.metadata.topic || chapter || topic
      }));

      return {
        topic: parsed.metadata.topic || topic || 'Extracted URL Content',
        summary: `Extracted ${structuredQuestions.length} academic questions from ${domain} on ${parsed.metadata.subject || subject}.`,
        keyConcepts: [parsed.metadata.topic || topic, subject, grade].filter(Boolean) as string[],
        suggestedQuestions: structuredQuestions,
        sources: [{
          title: parsed.metadata.topic || domain,
          url,
          domain,
          authority: classifySourceAuthority(url)
        }],
        mode: 'url',
        timestamp,
        subject: parsed.metadata.subject || subject,
        grade: parsed.metadata.grade || grade,
        board
      };
    }
  }

  // Modes 1, 2, 3 & URL fallback: Use Google Search Grounding
  let modeInstruction = '';
  let groundingSearchTerms = '';

  switch (mode) {
    case 'curriculum':
      modeInstruction = `
        RESEARCH MODE: OFFICIAL CURRICULUM & NCERT GROUNDING
        - Prioritize official NCERT textbooks, CBSE academic circulars, and official curriculum frameworks.
        - Ground concepts, definitions, and questions strictly in standard textbook terminology (Class ${grade}, ${subject}, ${board}).
        - Formulate questions reflecting recent board examination blueprints and competency-based questions (CBQs).
      `;
      groundingSearchTerms = `NCERT Class ${grade} ${subject} "${topic}" questions solutions`;
      break;

    case 'deep':
      modeInstruction = `
        RESEARCH MODE: DEEP TOPIC INVESTIGATION
        - Explore the subject matter thoroughly across theoretical fundamentals, real-world applications, and higher-order thinking skills (HOTS).
        - Break down core theorems, laws, formulas, and common misconceptions.
        - Provide diverse question types spanning Bloom's taxonomy: Remember, Understand, Apply, Analyze, Evaluate, Create.
        - Include Case Study / Source-based context where applicable.
      `;
      groundingSearchTerms = `${board} Class ${grade} ${subject} "${topic}" comprehensive questions case study`;
      break;

    case 'url':
      modeInstruction = `
        RESEARCH MODE: URL / DOMAIN GROUNDED EXTRACTION
        - The user targeted URL: ${url} (Topic: ${topic}).
        - Search and ground facts, key questions, and solutions specifically from or related to this source.
      `;
      groundingSearchTerms = `${url} ${topic} questions answers`;
      break;

    case 'quick':
    default:
      modeInstruction = `
        RESEARCH MODE: QUICK RESEARCH
        - Provide a concise, high-yield overview of key concepts.
        - Generate ${targetQuestionCount} high-probability examination questions aligned with ${grade} ${subject} (${board}).
      `;
      groundingSearchTerms = `${board} Class ${grade} ${subject} "${topic}" important exam questions`;
      break;
  }

  const prompt = `
    Act as a Master Curriculum Researcher and Senior Examination Author for ${board} (${grade}, ${subject}).
    
    TASK: Conduct comprehensive, fact-grounded educational research on the topic: "${topic}".
    ${chapter ? `Chapter Context: "${chapter}"` : ''}
    
    ${modeInstruction}
    
    REQUIREMENTS:
    1. Ground all facts and questions using Google Search.
    2. STRICT UNICODE MATH ONLY: Use √, ², ³, π, θ, △, ±, ×, ÷. NEVER use LaTeX (no backslashes).
    3. Generate a structured JSON response matching this EXACT specification:
    
    {
      "topic": "${topic}",
      "summary": "2-3 sentence overview of this academic topic and its curriculum relevance.",
      "keyConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
      "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
      "suggestedQuestions": [
        {
          "question_id": "gen_web_1",
          "section": "Section A",
          "question_text": "...",
          "options": ["Option A", "Option B", "Option C", "Option D"], // For MCQ, omit or empty array otherwise
          "answer_type": "MCQ | Assertion-Reason | Very Short Answer | Short Answer | Long Answer | Case Study",
          "marks": 1,
          "difficulty": 2, // 1 to 5
          "topic": "${topic}",
          "chapter": "${chapter || topic}",
          "bloom_level": "Remember | Understand | Apply | Analyze | Evaluate | Create",
          "solution": "Brief marking scheme solution / justification",
          "tags": ["Tag1", "Tag2"]
        }
      ]
    }
    
    Generate ${Math.max(3, Math.min(targetQuestionCount, 12))} diverse questions across question types.
    Ensure output is 100% valid JSON only.
  `;

  try {
    const response = await generateContentProxy({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.4
      }
    });

    const text = response.text || '';
    const { sources, searchQueries } = extractGroundingSources(response.candidates);

    // Extract JSON block
    let parsedData: any = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(text);
      }
    } catch (parseErr) {
      console.warn("[Web Research] Direct JSON parse failed, extracting questions via fallback parser:", parseErr);
      const fallbackParsed = await parseQuestionsFromText(text, subject);
      parsedData = {
        topic,
        summary: `Researched ${topic} for ${grade} ${subject}.`,
        keyConcepts: [topic, subject],
        suggestedQuestions: fallbackParsed.questions
      };
    }

    // Attach verified grounding sources and citations to each generated question
    const primarySource = sources[0];
    const rawQuestions = parsedData.suggestedQuestions || [];
    const formattedQuestions: Question[] = rawQuestions.map((q: any, idx: number) => {
      const qSource: SourceCitationInfo = {
        title: primarySource?.title || `${board} ${subject} Curriculum`,
        url: primarySource?.url,
        domain: primarySource?.domain,
        verifiedDate: new Date().toLocaleDateString(),
        isOfficialNCERT: primarySource?.authority === 'official_ncert',
        isOfficialCBSE: primarySource?.authority === 'official_cbse',
        isOfficialSCERT: primarySource?.authority === 'official_scert',
        searchQuery: searchQueries[0]
      };

      const bloom: BloomTaxonomyLevel = (
        q.bloom_level && ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].includes(q.bloom_level)
      ) ? q.bloom_level : (
        q.marks >= 5 ? 'Create' : q.marks === 4 ? 'Evaluate' : q.marks === 3 ? 'Analyze' : q.marks === 2 ? 'Understand' : 'Remember'
      );

      return {
        question_id: `res_${timestamp}_${idx + 1}`,
        section: q.section || (q.marks === 1 ? 'Section A' : q.marks <= 3 ? 'Section B' : 'Section C'),
        question_text: q.question_text || 'Sample academic question',
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : undefined,
        answer_type: q.answer_type || (Array.isArray(q.options) && q.options.length > 0 ? 'MCQ' : 'Short Answer'),
        marks: Number(q.marks) || 1,
        difficulty: Number(q.difficulty) || 3,
        topic: q.topic || topic,
        chapter: q.chapter || chapter || topic,
        can_regenerate: true,
        origin: 'web_researched' as QuestionOrigin,
        source_info: qSource,
        bloom_level: bloom,
        solution: q.solution,
        tags: Array.isArray(q.tags) ? q.tags : [subject, grade]
      };
    });

    return {
      topic: parsedData.topic || topic,
      summary: parsedData.summary || `Verified curriculum research completed on "${topic}".`,
      keyConcepts: Array.isArray(parsedData.keyConcepts) ? parsedData.keyConcepts : [topic],
      learningObjectives: Array.isArray(parsedData.learningObjectives) ? parsedData.learningObjectives : undefined,
      suggestedQuestions: formattedQuestions,
      sources,
      searchQueries,
      mode,
      timestamp,
      subject,
      grade,
      board
    };
  } catch (err: any) {
    console.error("[Web Research Error]:", err);
    // Never crash paper generation on web research failure; return graceful fallback
    return {
      topic,
      summary: `Web research could not contact live search providers (${err.message || 'Service unreachable'}). Defaulting to curriculum core principles.`,
      keyConcepts: [topic, subject, grade],
      suggestedQuestions: [],
      sources: [],
      searchQueries: [],
      mode,
      timestamp,
      subject,
      grade,
      board
    };
  }
}
