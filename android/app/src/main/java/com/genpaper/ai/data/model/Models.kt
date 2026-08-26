package com.genpaper.ai.data.model

import com.google.gson.annotations.SerializedName

// --- User & Subscriptions ---
enum class SubscriptionTier {
    @SerializedName("free") FREE,
    @SerializedName("plus") PLUS
}

data class UserSubscriptionDetails(
    val tier: String = "free",
    val source: String = "Free Tier",
    val grantedAt: Long? = null,
    val expirationDate: Long? = null,
    val grantedBy: String? = null,
    val grantReason: String? = null
)

data class UserProfile(
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val photoURL: String? = null,
    val role: String = "user",
    val isSuperAdmin: Boolean = false,
    val isPlusSubscriber: Boolean = false,
    val subscriptionTier: String = "free",
    val subscriptionDetails: UserSubscriptionDetails = UserSubscriptionDetails(),
    val papersGeneratedCount: Int = 0,
    val lastActive: Long = System.currentTimeMillis(),
    val createdAt: Long = System.currentTimeMillis()
)

data class SubscriptionEntitlements(
    val maxMarksPerPaper: Int = 100,
    val monthlyPaperGenerationLimit: Int = 20,
    val maxQuestionsPerSection: Int = 10,
    val allowExportDocx: Boolean = true,
    val allowExportPdf: Boolean = true,
    val allowExportLatex: Boolean = false,
    val syllabusExtractionMaxPages: Int = 5,
    val adFreeExperience: Boolean = false,
    val priorityAiQueue: Boolean = false,
    val customWatermark: Boolean = false
)

data class SubscriptionPlanConfig(
    val name: String = "",
    val price: Double = 0.0,
    val currency: String = "₹",
    val billingPeriodDisplay: String = "6 months",
    val entitlements: SubscriptionEntitlements = SubscriptionEntitlements()
)

data class SubscriptionGlobalConfig(
    val pricingVisible: Boolean = true,
    val freePlan: SubscriptionPlanConfig = SubscriptionPlanConfig(
        name = "Free",
        price = 0.0,
        currency = "₹",
        billingPeriodDisplay = "Free Forever",
        entitlements = SubscriptionEntitlements(
            maxMarksPerPaper = 70,
            monthlyPaperGenerationLimit = 10,
            allowExportDocx = true,
            allowExportPdf = true,
            allowExportLatex = false,
            adFreeExperience = false
        )
    ),
    val plusPlan: SubscriptionPlanConfig = SubscriptionPlanConfig(
        name = "Plus",
        price = 100.0,
        currency = "₹",
        billingPeriodDisplay = "6 months",
        entitlements = SubscriptionEntitlements(
            maxMarksPerPaper = 100,
            monthlyPaperGenerationLimit = 9999,
            allowExportDocx = true,
            allowExportPdf = true,
            allowExportLatex = true,
            adFreeExperience = true,
            priorityAiQueue = true
        )
    )
)

// --- Question Paper Generator ---
data class BloomDistribution(
    val remember: Int = 20,
    val understand: Int = 25,
    val apply: Int = 25,
    val analyze: Int = 15,
    val evaluate: Int = 10,
    val create: Int = 5
)

data class SectionConfig(
    val name: String = "Section A",
    val questionType: String = "Short Answer", // "MCQ", "Short Answer", "Long Answer", "Numerical"
    val count: Int = 5,
    val marksPerQuestion: Int = 2,
    val choiceCount: Int = 5 // Optional choices
)

data class PaperConfig(
    val subject: String = "",
    val institution: String = "GenPaper AI Examination Board",
    val examName: String = "Mid-Term Examination",
    val grade: String = "College / University",
    val totalMarks: Int = 50,
    val durationMinutes: Int = 90,
    val syllabus: String = "",
    val difficulty: String = "Moderate", // Easy, Moderate, Challenging, Adaptive
    val blooms: BloomDistribution = BloomDistribution(),
    val sections: List<SectionConfig> = listOf(
        SectionConfig(name = "Section A (Objective)", questionType = "MCQ", count = 5, marksPerQuestion = 1),
        SectionConfig(name = "Section B (Short Answer)", questionType = "Short Answer", count = 5, marksPerQuestion = 3),
        SectionConfig(name = "Section C (Descriptive)", questionType = "Long Answer", count = 3, marksPerQuestion = 10)
    )
)

data class Question(
    val id: String = "",
    val number: Int = 1,
    val text: String = "",
    val type: String = "Short Answer",
    val marks: Int = 2,
    val bloomLevel: String = "Understand",
    val options: List<String>? = null,
    val answerKey: String? = null,
    val explanation: String? = null
)

data class PaperSection(
    val name: String = "Section A",
    val instructions: String = "Answer all questions",
    val totalMarks: Int = 10,
    val questions: List<Question> = emptyList()
)

data class GeneratedPaper(
    val id: String = "",
    val title: String = "",
    val subject: String = "",
    val institution: String = "",
    val examName: String = "",
    val totalMarks: Int = 50,
    val durationMinutes: Int = 90,
    val sections: List<PaperSection> = emptyList(),
    val answerKeys: List<String> = emptyList(),
    val rawLatex: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val userId: String = ""
)
