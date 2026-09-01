package com.casadeadoracionint.app

import android.util.Log
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.casadeadoracionint.app.theme.CAIAppTheme

import androidx.compose.runtime.*
import com.casadeadoracionint.app.data.Supabase
import io.github.jan.supabase.auth.auth

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.d("MainActivity", "onCreate called")

    enableEdgeToEdge()
    setContent {
      CAIAppTheme { 
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) { 
            var isLoggedIn by remember { 
                mutableStateOf(Supabase.client.auth.currentSessionOrNull() != null) 
            }
            var showRegistroScreen by remember { mutableStateOf(false) }

            LaunchedEffect(Unit) {
                val session = Supabase.client.auth.currentSessionOrNull()
                if (session != null) {
                    isLoggedIn = true
                }
            }

            if (isLoggedIn) {
                MainNavigation(
                    isLoggedIn = true,
                    onLoginClick = {},
                    onLogoutClick = { 
                        isLoggedIn = false 
                    }
                )
            } else if (showRegistroScreen) {
                com.casadeadoracionint.app.ui.RegistroScreen(
                    onNavigateToLogin = {
                        showRegistroScreen = false
                    }
                )
            } else {
                com.casadeadoracionint.app.ui.LoginScreen(
                    onLoginSuccess = { 
                        isLoggedIn = true
                    },
                    onBackClick = null,
                    onRegisterClick = {
                        showRegistroScreen = true
                    }
                )
            }
        } 
      }
    }
  }
}
