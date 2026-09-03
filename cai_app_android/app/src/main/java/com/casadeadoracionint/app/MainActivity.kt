package com.casadeadoracionint.app

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.casadeadoracionint.app.data.Supabase
import com.casadeadoracionint.app.theme.CAIAppTheme
import io.github.jan.supabase.auth.auth
import kotlinx.coroutines.launch

// Tiempo de inactividad: 3 horas (180 minutos)
// Permite que la célula (pre-reunión, reunión y refrigerio) se lleve a cabo sin interrupciones
private const val INACTIVITY_TIMEOUT_MS = 3 * 60 * 60 * 1000L

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.d("MainActivity", "onCreate called")

    enableEdgeToEdge()
    setContent {
      CAIAppTheme { 
        val context = LocalContext.current
        val prefs = remember { context.getSharedPreferences("cai_session_prefs", Context.MODE_PRIVATE) }
        val scope = rememberCoroutineScope()

        var isLoggedIn by remember { 
            mutableStateOf(Supabase.client.auth.currentSessionOrNull() != null) 
        }
        var showLoginScreen by remember { mutableStateOf(false) }
        var showRegistroScreen by remember { mutableStateOf(false) }

        fun recordActivity() {
            prefs.edit().putLong("last_active_time", System.currentTimeMillis()).apply()
        }

        fun checkInactivity() {
            if (isLoggedIn) {
                val lastActive = prefs.getLong("last_active_time", 0L)
                val now = System.currentTimeMillis()
                if (lastActive > 0L && (now - lastActive) > INACTIVITY_TIMEOUT_MS) {
                    Log.d("MainActivity", "Inactividad superó 3 horas. Cerrando sesión...")
                    scope.launch {
                        try {
                            Supabase.client.auth.signOut()
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                        isLoggedIn = false
                        showLoginScreen = false
                        prefs.edit().remove("last_active_time").apply()
                    }
                } else {
                    recordActivity()
                }
            }
        }

        val lifecycleOwner = LocalLifecycleOwner.current
        DisposableEffect(lifecycleOwner, isLoggedIn) {
            val observer = LifecycleEventObserver { _, event ->
                if (event == Lifecycle.Event.ON_RESUME) {
                    checkInactivity()
                }
            }
            lifecycleOwner.lifecycle.addObserver(observer)
            onDispose {
                lifecycleOwner.lifecycle.removeObserver(observer)
            }
        }

        LaunchedEffect(Unit) {
            val session = Supabase.client.auth.currentSessionOrNull()
            if (session != null) {
                isLoggedIn = true
                checkInactivity()
            }
        }

        Surface(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    awaitPointerEventScope {
                        while (true) {
                            awaitPointerEvent()
                            if (isLoggedIn) {
                                recordActivity()
                            }
                        }
                    }
                },
            color = MaterialTheme.colorScheme.background
        ) { 
            if (isLoggedIn) {
                MainNavigation(
                    isLoggedIn = true,
                    onLoginClick = {},
                    onLogoutClick = { 
                        isLoggedIn = false 
                        showLoginScreen = false
                        prefs.edit().remove("last_active_time").apply()
                    }
                )
            } else if (showRegistroScreen) {
                com.casadeadoracionint.app.ui.RegistroScreen(
                    onNavigateToLogin = {
                        showRegistroScreen = false
                        showLoginScreen = true
                    }
                )
            } else if (showLoginScreen) {
                com.casadeadoracionint.app.ui.LoginScreen(
                    onLoginSuccess = { 
                        isLoggedIn = true
                        showLoginScreen = false
                        recordActivity()
                    },
                    onBackClick = {
                        showLoginScreen = false
                    },
                    onRegisterClick = {
                        showRegistroScreen = true
                    }
                )
            } else {
                // Inicia en pantalla de Radio (con pestaña de Anuncios) para todo público
                MainNavigation(
                    isLoggedIn = false,
                    onLoginClick = { 
                        showLoginScreen = true 
                    },
                    onLogoutClick = {}
                )
            }
        } 
      }
    }
  }
}

