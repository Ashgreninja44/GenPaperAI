package com.genpaper.ai

import android.app.Application
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.genpaper.ai.data.model.GeneratedPaper
import com.genpaper.ai.data.model.UserProfile
import com.genpaper.ai.data.remote.FirebaseManager
import com.genpaper.ai.data.repository.AuthRepository
import com.genpaper.ai.data.repository.SubscriptionRepository
import com.genpaper.ai.ui.components.GenPaperBottomNav
import com.genpaper.ai.ui.components.GenPaperTopBar
import com.genpaper.ai.ui.screens.auth.LoginScreen
import com.genpaper.ai.ui.screens.bank.QuestionBankScreen
import com.genpaper.ai.ui.screens.dashboard.DashboardScreen
import com.genpaper.ai.ui.screens.generator.GeneratorScreen
import com.genpaper.ai.ui.screens.preview.PaperPreviewScreen
import com.genpaper.ai.ui.screens.profile.ProfileScreen
import com.genpaper.ai.ui.screens.subscription.SubscriptionScreen
import com.genpaper.ai.ui.theme.GenPaperTheme
import kotlinx.coroutines.launch

class GenPaperApp : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseManager.initialize(this)
    }
}

@Composable
fun MainApp(
    navController: NavHostController = rememberNavController(),
    authRepository: AuthRepository = remember { AuthRepository() },
    subscriptionRepository: SubscriptionRepository = remember { SubscriptionRepository() }
) {
    val firebaseUser by authRepository.observeAuthState().collectAsState(initial = authRepository.currentUser)
    var userProfile by remember { mutableStateOf<UserProfile?>(null) }
    var selectedPaper by remember { mutableStateOf<GeneratedPaper?>(null) }
    val scope = rememberCoroutineScope()

    // Sync profile on user change
    LaunchedEffect(firebaseUser) {
        val user = firebaseUser
        if (user != null) {
            userProfile = authRepository.syncUserProfile(user)
        } else {
            userProfile = null
        }
    }

    val isPlus = remember(userProfile) { subscriptionRepository.isUserPlus(userProfile) }

    GenPaperTheme {
        if (firebaseUser == null) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        } else {
            val navBackStackEntry by navController.currentBackStackEntryAsState()
            val currentRoute = navBackStackEntry?.destination?.route ?: "dashboard"

            val title = when (currentRoute) {
                "dashboard" -> "GenPaper AI"
                "generator" -> "New Paper"
                "bank" -> "Question Bank"
                "subscription" -> "Subscription"
                "profile" -> "Profile"
                "preview" -> "Paper Preview"
                else -> "GenPaper AI"
            }

            val showBottomNav = currentRoute in listOf("dashboard", "generator", "bank", "profile")
            val canNavigateBack = currentRoute !in listOf("dashboard", "login")

            Scaffold(
                topBar = {
                    GenPaperTopBar(
                        title = title,
                        canNavigateBack = canNavigateBack,
                        onNavigateBack = { navController.popBackStack() },
                        isPlus = isPlus,
                        onSubscriptionClick = { navController.navigate("subscription") }
                    )
                },
                bottomBar = {
                    if (showBottomNav) {
                        GenPaperBottomNav(
                            currentRoute = currentRoute,
                            onNavigate = { route ->
                                navController.navigate(route) {
                                    popUpTo("dashboard") { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            ) { innerPadding ->
                NavHost(
                    navController = navController,
                    startDestination = "dashboard",
                    modifier = Modifier.padding(innerPadding)
                ) {
                    composable("dashboard") {
                        DashboardScreen(
                            userProfile = userProfile,
                            isPlus = isPlus,
                            onNavigateToGenerate = { navController.navigate("generator") },
                            onNavigateToBank = { navController.navigate("bank") },
                            onNavigateToSubscription = { navController.navigate("subscription") },
                            onSelectPaper = { paper ->
                                selectedPaper = paper
                                navController.navigate("preview")
                            }
                        )
                    }
                    composable("generator") {
                        GeneratorScreen(
                            userId = firebaseUser?.uid ?: "",
                            isPlus = isPlus,
                            onPaperGenerated = { paper ->
                                selectedPaper = paper
                                navController.navigate("preview")
                            }
                        )
                    }
                    composable("bank") {
                        QuestionBankScreen(
                            userId = firebaseUser?.uid ?: "",
                            onSelectPaper = { paper ->
                                selectedPaper = paper
                                navController.navigate("preview")
                            }
                        )
                    }
                    composable("preview") {
                        val paper = selectedPaper
                        if (paper != null) {
                            PaperPreviewScreen(
                                paper = paper,
                                onBack = { navController.popBackStack() }
                            )
                        } else {
                            navController.popBackStack()
                        }
                    }
                    composable("subscription") {
                        SubscriptionScreen(
                            userProfile = userProfile,
                            isPlus = isPlus,
                            onBack = { navController.popBackStack() }
                        )
                    }
                    composable("profile") {
                        ProfileScreen(
                            userProfile = userProfile,
                            isPlus = isPlus,
                            onNavigateToSubscription = { navController.navigate("subscription") },
                            onSignOut = {
                                scope.launch {
                                    navController.navigate("dashboard") {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}
