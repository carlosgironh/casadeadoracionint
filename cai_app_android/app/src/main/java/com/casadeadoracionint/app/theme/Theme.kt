package com.casadeadoracionint.app.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme =
    lightColorScheme(
        primary = Color(0xFF004D40),
        onPrimary = Color.White,
        primaryContainer = Color(0xFFE0F2F1),
        onPrimaryContainer = Color(0xFF004D40),
        secondary = Color(0xFF00796B),
        onSecondary = Color.White,
        tertiary = Color(0xFF0284C7),
        onTertiary = Color.White,
        background = Color(0xFFF4F6F9),
        onBackground = Color(0xFF1E293B),
        surface = Color.White,
        onSurface = Color(0xFF1E293B),
        surfaceVariant = Color(0xFFF1F5F9),
        onSurfaceVariant = Color(0xFF475569),
        outline = Color(0xFF94A3B8),
        outlineVariant = Color(0xFFCBD5E1)
    )

@Composable
fun CAIAppTheme(
    darkTheme: Boolean = false,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}

