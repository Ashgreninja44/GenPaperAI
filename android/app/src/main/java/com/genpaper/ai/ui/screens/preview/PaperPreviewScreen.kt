package com.genpaper.ai.ui.screens.preview

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.genpaper.ai.data.model.GeneratedPaper
import com.genpaper.ai.ui.theme.PurplePrimary
import com.genpaper.ai.ui.theme.TextPrimary

@Composable
fun PaperPreviewScreen(
    paper: GeneratedPaper,
    onBack: () -> Unit
) {
    val context = LocalContext.current

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Examination Header Block
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = paper.institution.ifBlank { "GENPAPER AI EXAMINATION BOARD" }.uppercase(),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.DarkGray
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = paper.examName.ifBlank { "Formal Examination" },
                        fontWeight = FontWeight.Black,
                        fontSize = 18.sp,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Subject: ${paper.subject}",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 15.sp,
                        color = PurplePrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Divider(color = Color.LightGray.copy(alpha = 0.5f))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Time: ${paper.durationMinutes} Minutes",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Maximum Marks: ${paper.totalMarks}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = PurplePrimary
                        )
                    }
                }
            }
        }

        // Action Share Button
        item {
            Button(
                onClick = {
                    val shareText = buildString {
                        appendLine(paper.institution.uppercase())
                        appendLine(paper.examName)
                        appendLine("Subject: ${paper.subject} | Max Marks: ${paper.totalMarks}")
                        appendLine("----------------------------------------")
                        paper.sections.forEach { sec ->
                            appendLine("\n${sec.name} (${sec.totalMarks} Marks)")
                            appendLine(sec.instructions)
                            sec.questions.forEach { q ->
                                appendLine("${q.number}. ${q.text} [${q.marks}M - ${q.bloomLevel}]")
                                q.options?.forEachIndexed { idx, opt ->
                                    val label = ('A'.code + idx).toChar()
                                    appendLine("   ($label) $opt")
                                }
                            }
                        }
                    }
                    val sendIntent = Intent().apply {
                        action = Intent.ACTION_SEND
                        putExtra(Intent.EXTRA_TEXT, shareText)
                        type = "text/plain"
                    }
                    val shareIntent = Intent.createChooser(sendIntent, "Share Question Paper")
                    context.startActivity(shareIntent)
                },
                colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Share, contentDescription = "Share", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Export / Share Question Paper", fontWeight = FontWeight.Bold)
            }
        }

        // Render Sections and Questions
        paper.sections.forEach { section ->
            item {
                Text(
                    text = "${section.name} (${section.totalMarks} Marks)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = PurplePrimary
                )
                if (section.instructions.isNotBlank()) {
                    Text(
                        text = section.instructions,
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            }

            items(section.questions) { q ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Text(
                                text = "Q${q.number}.",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = PurplePrimary
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Surface(
                                    color = PurplePrimary.copy(alpha = 0.08f),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = q.bloomLevel,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = PurplePrimary,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Surface(
                                    color = Color(0xFF10B981).copy(alpha = 0.1f),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "${q.marks} Marks",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF047857),
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = q.text,
                            fontSize = 14.sp,
                            color = TextPrimary,
                            lineHeight = 20.sp
                        )

                        // If MCQ Options exist
                        if (!q.options.isNullOrEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                q.options.forEachIndexed { idx, opt ->
                                    val optLabel = ('A'.code + idx).toChar()
                                    Text(
                                        text = "($optLabel) $opt",
                                        fontSize = 13.sp,
                                        color = Color.DarkGray
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
        item { Spacer(modifier = Modifier.height(32.dp)) }
    }
}
