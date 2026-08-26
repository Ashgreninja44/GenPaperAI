package com.genpaper.ai.data.repository

import com.genpaper.ai.data.model.SubscriptionGlobalConfig
import com.genpaper.ai.data.model.SubscriptionPlanConfig
import com.genpaper.ai.data.model.UserProfile
import com.genpaper.ai.data.remote.FirebaseManager
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class SubscriptionRepository {
    private val firestore = FirebaseManager.firestore

    fun observeGlobalSubscriptionConfig(): Flow<SubscriptionGlobalConfig> = callbackFlow {
        val docRef = firestore.collection("app_config").document("subscriptions")
        val listener = docRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                trySend(SubscriptionGlobalConfig())
                return@addSnapshotListener
            }

            if (snapshot != null && snapshot.exists()) {
                val data = snapshot.data ?: emptyMap<String, Any>()
                val pricingVisible = (data["pricingVisible"] as? Boolean) ?: true
                
                @Suppress("UNCHECKED_CAST")
                val plans = data["plans"] as? Map<String, Any>
                @Suppress("UNCHECKED_CAST")
                val plusMap = plans?.get("plus") as? Map<String, Any>
                val plusPrice = (plusMap?.get("price") as? Number)?.toDouble() ?: 100.0
                val plusCurrency = (plusMap?.get("currency") as? String) ?: "₹"
                val plusBilling = (plusMap?.get("billingPeriodDisplay") as? String) ?: "6 months"

                val config = SubscriptionGlobalConfig(
                    pricingVisible = pricingVisible,
                    plusPlan = SubscriptionPlanConfig(
                        name = "Plus",
                        price = plusPrice,
                        currency = plusCurrency,
                        billingPeriodDisplay = plusBilling
                    )
                )
                trySend(config)
            } else {
                trySend(SubscriptionGlobalConfig())
            }
        }
        awaitClose { listener.remove() }
    }

    fun isUserPlus(user: UserProfile?): Boolean {
        if (user == null) return false
        if (user.isSuperAdmin || user.role == "super_admin") return true
        if (user.subscriptionTier == "plus" || user.isPlusSubscriber) {
            val exp = user.subscriptionDetails.expirationDate
            if (exp != null && System.currentTimeMillis() > exp) {
                return false // Expired
            }
            return true
        }
        return false
    }
}
