package com.example.caiapp.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.caiapp.data.Supabase
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.OtpType
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import kotlinx.serialization.json.put
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.coroutines.launch
import com.example.caiapp.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(onLoginSuccess: () -> Unit, onBackClick: () -> Unit = {}, onRegisterClick: () -> Unit = {}) {
    var identifier by remember { mutableStateOf("") } // Can be email or username
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var forgotPasswordDialog by remember { mutableStateOf(false) }
    var resetEmail by remember { mutableStateOf("") }
    var resetOtp by remember { mutableStateOf("") }
    var resetNewPassword by remember { mutableStateOf("") }
    var resetStep by remember { mutableStateOf(1) } // 1: Email, 2: OTP & New Password
    var resetError by remember { mutableStateOf("") }
    var resetSuccess by remember { mutableStateOf("") }
    var isResetLoading by remember { mutableStateOf(false) }
    
    val scope = rememberCoroutineScope()

    // Updated gradient for a more professional/sober look based on typical app logos
    val gradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF1A237E), Color(0xFF0D47A1), Color(0xFF01579B))
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Regresar", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        },
        containerColor = Color.Transparent
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(gradient)
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 32.dp, vertical = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Logo Container
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .shadow(24.dp, CircleShape)
                        .background(Color.White, CircleShape)
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.app_logo),
                        contentDescription = "Casa de Adoración INT",
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))

                Text(
                    text = "¡DIOS TE BENDIGA!",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    letterSpacing = 2.sp
                )
                
                Text(
                    text = "Ingresa a tu portal de líderes",
                    fontSize = 16.sp,
                    color = Color.White.copy(alpha = 0.8f),
                    fontWeight = FontWeight.Light,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(48.dp))

                // Identifier Field (Email or Username)
                OutlinedTextField(
                    value = identifier,
                    onValueChange = { identifier = it.replace(" ", "") },
                    placeholder = { Text("Correo o Usuario", color = Color.White.copy(alpha = 0.6f)) },
                    leadingIcon = { Icon(Icons.Rounded.Person, contentDescription = null, tint = Color.White) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color.White,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.5f),
                        focusedContainerColor = Color.White.copy(alpha = 0.1f),
                        unfocusedContainerColor = Color.White.copy(alpha = 0.05f),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Password Field
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it.replace(" ", "") },
                    placeholder = { Text("Contraseña", color = Color.White.copy(alpha = 0.6f)) },
                    leadingIcon = { Icon(Icons.Rounded.Lock, contentDescription = null, tint = Color.White) },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color.White,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.5f),
                        focusedContainerColor = Color.White.copy(alpha = 0.1f),
                        unfocusedContainerColor = Color.White.copy(alpha = 0.05f),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))
                
                if (errorMessage.isNotEmpty()) {
                    Text(
                        text = errorMessage,
                        color = Color(0xFFFF5252),
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                Text(
                    text = "¿Olvidaste tu contraseña?",
                    color = Color.White,
                    fontSize = 14.sp,
                    modifier = Modifier.align(Alignment.End).clickable { 
                        forgotPasswordDialog = true 
                        resetStep = 1
                        resetError = ""
                        resetSuccess = ""
                        resetEmail = ""
                        resetOtp = ""
                        resetNewPassword = ""
                    },
                    fontWeight = FontWeight.Medium
                )

                Spacer(modifier = Modifier.height(48.dp))

                // Modern Login Button
                LoginButton(
                    isLoading = isLoading,
                    onClick = {
                        if (!isLoading) {
                            scope.launch {
                                try {
                                    isLoading = true
                                    errorMessage = ""
                                    val currentIdentifier = identifier.trim()
                                    val currentPassword = password
                                    
                                    if (currentIdentifier.isBlank() || currentPassword.isBlank()) {
                                        errorMessage = "Ingresa correo y contraseña"
                                        return@launch
                                    }

                                    var loginEmail = currentIdentifier

                                    if (!currentIdentifier.contains("@")) {
                                        val params = kotlinx.serialization.json.buildJsonObject {
                                            put("p_username", kotlinx.serialization.json.JsonPrimitive(currentIdentifier))
                                        }
                                        val resolvedEmail = com.example.caiapp.data.Supabase.client.postgrest.rpc(
                                            "get_email_by_username",
                                            params
                                        ).decodeAsOrNull<String>()

                                        if (resolvedEmail == null) {
                                            errorMessage = "Usuario no encontrado"
                                            isLoading = false
                                            return@launch
                                        }
                                        loginEmail = resolvedEmail
                                    }

                                    com.example.caiapp.data.Supabase.client.auth.signInWith(io.github.jan.supabase.auth.providers.builtin.Email) {
                                        email = loginEmail
                                        this.password = currentPassword
                                    }
                                    onLoginSuccess()
                                } catch (e: Exception) {
                                    errorMessage = e.message ?: "Credenciales inválidas"
                                    e.printStackTrace()
                                } finally {
                                    isLoading = false
                                }
                            }
                        }
                    }
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Text(
                    text = "No tengo una cuenta. Registrarme.",
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { onRegisterClick() }.padding(8.dp)
                )
            }
        }
    }

    if (forgotPasswordDialog) {
        AlertDialog(
            onDismissRequest = { forgotPasswordDialog = false },
            title = { Text(if (resetStep == 1) "Recuperar Contraseña" else "Ingresa el Código") },
            text = {
                Column {
                    if (resetError.isNotEmpty()) {
                        Text(resetError, color = Color.Red, fontSize = 14.sp, modifier = Modifier.padding(bottom = 8.dp))
                    }
                    if (resetSuccess.isNotEmpty()) {
                        Text(resetSuccess, color = Color(0xFF00796B), fontSize = 14.sp, modifier = Modifier.padding(bottom = 8.dp))
                    }
                    if (resetStep == 1) {
                        Text("Ingresa tu correo electrónico para recibir un código de recuperación.", fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = resetEmail,
                            onValueChange = { resetEmail = it },
                            label = { Text("Correo Electrónico") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    } else if (resetStep == 2) {
                        Text("Ingresa el código de 6 dígitos que enviamos a tu correo y tu nueva contraseña.", fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = resetOtp,
                            onValueChange = { resetOtp = it },
                            label = { Text("Código de 6 dígitos") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = resetNewPassword,
                            onValueChange = { resetNewPassword = it },
                            label = { Text("Nueva Contraseña") },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        isResetLoading = true
                        resetError = ""
                        resetSuccess = ""
                        scope.launch {
                            try {
                                if (resetStep == 1) {
                                    Supabase.client.auth.resetPasswordForEmail(resetEmail.trim())
                                    resetSuccess = "Código enviado. Revisa tu correo."
                                    resetStep = 2
                                } else if (resetStep == 2) {
                                    if (resetNewPassword.length < 6) {
                                        resetError = "La nueva contraseña debe tener al menos 6 caracteres"
                                    } else {
                                        Supabase.client.auth.verifyEmailOtp(
                                            type = OtpType.Email.RECOVERY,
                                            email = resetEmail.trim(),
                                            token = resetOtp.trim()
                                        )
                                        Supabase.client.auth.updateUser {
                                            password = resetNewPassword
                                        }
                                        resetSuccess = "¡Contraseña actualizada exitosamente!"
                                        // Wait a moment then close
                                        kotlinx.coroutines.delay(2000)
                                        forgotPasswordDialog = false
                                    }
                                }
                            } catch (e: Exception) {
                                resetError = "Error: ${e.message}"
                            } finally {
                                isResetLoading = false
                            }
                        }
                    },
                    enabled = !isResetLoading
                ) {
                    Text(if (resetStep == 1) "Enviar Código" else "Actualizar")
                }
            },
            dismissButton = {
                TextButton(onClick = { forgotPasswordDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

@Composable
fun LoginButton(isLoading: Boolean, onClick: () -> Unit) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(if (isPressed) 0.95f else 1f)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .scale(scale)
            .shadow(if (isPressed) 4.dp else 12.dp, RoundedCornerShape(24.dp))
            .background(Color.White, RoundedCornerShape(24.dp))
            .clip(RoundedCornerShape(24.dp))
            .clickable(interactionSource = interactionSource, indication = null) {
                onClick()
            },
        contentAlignment = Alignment.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator(color = Color(0xFF0D47A1), modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
        } else {
            Text(
                text = "INGRESAR",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF0D47A1)
            )
        }
    }
}
