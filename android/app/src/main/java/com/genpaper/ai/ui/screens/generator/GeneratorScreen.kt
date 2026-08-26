package com.genpaper.ai.ui.screens.generator

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.genpaper.ai.data.model.BloomDistribution
import com.genpaper.ai.data.model.GeneratedPaper
import com.genpaper.ai.data.model.PaperConfig
import com.genpaper.ai.data.model.SectionConfig
import com.genpaper.ai.data.repository.GenerationRepository
import com.genpaper.ai.data.repository.PaperRepository
import com.genpaper.ai.ui.theme.PurplePrimary
import kotlinx.coroutines.launch

@Composable
fun GeneratorScreen(
    userId: String,
    isPlus: Boolean,
    onPaperGenerated: (GeneratedPaper) -> Unit,
    generationRepository: GenerationRepository = remember { GenerationRepository() },
    paperRepository: PaperRepository = remember { PaperRepository() }
) {
    var subject by remember { mutableStateOf("") }
    var examName by remember { mutableStateOf("Mid-Term Examination") }
    var institution by remember { mutableStateOf("GenPaper AI Examination Board") }
    var grade by remember { mutableStateOf("College / University") }
    var totalMarks by remember { mutableStateOf(50) }
    var durationMinutes by remember { mutableStateOf(90) }
    var syllabus by remember { mutableStateOf("") }
    var difficulty by remember { mutableStateOf("Moderate") }

    // Bloom's levels (sum ~ 100%)
    var rememberPercent by remember { mutableStateOf(20f) }
    var understandPercent by remember { mutableStateOf(25f) }
    var applyPercent by remember { mutableStateOf(25f) }
    var analyzePercent by remember { mutableStateOf(15f) }
    var evaluatePercent by remember { mutableStateOf(10f) }
    var createPercent by remember { mutableStateOf(5f) }

    var isGenerating by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Generate Academic Question Paper",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF111827)
            )
            Text(
                text = "Configure examination parameters & Bloom's Taxonomy weights",
                fontSize = 13.sp,
                color = Color.Gray
            )
        }

        if (errorMessage != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = errorMessage ?: "",
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        modifier = Modifier.padding(12.dp),
                        fontSize = 13.sp
                    )
                }
            }
        }

        // Subject & Exam Details Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "1. Basic Examination Information",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = PurplePrimary
                    )

                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it; errorMessage = null },
                        label = { Text("Subject / Course Name *") },
                        placeholder = { Text("e.g. Data Structures & Algorithms") },
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = examName,
                        onValueChange = { examName = it },
                        label = { Text("Examination Title") },
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = institution,
                        onValueChange = { institution = it },
                        label = { Text("Institution / University Name") },
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = totalMarks.toString(),
                            onValueChange = { totalMarks = it.toIntOrNull() ?: totalMarks },
                            label = { Text("Total Marks") },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = durationMinutes.toString(),
                            onValueChange = { durationMinutes = it.toIntOrNull() ?: durationMinutes },
                            label = { Text("Duration (min)") },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        // Syllabus Content Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "2. Syllabus & Core Topics",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = PurplePrimary
                    )

                    OutlinedTextField(
                        value = syllabus,
                        onValueChange = { syllabus = it },
                        label = { Text("Paste Syllabus, Units, or Module Details") },
                        placeholder = { Text("Unit 1: Arrays, Linked Lists...\nUnit 2: Stacks, Queues...\nUnit 3: Binary Trees...") },
                        minLines = 4,
                        maxLines = 8,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        // Bloom's Taxonomy Sliders
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "3. Bloom's Taxonomy Weightage",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = PurplePrimary
                    )

                    Text(
                        text = "Remember (${rememberPercent.toInt()}%)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Slider(
                        value = rememberPercent,
                        onValueChange = { rememberPercent = it },
                        valueRange = 0f..50f
                    )

                    Text(
                        text = "Understand (${understandPercent.toInt()}%)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Slider(
                        value = understandPercent,
                        onValueChange = { understandPercent = it },
                        valueRange = 0f..50f
                    )

                    Text(
                        text = "Apply (${applyPercent.toInt()}%)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Slider(
                        value = applyPercent,
                        onValueChange = { applyPercent = it },
                        valueRange = 0f..50f
                    )

                    Text(
                        text = "Analyze & Evaluate (${(analyzePercent + evaluatePercent).toInt()}%)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Slider(
                        value = analyzePercent,
                        onValueChange = { analyzePercent = it },
                        valueRange = 0f..50f
                    )
                }
            }
        }

        // Generate Action Button
        item {
            Button(
                onClick = {
                    if (subject.isBlank()) {
                        errorMessage = "Please enter a subject name"
                        return@Button
                    }
                    isGenerating = true
                    errorMessage = null
                    scope.launch {
                        val config = PaperConfig(
                            subject = subject.trim(),
                            examName = examName.trim(),
                            institution = institution.trim(),
                            grade = grade,
                            totalMarks = totalMarks,
                            durationMinutes = durationMinutes,
                            syllabus = syllabus.trim(),
                            difficulty = difficulty,
                            blooms = BloomDistribution(
                                remember = rememberPercent.toInt(),
                                understand = understandPercent.toInt(),
                                apply = applyPercent.toInt(),
                                analyze = analyzePercent.toInt(),
                                evaluate = evaluatePercent.toInt(),
                                create = createPercent.toInt()
                            )
                        )

                        val result = generationRepository.generateQuestionPaper(config)
                        result.onSuccess { generatedPaper ->
                            val paperWithUser = generatedPaper.copy(userId = userId)
                            // Save to Firestore
                            if (userId.isNotBlank()) {
                                paperRepository.savePaper(userId, paperWithUser)
                            }
                            isGenerating = false
                            onPaperGenerated(paperWithUser)
                        }.onFailure { error ->
                            isGenerating = false
                            errorMessage = error.localizedMessage ?: "Generation failed. Please try again."
                        }
                    }
                },
                enabled = !isGenerating,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Architecting Question Paper...", fontWeight = FontWeight.Bold)
                } else {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Generate with AI", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
