package com.genpaper.ai.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.genpaper.ai.ui.theme.PurplePrimary
import com.genpaper.ai.ui.theme.TextTertiary

sealed class NavItem(val route: String, val label: String, val icon: ImageVector) {
    object Dashboard : NavItem("dashboard", "Home", Icons.Default.Home)
    object Generator : NavItem("generator", "Generate", Icons.Default.AddCircle)
    object Bank : NavItem("bank", "Papers", Icons.Default.Folder)
    object Profile : NavItem("profile", "Profile", Icons.Default.Person)
}

@Composable
fun GenPaperBottomNav(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    val items = listOf(
        NavItem.Dashboard,
        NavItem.Generator,
        NavItem.Bank,
        NavItem.Profile
    )

    NavigationBar(
        containerColor = Color.White,
        tonalElevation = 8.dp
    ) {
        items.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label,
                        tint = if (selected) PurplePrimary else TextTertiary
                    )
                },
                label = {
                    Text(
                        text = item.label,
                        color = if (selected) PurplePrimary else TextTertiary
                    )
                },
                selected = selected,
                onClick = { onNavigate(item.route) },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = PurplePrimary.copy(alpha = 0.1f)
                )
            )
        }
    }
}
