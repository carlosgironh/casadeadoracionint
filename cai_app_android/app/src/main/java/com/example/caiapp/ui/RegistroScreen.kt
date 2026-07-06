package com.example.caiapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import com.example.caiapp.data.Equipo
import com.example.caiapp.data.Red
import com.example.caiapp.data.Supabase
import com.example.caiapp.data.Usuario
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.launch

@kotlinx.serialization.Serializable
data class UsuarioUpdate(
    val nombre_completo: String,
    val username: String,
    val cedula: String,
    val equipo_lider_id: String,
    val red_asignada_id: String,
    val nivel: Int,
    val plan_felipe: Boolean,
    val capacitacion: String,
    val ministerio: String,
    val pendiente_aprobacion: Boolean
)

@kotlinx.serialization.Serializable
data class UsuarioInsert(
    val id: String,
    val email: String,
    val nombre_completo: String,
    val username: String,
    val cedula: String,
    val equipo_lider_id: String,
    val red_asignada_id: String,
    val nivel: Int,
    val plan_felipe: Boolean,
    val capacitacion: String,
    val ministerio: String,
    val pendiente_aprobacion: Boolean,
    val whatsapp: String? = null,
    val direccion: String? = null
)

@kotlinx.serialization.Serializable
data class NotificacionInsert(
    val usuario_id: String,
    val mensaje: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegistroScreen(
    onNavigateToLogin: () -> Unit,
    modifier: Modifier = Modifier
) {
    var nombre by remember { mutableStateOf("") }
    var apellido by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var cedula by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var whatsapp by remember { mutableStateOf("") }
    var direccion by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    
    var planFelipe by remember { mutableStateOf(false) }
    var capacitacion by remember { mutableStateOf("") }
    var ministerio by remember { mutableStateOf("") }
    
    var selectedEquipo by remember { mutableStateOf<Equipo?>(null) }
    var selectedRed by remember { mutableStateOf<Red?>(null) }
    
    var expandedLideres by remember { mutableStateOf(false) }
    var expandedRedes by remember { mutableStateOf(false) }
    
    var equiposList by remember { mutableStateOf<List<Equipo>>(emptyList()) }
    var redes by remember { mutableStateOf<List<Red>>(emptyList()) }
    
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        try {
            redes = Supabase.client.from("redes")
                .select { filter { eq("activa", true) } }
                .decodeList<Red>()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    LaunchedEffect(selectedRed) {
        if (selectedRed != null) {
            try {
                equiposList = Supabase.client.from("equipos")
                    .select {
                        filter {
                            eq("red_id", selectedRed!!.id)
                        }
                    }.decodeList<Equipo>()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        } else {
            equiposList = emptyList()
        }
    }

    fun handleRegister() {
        if (nombre.isBlank() || apellido.isBlank() || username.isBlank() || cedula.isBlank() || password.isBlank() || email.isBlank() || selectedEquipo == null || selectedRed == null) {
            errorMessage = "Todos los campos son obligatorios"
            return
        }
        
        val nombreCompleto = "$nombre $apellido".trim()
        
        isLoading = true
        errorMessage = ""
        
        scope.launch {
            try {


                // 2. Registrar en Supabase Auth
                val currentEmail = email.trim()
                val currentPassword = password
                val authResult = Supabase.client.auth.signUpWith(Email) {
                    this.email = currentEmail
                    this.password = currentPassword
                }

                // Si no hay confirmación de email, Supabase hace login automático y authResult puede ser null
                val sessionUser = Supabase.client.auth.currentSessionOrNull()?.user
                val userId = authResult?.id ?: sessionUser?.id

                if (userId != null) {
                    // Insert usuarios record
                    Supabase.client.from("usuarios").insert(
                        UsuarioInsert(
                            id = userId,
                            email = currentEmail,
                            nombre_completo = nombreCompleto,
                            username = username.trim(),
                            cedula = cedula.trim(),
                            equipo_lider_id = selectedEquipo!!.id,
                            red_asignada_id = selectedRed!!.id,
                            nivel = 1,
                            plan_felipe = planFelipe,
                            capacitacion = capacitacion,
                            ministerio = ministerio,
                            pendiente_aprobacion = true,
                            whatsapp = whatsapp.takeIf { it.isNotBlank() },
                            direccion = direccion.trim().takeIf { it.isNotBlank() } ?: "Por definir"
                        )
                    )
                    
                    // Insert notification for the leaders of the selected equipo (mega-equipo)
                    try {
                        val teamLeaders = Supabase.client.from("usuarios").select {
                            filter {
                                eq("equipo_id", selectedEquipo!!.id)
                            }
                        }.decodeList<Usuario>()

                        val msg = "¡Un nuevo líder ($nombreCompleto) se ha registrado bajo tu equipo y está pendiente de aprobación!"
                        val notificaciones = teamLeaders.map {
                            NotificacionInsert(
                                usuario_id = it.id,
                                mensaje = msg
                            )
                        }
                        if (notificaciones.isNotEmpty()) {
                            Supabase.client.from("notificaciones").insert(notificaciones)
                        }
                    } catch (e: Exception) {
                        e.printStackTrace() // Ignore if notification fails so registration proceeds
                    }
                }
                
                onNavigateToLogin()
            } catch (e: Exception) {
                errorMessage = e.message ?: "Error al registrar"
                e.printStackTrace()
            } finally {
                isLoading = false
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF4F7FC))
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Darse de Alta como Líder", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0D509E))
        Spacer(modifier = Modifier.height(8.dp))
        Text("Regístrate seleccionando tu Red y Líder Directo.", color = Color.Gray, fontSize = 14.sp)
        
        Spacer(modifier = Modifier.height(24.dp))
        
        if (errorMessage.isNotEmpty()) {
            Text(
                text = errorMessage,
                color = Color.Red,
                modifier = Modifier.padding(bottom = 16.dp),
                fontSize = 14.sp
            )
        }

        OutlinedTextField(
            value = nombre,
            onValueChange = { nombre = it },
            label = { Text("Nombre") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = apellido,
            onValueChange = { apellido = it },
            label = { Text("Apellido") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = username,
            onValueChange = { username = it.replace(" ", "") },
            label = { Text("Nombre de Usuario (ej. juanperez123)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        OutlinedTextField(
            value = cedula,
            onValueChange = { cedula = it },
            label = { Text("Cédula (V-...)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it.replace(" ", "") },
            label = { Text("Correo Electrónico") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = whatsapp,
            onValueChange = { whatsapp = it },
            label = { Text("Número de WhatsApp (Opcional)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = direccion,
            onValueChange = { direccion = it },
            label = { Text("Dirección (Opcional)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it.replace(" ", "") },
            label = { Text("Contraseña") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        Text(
            text = "Mínimo 6 caracteres, 1 mayúscula y 1 número.",
            color = Color.Gray,
            fontSize = 12.sp,
            modifier = Modifier.fillMaxWidth().padding(start = 8.dp, top = 4.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Dropdown Redes
        ExposedDropdownMenuBox(
            expanded = expandedRedes,
            onExpandedChange = { expandedRedes = !expandedRedes }
        ) {
            OutlinedTextField(
                value = selectedRed?.nombre ?: "",
                onValueChange = {},
                readOnly = true,
                label = { Text("Selecciona tu Red") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedRedes) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedRedes,
                onDismissRequest = { expandedRedes = false }
            ) {
                redes.forEach { red ->
                    DropdownMenuItem(
                        text = { Text(red.nombre) },
                        onClick = {
                            selectedRed = red
                            selectedEquipo = null
                            expandedRedes = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Dropdown Líderes
        ExposedDropdownMenuBox(
            expanded = expandedLideres,
            onExpandedChange = { expandedLideres = !expandedLideres }
        ) {
            OutlinedTextField(
                value = selectedEquipo?.nombre ?: "",
                onValueChange = {},
                readOnly = true,
                label = { Text("Selecciona tu Equipo de Líderes") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedLideres) },
                modifier = Modifier.menuAnchor().fillMaxWidth(),
                enabled = selectedRed != null
            )
            ExposedDropdownMenu(
                expanded = expandedLideres,
                onDismissRequest = { expandedLideres = false }
            ) {
                if (equiposList.isEmpty() && selectedRed != null) {
                    DropdownMenuItem(
                        text = { Text("No hay equipos en esta red", color = Color.Gray) },
                        onClick = { expandedLideres = false }
                    )
                } else {
                    equiposList.forEach { equipo ->
                        DropdownMenuItem(
                            text = { Text(equipo.nombre) },
                            onClick = {
                                selectedEquipo = equipo
                                expandedLideres = false
                            }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
        ) {
            Checkbox(
                checked = planFelipe,
                onCheckedChange = { planFelipe = it }
            )
            Text("¿Entrenado en Plan Felipe?")
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = capacitacion,
            onValueChange = { capacitacion = it },
            label = { Text("Recibiendo Capacitación (Opcional)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = ministerio,
            onValueChange = { ministerio = it },
            label = { Text("Ministerio en el que sirve (Opcional)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Color(0xFF0D509E),
                unfocusedBorderColor = Color.LightGray
            )
        )

        Spacer(modifier = Modifier.height(24.dp))

        if (errorMessage.isNotEmpty()) {
            Text(errorMessage, color = Color.Red, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(16.dp))
        }

        Button(
            onClick = { handleRegister() },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF007F7F)),
            shape = RoundedCornerShape(12.dp),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
            } else {
                Text("Validar y Registrar", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Volver al Login",
            color = Color(0xFF0D509E),
            modifier = Modifier.clickable { onNavigateToLogin() }
        )
    }
}
