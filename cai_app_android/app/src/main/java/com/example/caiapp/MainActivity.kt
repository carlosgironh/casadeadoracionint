package com.example.caiapp

import android.util.Log
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.caiapp.theme.CAIAppTheme

import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.background
import androidx.compose.ui.Alignment

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.d("MainActivity", "onCreate called")

    enableEdgeToEdge()
    setContent {
      CAIAppTheme { 
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) { 
            var isLoggedIn by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
            var showLoginScreen by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
            var showRegistroScreen by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }

            if (showRegistroScreen) {
                com.example.caiapp.ui.RegistroScreen(
                    onNavigateToLogin = {
                        showRegistroScreen = false
                        showLoginScreen = true
                    }
                )
            } else if (showLoginScreen) {
                com.example.caiapp.ui.LoginScreen(
                    onLoginSuccess = { 
                        isLoggedIn = true
                        showLoginScreen = false 
                    },
                    onBackClick = {
                        showLoginScreen = false
                    },
                    onRegisterClick = {
                        showLoginScreen = false
                        showRegistroScreen = true
                    }
                )
            } else {
                MainNavigation(
                    isLoggedIn = isLoggedIn,
                    onLoginClick = { showLoginScreen = true },
                    onLogoutClick = { isLoggedIn = false }
                )
            }
        } 
      }
    }
  }
}
