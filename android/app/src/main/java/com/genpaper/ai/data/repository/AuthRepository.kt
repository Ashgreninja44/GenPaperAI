package com.genpaper.ai.data.repository

import com.genpaper.ai.data.model.UserProfile
import com.genpaper.ai.data.model.UserSubscriptionDetails
import com.genpaper.ai.data.remote.FirebaseManager
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class AuthRepository {
    private val auth = FirebaseManager.auth
    private val firestore = FirebaseManager.firestore

    val currentUser: FirebaseUser?
        get() = auth.currentUser

    fun observeAuthState(): Flow<FirebaseUser?> = callbackFlow {
        val listener = com.google.firebase.auth.FirebaseAuth.AuthStateListener { firebaseAuth ->
            trySend(firebaseAuth.currentUser)
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    suspend fun getUserProfile(uid: String): UserProfile? {
        return try {
            val snapshot = firestore.collection("users").document(uid).get().await()
            if (snapshot.exists()) {
                val data = snapshot.data ?: return null
                UserProfile(
                    uid = uid,
                    email = data["email"] as? String ?: "",
                    displayName = data["displayName"] as? String ?: "",
                    photoURL = data["photoURL"] as? String,
                    role = data["role"] as? String ?: "user",
                    isSuperAdmin = (data["role"] as? String) == "super_admin" || (data["isSuperAdmin"] as? Boolean) == true,
                    isPlusSubscriber = (data["subscriptionTier"] as? String) == "plus" || (data["isPlusSubscriber"] as? Boolean) == true,
                    subscriptionTier = data["subscriptionTier"] as? String ?: "free",
                    papersGeneratedCount = (data["papersGeneratedCount"] as? Number)?.toInt() ?: 0
                )
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }

    suspend fun syncUserProfile(user: FirebaseUser): UserProfile {
        val docRef = firestore.collection("users").document(user.uid)
        val snapshot = docRef.get().await()

        val profile = if (snapshot.exists()) {
            val data = snapshot.data ?: emptyMap<String, Any>()
            UserProfile(
                uid = user.uid,
                email = user.email ?: "",
                displayName = user.displayName ?: user.email?.substringBefore("@") ?: "Educator",
                photoURL = user.photoUrl?.toString(),
                role = data["role"] as? String ?: "user",
                isSuperAdmin = (data["role"] as? String) == "super_admin",
                isPlusSubscriber = (data["subscriptionTier"] as? String) == "plus",
                subscriptionTier = data["subscriptionTier"] as? String ?: "free",
                papersGeneratedCount = (data["papersGeneratedCount"] as? Number)?.toInt() ?: 0
            )
        } else {
            val newProfile = UserProfile(
                uid = user.uid,
                email = user.email ?: "",
                displayName = user.displayName ?: user.email?.substringBefore("@") ?: "Educator",
                photoURL = user.photoUrl?.toString(),
                role = "user",
                subscriptionTier = "free",
                subscriptionDetails = UserSubscriptionDetails(tier = "free")
            )
            docRef.set(
                mapOf(
                    "uid" to user.uid,
                    "email" to (user.email ?: ""),
                    "displayName" to newProfile.displayName,
                    "photoURL" to (user.photoUrl?.toString() ?: ""),
                    "role" to "user",
                    "subscriptionTier" to "free",
                    "createdAt" to System.currentTimeMillis(),
                    "lastActive" to System.currentTimeMillis()
                )
            ).await()
            newProfile
        }
        return profile
    }

    suspend fun getIdToken(): String? {
        return try {
            auth.currentUser?.getIdToken(false)?.await()?.token
        } catch (e: Exception) {
            null
        }
    }

    fun signOut() {
        auth.signOut()
    }
}
