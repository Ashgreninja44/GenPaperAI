package com.genpaper.ai.data.repository

import com.genpaper.ai.data.model.GeneratedPaper
import com.genpaper.ai.data.model.PaperConfig
import com.genpaper.ai.data.model.PaperSection
import com.genpaper.ai.data.model.Question
import com.genpaper.ai.data.remote.BackendAiRequest
import com.genpaper.ai.data.remote.BackendApiService
import com.genpaper.ai.data.remote.GeminiContent
import com.genpaper.ai.data.remote.GeminiPart
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class GenerationRepository(
    private val apiService: BackendApiService = BackendApiService.create(),
    private val authRepository: AuthRepository = AuthRepository()
) {
    private val gson = Gson()

    suspend fun generateQuestionPaper(config: PaperConfig): Result<GeneratedPaper> = withContext(Dispatchers.IO) {
        try {
            val token = authRepository.getIdToken()
            val authHeader = if (token != null) "Bearer $token" else null

            val systemInstruction = """
                You are GenPaper AI, an expert academic examination architect.
                Generate a well-balanced, high-quality question paper adhering strictly to Bloom's Revised Taxonomy.
                Return strictly valid JSON conforming to the requested schema.
            """.trimIndent()

            val prompt = """
                Generate a formal examination paper for:
                Subject: ${config.subject}
                Exam: ${config.examName}
                Institution: ${config.institution}
                Grade: ${config.grade}
                Total Marks: ${config.totalMarks}
                Duration: ${config.durationMinutes} Minutes
                Difficulty: ${config.difficulty}
                
                Bloom's Taxonomy Target Distribution:
                Remember: ${config.blooms.remember}%, Understand: ${config.blooms.understand}%, Apply: ${config.blooms.apply}%, Analyze: ${config.blooms.analyze}%, Evaluate: ${config.blooms.evaluate}%, Create: ${config.blooms.create}%
                
                Syllabus Topics & Reference Content:
                ${config.syllabus.ifBlank { "Standard university-level curriculum for ${config.subject}" }}
                
                Sections to include:
                ${config.sections.joinToString("\n") { "- ${it.name}: ${it.count} questions of type '${it.questionType}', ${it.marksPerQuestion} marks each." }}
                
                Output must be JSON with keys:
                {
                  "title": "String",
                  "subject": "String",
                  "sections": [
                    {
                      "name": "String",
                      "instructions": "String",
                      "totalMarks": Number,
                      "questions": [
                        {
                          "number": Number,
                          "text": "String (use LaTeX notation like $x^2$ where appropriate)",
                          "type": "MCQ | Short Answer | Long Answer",
                          "marks": Number,
                          "bloomLevel": "Remember | Understand | Apply | Analyze | Evaluate | Create",
                          "options": ["A", "B", "C", "D"], // for MCQ
                          "answerKey": "String"
                        }
                      ]
                    }
                  ]
                }
            """.trimIndent()

            val request = BackendAiRequest(
                model = "gemini-2.5-flash",
                contents = listOf(
                    GeminiContent(
                        role = "user",
                        parts = listOf(GeminiPart(text = prompt))
                    )
                ),
                systemInstruction = systemInstruction,
                generationConfig = mapOf(
                    "responseMimeType" to "application/json",
                    "temperature" to 0.4
                )
            )

            val response = apiService.generateContent(authHeader, request)
            val jsonText = response.text 
                ?: response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                ?: return@withContext Result.failure(Exception(response.error ?: "Empty response from AI server"))

            // Parse json into GeneratedPaper
            val parsedMap = gson.fromJson(jsonText, Map::class.java)
            
            @Suppress("UNCHECKED_CAST")
            val rawSections = (parsedMap["sections"] as? List<Map<String, Any>>) ?: emptyList()
            val sections = rawSections.map { secMap ->
                @Suppress("UNCHECKED_CAST")
                val rawQuestions = (secMap["questions"] as? List<Map<String, Any>>) ?: emptyList()
                val questions = rawQuestions.mapIndexed { idx, qMap ->
                    @Suppress("UNCHECKED_CAST")
                    Question(
                        id = UUID.randomUUID().toString(),
                        number = (qMap["number"] as? Number)?.toInt() ?: (idx + 1),
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
                    instructions = secMap["instructions"] as? String ?: "Answer the questions",
                    totalMarks = (secMap["totalMarks"] as? Number)?.toInt() ?: 0,
                    questions = questions
                )
            }

            val generatedPaper = GeneratedPaper(
                id = UUID.randomUUID().toString(),
                title = parsedMap["title"] as? String ?: "${config.subject} Examination",
                subject = config.subject,
                institution = config.institution,
                examName = config.examName,
                totalMarks = config.totalMarks,
                durationMinutes = config.durationMinutes,
                sections = sections,
                createdAt = System.currentTimeMillis()
            )

            Result.success(generatedPaper)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
