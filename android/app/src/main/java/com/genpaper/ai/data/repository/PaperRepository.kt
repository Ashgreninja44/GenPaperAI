package com.genpaper.ai.data.repository

import com.genpaper.ai.data.model.GeneratedPaper
import com.genpaper.ai.data.model.PaperSection
import com.genpaper.ai.data.model.Question
import com.genpaper.ai.data.remote.FirebaseManager
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.util.UUID

class PaperRepository {
    private val firestore = FirebaseManager.firestore

    fun observeUserPapers(userId: String): Flow<List<GeneratedPaper>> = callbackFlow {
        val query = firestore.collection("users").document(userId)
            .collection("papers")
            .orderBy("createdAt", Query.Direction.DESCENDING)

        val listener = query.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null) {
                trySend(emptyList())
                return@addSnapshotListener
            }

            val papers = snapshot.documents.mapNotNull { doc ->
                val data = doc.data ?: return@mapNotNull null
                
                @Suppress("UNCHECKED_CAST")
                val rawSections = data["sections"] as? List<Map<String, Any>> ?: emptyList()
                val sections = rawSections.map { secMap ->
                    @Suppress("UNCHECKED_CAST")
                    val rawQuestions = secMap["questions"] as? List<Map<String, Any>> ?: emptyList()
                    val questions = rawQuestions.map { qMap ->
                        @Suppress("UNCHECKED_CAST")
                        Question(
                            id = qMap["id"] as? String ?: UUID.randomUUID().toString(),
                            number = (qMap["number"] as? Number)?.toInt() ?: 1,
                            text = qMap["text"] as? String ?: "",
                            type = qMap["type"] as? String ?: "Short Answer",
                            marks = (qMap["marks"] as? Number)?.toInt() ?: 2,
                            bloomLevel = qMap["bloomLevel"] as? String ?: "Understand",
                            options = qMap["options"] as? List<String>,
                            answerKey = qMap["answerKey"] as? String
                        )
                    }
                    PaperSection(
                        name = secMap["name"] as? String ?: "Section",
                        instructions = secMap["instructions"] as? String ?: "",
                        totalMarks = (secMap["totalMarks"] as? Number)?.toInt() ?: 0,
                        questions = questions
                    )
                }

                GeneratedPaper(
                    id = doc.id,
                    title = data["title"] as? String ?: (data["subject"] as? String ?: "Question Paper"),
                    subject = data["subject"] as? String ?: "",
                    institution = data["institution"] as? String ?: "",
                    examName = data["examName"] as? String ?: "",
                    totalMarks = (data["totalMarks"] as? Number)?.toInt() ?: 50,
                    durationMinutes = (data["durationMinutes"] as? Number)?.toInt() ?: 90,
                    sections = sections,
                    createdAt = (data["createdAt"] as? Number)?.toLong() ?: System.currentTimeMillis(),
                    userId = userId
                )
            }
            trySend(papers)
        }

        awaitClose { listener.remove() }
    }

    suspend fun savePaper(userId: String, paper: GeneratedPaper): String {
        val paperId = if (paper.id.isNotBlank()) paper.id else UUID.randomUUID().toString()
        val docRef = firestore.collection("users").document(userId).collection("papers").document(paperId)

        val dataMap = mapOf(
            "id" to paperId,
            "title" to (paper.title.ifBlank { "${paper.subject} - ${paper.examName}" }),
            "subject" to paper.subject,
            "institution" to paper.institution,
            "examName" to paper.examName,
            "totalMarks" to paper.totalMarks,
            "durationMinutes" to paper.durationMinutes,
            "createdAt" to paper.createdAt,
            "userId" to userId,
            "sections" to paper.sections.map { sec ->
                mapOf(
                    "name" to sec.name,
                    "instructions" to sec.instructions,
                    "totalMarks" to sec.totalMarks,
                    "questions" to sec.questions.map { q ->
                        mapOf(
                            "id" to q.id,
                            "number" to q.number,
                            "text" to q.text,
                            "type" to q.type,
                            "marks" to q.marks,
                            "bloomLevel" to q.bloomLevel,
                            "options" to (q.options ?: emptyList<String>()),
                            "answerKey" to (q.answerKey ?: "")
                        )
                    }
                )
            }
        )

        docRef.set(dataMap).await()
        return paperId
    }

    suspend fun deletePaper(userId: String, paperId: String) {
        firestore.collection("users").document(userId).collection("papers").document(paperId).delete().await()
    }
}
