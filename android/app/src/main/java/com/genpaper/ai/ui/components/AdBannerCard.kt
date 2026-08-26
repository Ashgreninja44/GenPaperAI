package com.genpaper.ai.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.genpaper.ai.ui.theme.PurplePrimary
import com.genpaper.ai.ui.theme.PurpleSecondary

@Composable
fun AdBannerCard(
    isPlus: Boolean,
    onUpgradeClick: () -> Unit
) {
    if (isPlus) return // 100% ad-free for Plus subscribers

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable { onUpgradeClick() }
    ) {
        Box(
            modifier = Modifier
                .background(
                    Brush.linearGradient(
                        colors = listOf(PurplePrimary.copy(alpha = 0.08f), PurpleSecondary.copy(alpha = 0.12f))
                    )
                )
                .padding(14.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = "Plus",
                        tint = PurplePrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Column {
                        Text(
                            text = "Upgrade to GenPaper AI Plus",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = PurplePrimary
                        )
                        Text(
                            text = "Unlimited generation, LaTeX & 100% Ad-Free",
                            fontSize = 11.sp,
                            color = Color.DarkGray
                        )
                    }
                }
                Text(
                    text = "₹100",
                    fontWeight = FontWeight.Black,
                    fontSize = 14.sp,
                    color = PurplePrimary
                )
            }
        }
    }
}
