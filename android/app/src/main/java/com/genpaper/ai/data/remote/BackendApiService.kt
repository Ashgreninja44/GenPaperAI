package com.genpaper.ai.data.remote

import com.google.gson.annotations.SerializedName
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

data class GeminiPart(
    @SerializedName("text") val text: String? = null
)

data class GeminiContent(
    @SerializedName("role") val role: String = "user",
    @SerializedName("parts") val parts: List<GeminiPart>
)

data class BackendAiRequest(
    @SerializedName("model") val model: String = "gemini-2.5-flash",
    @SerializedName("contents") val contents: List<GeminiContent>,
    @SerializedName("systemInstruction") val systemInstruction: String? = null,
    @SerializedName("generationConfig") val generationConfig: Map<String, Any>? = null
)

data class BackendAiCandidate(
    @SerializedName("content") val content: GeminiContent?
)

data class BackendAiResponse(
    @SerializedName("candidates") val candidates: List<BackendAiCandidate>? = null,
    @SerializedName("text") val text: String? = null,
    @SerializedName("error") val error: String? = null
)

interface BackendApiService {
    @POST("/api/ai/generateContent")
    suspend fun generateContent(
        @Header("Authorization") authHeader: String?,
        @Body request: BackendAiRequest
    ): BackendAiResponse

    companion object {
        // Base URL pointing to the GenPaperAI Cloud Run instance
        private const val BASE_URL = "https://ais-dev-ha4tzqhkafm5jkwgucql4m-324148928305.asia-east1.run.app/"

        fun create(): BackendApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(120, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .addInterceptor(logging)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(BackendApiService::class.java)
        }
    }
}
