import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage, handleFirestoreError, OperationType } from '../firebase';
import { GeneratedPaper, Question } from '../types';

export const MAX_SAFE_DOC_SIZE_BYTES = 800 * 1024; // 800 KiB limit (well under Firestore's 1 MiB max)

/**
 * Calculates byte size of a JavaScript object when serialized to JSON string.
 */
export const estimateDocSize = (data: any): number => {
  try {
    const jsonString = JSON.stringify(data || {});
    return new TextEncoder().encode(jsonString).length;
  } catch (err) {
    console.warn("Failed to estimate doc size:", err);
    return 0;
  }
};

/**
 * Sanitizes object for Firestore by converting undefined fields to null or removing them.
 */
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);

  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj;
};

/**
 * Uploads base64 image data to Firebase Storage and returns public download URL.
 * Fallback to original string if upload fails or is not base64.
 */
export const uploadBase64ToStorage = async (
  storagePath: string, 
  base64Data: string
): Promise<string> => {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:image')) {
    return base64Data; // Already a URL or not base64
  }

  try {
    const storageRef = ref(storage, storagePath);
    await uploadString(storageRef, base64Data, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (err) {
    console.warn(`[Firebase Storage] Failed to upload image to ${storagePath}, falling back to inline:`, err);
    return base64Data;
  }
};

/**
 * Scans paper for base64 images (school logo & question diagram images) 
 * and offloads them to Firebase Storage.
 */
export const processAndOffloadPaperImages = async (
  paper: GeneratedPaper
): Promise<GeneratedPaper> => {
  const paperCopy = JSON.parse(JSON.stringify(paper)) as GeneratedPaper;

  // 1. Offload School Logo if base64
  if (paperCopy.config?.schoolLogo && paperCopy.config.schoolLogo.startsWith('data:image')) {
    const logoUrl = await uploadBase64ToStorage(
      `papers/${paperCopy.id}/logo_${Date.now()}.png`,
      paperCopy.config.schoolLogo
    );
    paperCopy.config.schoolLogo = logoUrl;
  }

  // 2. Offload Question Diagram Images if base64
  if (paperCopy.questions && paperCopy.questions.length > 0) {
    for (let i = 0; i < paperCopy.questions.length; i++) {
      const q = paperCopy.questions[i];
      if (q.image_url && q.image_url.startsWith('data:image')) {
        const imageUrl = await uploadBase64ToStorage(
          `papers/${paperCopy.id}/questions/${q.question_id || i}.png`,
          q.image_url
        );
        paperCopy.questions[i].image_url = imageUrl;
      }
    }
  }

  return paperCopy;
};

/**
 * Saves a generated paper to Firestore cleanly without exceeding the 1 MiB limit.
 * - Stores lightweight metadata in papers/{paperId}
 * - Stores questions in normalized subcollection paperDetails/{paperId}/questions/{questionId}
 */
export const savePaperToFirestore = async (
  db: Firestore,
  paper: GeneratedPaper,
  uid: string
): Promise<void> => {
  try {
    // Step 1: Offload large base64 images to Firebase Storage
    const processedPaper = await processAndOffloadPaperImages(paper);

    // Step 2: Separate questions from paper metadata
    const { questions, ...metadata } = processedPaper;

    // CRITICAL: Clean metadata config to strip manualQuestions array and prevent payload duplication
    const cleanConfig = { ...(metadata.config || {}) };
    delete cleanConfig.manualQuestions;

    const paperMetadataDoc = sanitizeForFirestore({
      ...metadata,
      config: cleanConfig,
      questionCount: questions ? questions.length : 0,
      uid,
      lastUpdated: Date.now()
    });

    // Size check for metadata document (< 800 KiB)
    const metadataSize = estimateDocSize(paperMetadataDoc);
    if (metadataSize > MAX_SAFE_DOC_SIZE_BYTES) {
      console.warn(`[Paper Storage] Metadata document size (${metadataSize} bytes) exceeds limit, trimming extra keys...`);
      if (paperMetadataDoc.answerKey && estimateDocSize(paperMetadataDoc.answerKey) > 200 * 1024) {
        paperMetadataDoc.answerKey = paperMetadataDoc.answerKey.substring(0, 50000) + "\n...[Answer key trimmed for storage]";
      }
    }

    // Step 3: Prepare detail header document
    const questionsSize = estimateDocSize({ questions });
    let detailHeaderDoc: Record<string, any> = sanitizeForFirestore({
      id: paper.id,
      uid,
      lastUpdated: Date.now(),
      questionCount: questions ? questions.length : 0,
      // Store questions array in main paperDetails doc ONLY IF total questions size is safe (< 300 KiB)
      ...(questionsSize < 300 * 1024 ? { questions } : {})
    });

    if (estimateDocSize(detailHeaderDoc) > MAX_SAFE_DOC_SIZE_BYTES) {
      // If header is too large, write lightweight header without questions array
      detailHeaderDoc = sanitizeForFirestore({
        id: paper.id,
        uid,
        lastUpdated: Date.now(),
        questionCount: questions ? questions.length : 0
      });
    }

    // Step 4: Parallelize writing metadata document to `papers/{paperId}` and `paperDetails/{paperId}`
    await Promise.all([
      setDoc(doc(db, 'papers', paper.id), paperMetadataDoc),
      setDoc(doc(db, 'paperDetails', paper.id), detailHeaderDoc)
    ]);

    // Step 5: Save each question into `paperDetails/{paperId}/questions/{q.question_id}` subcollection
    if (questions && questions.length > 0) {
      const BATCH_SIZE = 400; // Batch operations limit
      const commitPromises: Promise<void>[] = [];
      for (let i = 0; i < questions.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = questions.slice(i, i + BATCH_SIZE);

        for (let j = 0; j < chunk.length; j++) {
          const q = chunk[j];
          const qId = q.question_id || `q_${i + j + 1}`;
          const qDocRef = doc(db, 'paperDetails', paper.id, 'questions', qId);
          const sanitizedQ = sanitizeForFirestore(q);

          // Verify individual question doc size
          if (estimateDocSize(sanitizedQ) > MAX_SAFE_DOC_SIZE_BYTES) {
            console.warn(`[Paper Storage] Single question ${qId} is too large (${estimateDocSize(sanitizedQ)} bytes), stripping image.`);
            sanitizedQ.image_url = undefined;
          }

          batch.set(qDocRef, sanitizedQ);
        }
        commitPromises.push(batch.commit());
      }
      await Promise.all(commitPromises);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `papers/${paper.id}`);
  }
};

/**
 * Loads a full GeneratedPaper with questions from Firestore.
 * Handles subcollections, legacy paperDetails arrays, and legacy paperQuestions paths.
 */
export const loadPaperFromFirestore = async (
  db: Firestore,
  paperMetadata: GeneratedPaper
): Promise<GeneratedPaper> => {
  try {
    let questions: Question[] = [];

    // 1. Check primary normalized subcollection: `paperDetails/{paperId}/questions`
    const subcollSnap = await getDocs(collection(db, 'paperDetails', paperMetadata.id, 'questions'));
    if (!subcollSnap.empty) {
      questions = subcollSnap.docs.map(d => d.data() as Question);
    } else {
      // 2. Fallback: check inline questions array in `paperDetails/{paperId}`
      const detailSnap = await getDoc(doc(db, 'paperDetails', paperMetadata.id));
      if (detailSnap.exists() && Array.isArray(detailSnap.data()?.questions)) {
        questions = detailSnap.data().questions;
      } else {
        // 3. Fallback: check legacy `paperQuestions/{paperId}/questions`
        const legacySnap = await getDocs(collection(db, 'paperQuestions', paperMetadata.id, 'questions'));
        if (!legacySnap.empty) {
          questions = legacySnap.docs.map(d => d.data() as Question);
        }
      }
    }

    // Sort questions by section and question_id/order
    if (questions.length > 0) {
      questions.sort((a, b) => {
        const secCompare = (a.section || '').localeCompare(b.section || '');
        if (secCompare !== 0) return secCompare;
        return (a.question_id || '').localeCompare(b.question_id || '');
      });
    }

    return {
      ...paperMetadata,
      questions
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `paperDetails/${paperMetadata.id}`);
    return paperMetadata;
  }
};

/**
 * Deletes a paper and all its subcollections from Firestore.
 */
export const deletePaperFromFirestore = async (
  db: Firestore,
  paperId: string
): Promise<void> => {
  try {
    // Delete main metadata doc
    await deleteDoc(doc(db, 'papers', paperId));

    // Delete paperDetails doc
    await deleteDoc(doc(db, 'paperDetails', paperId));

    // Delete paperDetails/{paperId}/questions subcollection
    const qSnap = await getDocs(collection(db, 'paperDetails', paperId, 'questions'));
    if (!qSnap.empty) {
      const batch = writeBatch(db);
      qSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete legacy paperQuestions/{paperId}/questions subcollection
    const legacySnap = await getDocs(collection(db, 'paperQuestions', paperId, 'questions'));
    if (!legacySnap.empty) {
      const batch = writeBatch(db);
      legacySnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `papers/${paperId}`);
  }
};

/**
 * Fetches all papers across the platform for Admin Analytics.
 */
export const getAllStoredPapers = async (): Promise<GeneratedPaper[]> => {
  try {
    const { db } = await import('../firebase');
    const snap = await getDocs(collection(db, 'papers'));
    return snap.docs.map(d => d.data() as GeneratedPaper);
  } catch (err) {
    console.warn('[Storage] Error loading all papers for analytics:', err);
    return [];
  }
};

/**
 * Migrates guest session papers from sessionStorage to the authenticated user's Firestore collection.
 */
export const migrateGuestPapersToFirestore = async (
  db: Firestore,
  targetUid: string
): Promise<number> => {
  try {
    if (typeof window === 'undefined') return 0;
    const raw = sessionStorage.getItem('genpaper_pending_guest_papers');
    if (!raw) return 0;
    const guestPapers: GeneratedPaper[] = JSON.parse(raw);
    if (!Array.isArray(guestPapers) || guestPapers.length === 0) return 0;

    console.log(`[Guest Migration] Migrating ${guestPapers.length} guest papers to user ${targetUid}...`);
    let migratedCount = 0;
    for (const paper of guestPapers) {
      if (paper && paper.id) {
        const migratedPaper: GeneratedPaper = {
          ...paper,
          uid: targetUid,
          timestamp: paper.timestamp || Date.now()
        };
        await savePaperToFirestore(db, migratedPaper, targetUid);
        migratedCount++;
      }
    }

    sessionStorage.removeItem('genpaper_pending_guest_papers');
    return migratedCount;
  } catch (err) {
    console.error('[Guest Migration Error] Failed to migrate guest papers to Firestore:', err);
    return 0;
  }
};

