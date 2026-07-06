package com.example.caiapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.caiapp.data.Usuario
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

@Serializable
data class UsuarioPerfilUpdate(
    val nombre_completo: String,
    val username: String,
    val cedula: String,
    val whatsapp: String? = null,
    val direccion: String? = null
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PerfilScreen(supabaseClient: SupabaseClient, modifier: Modifier = Modifier) {
    var usuario by remember { mutableStateOf<Usuario?>(null) }
    var nombre by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var cedula by remember { mutableStateOf("") }
    var whatsapp by remember { mutableStateOf("") }
    var direccion by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var successMessage by remember { mutableStateOf("") }
    
    val scope = rememberCoroutineScope()
    val currentUser = supabaseClient.auth.currentUserOrNull()

    LaunchedEffect(currentUser) {
        if (currentUser != null) {
            try {
                val user = supabaseClient.postgrest["usuarios"]
                    .select {
                        filter { eq("id", currentUser.id) }
                    }.decodeSingleOrNull<Usuario>()
                if (user != null) {
                    usuario = user
                    nombre = user.nombre_completo
                    username = user.username ?: ""
                    cedula = user.cedula ?: ""
                    whatsapp = user.whatsapp ?: ""
                    direccion = user.direccion ?: ""
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(androidx.compose.ui.graphics.Brush.verticalGradient(
                colors = listOf(Color(0xFFE0F7FA), Color.White)
            ))
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.Start
    ) {
        Text("Mi Perfil", fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF004D40))
        Text("Visualiza y edita tus datos", fontSize = 16.sp, color = Color(0xFF6B7280))
        
        Spacer(modifier = Modifier.height(24.dp))
        
        if (errorMessage.isNotEmpty()) {
            Text(errorMessage, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(bottom = 16.dp))
        }
        if (successMessage.isNotEmpty()) {
            Text(successMessage, color = Color(0xFF007F7F), modifier = Modifier.padding(bottom = 16.dp))
        }
        
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Datos Personales", fontWeight = FontWeight.Bold, color = Color(0xFF374151), fontSize = 18.sp)
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = nombre,
                    onValueChange = { nombre = it },
                    label = { Text("Nombre Completo") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(12.dp))
                
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Nombre de Usuario") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(12.dp))
                
                OutlinedTextField(
                    value = cedula,
                    onValueChange = { cedula = it },
                    label = { Text("Cédula") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(12.dp))
                
                OutlinedTextField(
                    value = whatsapp,
                    onValueChange = { whatsapp = it.replace(" ", "") },
                    label = { Text("Número de WhatsApp") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(12.dp))
                
                OutlinedTextField(
                    value = direccion,
                    onValueChange = { direccion = it },
                    label = { Text("Dirección") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Button(
                    onClick = {
                        isLoading = true
                        errorMessage = ""
                        successMessage = ""
                        scope.launch {
                            try {
                                if (currentUser != null) {
                                    supabaseClient.postgrest["usuarios"].update(
                                        UsuarioPerfilUpdate(
                                            nombre_completo = nombre.trim(),
                                            username = username.trim(),
                                            cedula = cedula.trim(),
                                            whatsapp = whatsapp.trim().takeIf { it.isNotBlank() },
                                            direccion = direccion.trim().takeIf { it.isNotBlank() } ?: "Por definir"
                                        )
                                    ) {
                                        filter { eq("id", currentUser.id) }
                                    }
                                    successMessage = "Perfil actualizado correctamente."
                                }
                            } catch (e: Exception) {
                                errorMessage = "Error al actualizar perfil: ${e.message}"
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF007F7F)),
                    enabled = !isLoading
                ) {
                    Text("Guardar Cambios", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Cambiar Contraseña", fontWeight = FontWeight.Bold, color = Color(0xFF374151), fontSize = 18.sp)
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = newPassword,
                    onValueChange = { newPassword = it },
                    label = { Text("Nueva Contraseña") },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Button(
                    onClick = {
                        if (newPassword.length < 6) {
                            errorMessage = "La contraseña debe tener al menos 6 caracteres"
                            return@Button
                        }
                        isLoading = true
                        errorMessage = ""
                        successMessage = ""
                        scope.launch {
                            try {
                                supabaseClient.auth.updateUser {
                                    password = newPassword
                                }
                                successMessage = "Contraseña cambiada correctamente."
                                newPassword = ""
                            } catch (e: Exception) {
                                errorMessage = "Error al cambiar contraseña: ${e.message}"
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F)),
                    enabled = !isLoading
                ) {
                    Text("Actualizar Contraseña", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
