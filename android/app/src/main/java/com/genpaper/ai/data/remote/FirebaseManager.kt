package com.genpaper.ai.data.remote

import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage

object FirebaseManager {
    private const val FIRESTORE_DATABASE_ID = "ai-studio-d247d3d4-b9ee-4655-b002-0f76bb05f062"

    private var _auth: FirebaseAuth? = null
    val auth: FirebaseAuth
        get() = _auth ?: FirebaseAuth.getInstance().also { _auth = it }

    private var _firestore: FirebaseFirestore? = null
    val firestore: FirebaseFirestore
        get() = _firestore ?: try {
            FirebaseFirestore.getInstance(FirebaseApp.getInstance(), FIRESTORE_DATABASE_ID).also { _firestore = it }
        } catch (e: Exception) {
            // Fallback to default if named instance is unavailable
            FirebaseFirestore.getInstance().also { _firestore = it }
        }

    private var _storage: FirebaseStorage? = null
    val storage: FirebaseStorage
        get() = _storage ?: FirebaseStorage.getInstance().also { _storage = it }

    fun initialize(context: Context) {
        if (FirebaseApp.getApps(context).isEmpty()) {
            FirebaseApp.initializeApp(context)
        }
    }
}
