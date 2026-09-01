package com.casadeadoracionint.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.casadeadoracionint.app.data.Equipo
import com.casadeadoracionint.app.data.Red
import com.casadeadoracionint.app.data.Supabase
import com.casadeadoracionint.app.data.Usuario
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

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

fun formatPanamaPhone(input: String): String {
    val digits = input.filter { it.isDigit() }.take(8)
    return if (digits.length > 4) {
        "${digits.substring(0, 4)}-${digits.substring(4)}"
    } else {
        digits
    }
}

fun formatPanamaCedula(input: String): String {
    val clean = input.uppercase().trim()
    val digitsOnly = clean.filter { it.isDigit() }
    
    // If it contains letters (PE, E, N, AV, PI), allow formatted letters + digits
    if (clean.any { it.isLetter() }) {
        val filtered = clean.filter { it.isLetterOrDigit() || it == '-' }
        return filtered.take(16)
    }
    
    if (digitsOnly.isEmpty()) return ""
    
    // Auto-format digits into 00-0000-0000 / 8-963-952
    if (clean.contains("-")) {
        val parts = clean.split("-").map { it.filter { c -> c.isDigit() } }
        return parts.filter { it.isNotEmpty() }.joinToString("-").take(16)
    }
    
    return when {
        digitsOnly.length <= 2 -> digitsOnly
        digitsOnly.length in 3..6 -> {
            val p1 = digitsOnly.take(digitsOnly.length - 4.coerceAtMost(digitsOnly.length - 1))
            val p2 = digitsOnly.drop(p1.length)
            "$p1-$p2"
        }
        else -> {
            val provLen = if (digitsOnly.startsWith("1") && digitsOnly.length >= 8 && digitsOnly[1] in '0'..'3') 2 else 1
            val prov = digitsOnly.take(provLen)
            val rest = digitsOnly.drop(provLen)
            if (rest.length <= 4) {
                "$prov-$rest"
            } else {
                val tomo = rest.take(4)
                val asiento = rest.drop(4).take(5)
                "$prov-$tomo-$asiento"
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegistroScreen(
    onNavigateToLogin: () -> Unit,
    modifier: Modifier = Modifier
) {
    var nombre by remember { mutableStateOf("") }
    var apellido by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    
    var tipoDocumento by remember { mutableStateOf("Cédula") }
    var cedula by remember { mutableStateOf("") }
    
    var password by remember { mutableStateOf("") }
    var whatsapp by remember { mutableStateOf("") }
    var direccion by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    
    var planFelipe by remember { mutableStateOf(false) }
    var capacitacion by remember { mutableStateOf("No") }
    var expandedCapacitacion by remember { mutableStateOf(false) }
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
            errorMessage = "Todos los campos obligatorios deben ser completados."
            return
        }
        
        val nombreCompleto = "$nombre $apellido".trim()
        val trimmedEmail = email.trim().lowercase()
        val trimmedUsername = username.trim()
        val trimmedCedula = cedula.trim()
        
        isLoading = true
        errorMessage = ""
        
        scope.launch {
            try {
                // 1. Verificar duplicados en la base de datos (username, cedula y email)
                val existingUsers = Supabase.client.from("usuarios").select {
                    filter {
                        or {
                            eq("username", trimmedUsername)
                            eq("cedula", trimmedCedula)
                            eq("email", trimmedEmail)
                        }
                    }
                }.decodeList<Usuario>()

                if (existingUsers.isNotEmpty()) {
                    val dup = existingUsers.first()
                    errorMessage = when {
                        dup.email?.equals(trimmedEmail, ignoreCase = true) == true -> "El correo '$trimmedEmail' ya está registrado."
                        dup.username?.equals(trimmedUsername, ignoreCase = true) == true -> "El nombre de usuario '$trimmedUsername' ya está en uso."
                        else -> "El documento '$trimmedCedula' ya se encuentra registrado."
                    }
                    isLoading = false
                    return@launch
                }

                // 2. Registrar en Supabase Auth
                val authResult = try {
                    Supabase.client.auth.signUpWith(Email) {
                        this.email = trimmedEmail
                        this.password = password
                        data = buildJsonObject {
                            put("username", trimmedUsername)
                        }
                    }
                } catch (e: Exception) {
                    val msg = e.message ?: ""
                    if (msg.contains("already registered", ignoreCase = true) || msg.contains("User already exists", ignoreCase = true)) {
                        errorMessage = "El correo ya tiene una cuenta registrada. Si olvidaste tu contraseña, recupérala en la pantalla de inicio."
                    } else {
                        errorMessage = "Error de autenticación: ${e.message}"
                    }
                    isLoading = false
                    return@launch
                }

                val sessionUser = Supabase.client.auth.currentSessionOrNull()?.user
                val userId = authResult?.id ?: sessionUser?.id

                if (userId == null) {
                    errorMessage = "No se pudo obtener el identificador de usuario tras el registro. Por favor intenta iniciar sesión."
                    isLoading = false
                    return@launch
                }

                // 3. Insertar registro en public.usuarios
                try {
                    Supabase.client.from("usuarios").insert(
                        UsuarioInsert(
                            id = userId,
                            email = trimmedEmail,
                            nombre_completo = nombreCompleto,
                            username = trimmedUsername,
                            cedula = trimmedCedula,
                            equipo_lider_id = selectedEquipo!!.id,
                            red_asignada_id = selectedRed!!.id,
                            nivel = 1,
                            plan_felipe = planFelipe,
                            capacitacion = capacitacion,
                            ministerio = ministerio.trim().takeIf { it.isNotBlank() } ?: "Ninguno",
                            pendiente_aprobacion = true,
                            whatsapp = whatsapp.takeIf { it.isNotBlank() },
                            direccion = direccion.trim().takeIf { it.isNotBlank() } ?: "Por definir"
                        )
                    )
                } catch (e: Exception) {
                    errorMessage = "Error al registrar perfil: ${e.message}"
                    isLoading = false
                    return@launch
                }
                    
                // 4. Insertar notificación para los líderes del equipo seleccionado
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
                    e.printStackTrace()
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

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        text = "Registro de Líder", 
                        fontSize = 20.sp, 
                        fontWeight = FontWeight.Bold, 
                        color = Color(0xFF0D509E)
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateToLogin) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack, 
                            contentDescription = "Volver al Login",
                            tint = Color(0xFF0D509E)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFF4F7FC))
            )
        },
        containerColor = Color(0xFFF4F7FC)
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .imePadding()
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Darse de Alta como Líder", 
                fontSize = 26.sp, 
                fontWeight = FontWeight.Bold, 
                color = Color(0xFF0D509E)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Regístrate seleccionando tu Red y Líder Directo.", 
                color = Color.Gray, 
                fontSize = 14.sp
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            if (errorMessage.isNotEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                ) {
                    Text(
                        text = errorMessage,
                        color = Color(0xFFC62828),
                        modifier = Modifier.padding(14.dp),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            OutlinedTextField(
                value = nombre,
                onValueChange = { nombre = it },
                label = { Text("Nombre *") },
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
                label = { Text("Apellido *") },
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
                label = { Text("Nombre de Usuario (ej. juanperez123) *") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = Color(0xFF0D509E),
                    unfocusedBorderColor = Color.LightGray
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            // Selector Tipo de Documento: Cédula o Pasaporte
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                FilterChip(
                    selected = tipoDocumento == "Cédula",
                    onClick = { 
                        tipoDocumento = "Cédula"
                        if (cedula.isNotBlank()) {
                            cedula = formatPanamaCedula(cedula)
                        }
                    },
                    label = { Text("Cédula Panameña", fontWeight = if (tipoDocumento == "Cédula") FontWeight.Bold else FontWeight.Normal) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF0D509E),
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = tipoDocumento == "Pasaporte",
                    onClick = { tipoDocumento = "Pasaporte" },
                    label = { Text("Pasaporte", fontWeight = if (tipoDocumento == "Pasaporte") FontWeight.Bold else FontWeight.Normal) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF0D509E),
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            OutlinedTextField(
                value = cedula,
                onValueChange = { 
                    cedula = if (tipoDocumento == "Cédula") {
                        formatPanamaCedula(it)
                    } else {
                        it.uppercase().filter { c -> c.isLetterOrDigit() }.take(20)
                    }
                },
                label = { Text(if (tipoDocumento == "Cédula") "Cédula (ej. 8-963-952 o 00-0000-0000) *" else "Número de Pasaporte *") },
                placeholder = { Text(if (tipoDocumento == "Cédula") "8-963-952" else "PA12345678") },
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
                label = { Text("Correo Electrónico *") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
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
                onValueChange = { whatsapp = formatPanamaPhone(it) },
                label = { Text("Número de WhatsApp / Teléfono (Opcional)") },
                placeholder = { Text("6000-0000") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
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
                label = { Text("Contraseña *") },
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
                    label = { Text("Selecciona tu Red *") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedRedes) },
                    modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, true).fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        focusedBorderColor = Color(0xFF0D509E),
                        unfocusedBorderColor = Color.LightGray
                    )
                )
                ExposedDropdownMenu(
                    expanded = expandedRedes,
                    onDismissRequest = { expandedRedes = false }
                ) {
                    if (redes.isEmpty()) {
                        DropdownMenuItem(
                            text = { Text("Cargando redes...", color = Color.Gray) },
                            onClick = { expandedRedes = false }
                        )
                    } else {
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
                    label = { Text("Selecciona tu Equipo de Líderes *") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedLideres) },
                    modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, true).fillMaxWidth(),
                    enabled = selectedRed != null,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        focusedBorderColor = Color(0xFF0D509E),
                        unfocusedBorderColor = Color.LightGray
                    )
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
                modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp)
            ) {
                Checkbox(
                    checked = planFelipe,
                    onCheckedChange = { planFelipe = it }
                )
                Text(
                    text = "¿Entrenado en Plan Felipe?",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Dropdown Recibiendo Capacitación
            ExposedDropdownMenuBox(
                expanded = expandedCapacitacion,
                onExpandedChange = { expandedCapacitacion = !expandedCapacitacion }
            ) {
                OutlinedTextField(
                    value = capacitacion,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("¿Recibiendo Capacitación actualmente?") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedCapacitacion) },
                    modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, true).fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        focusedBorderColor = Color(0xFF0D509E),
                        unfocusedBorderColor = Color.LightGray
                    )
                )
                ExposedDropdownMenu(
                    expanded = expandedCapacitacion,
                    onDismissRequest = { expandedCapacitacion = false }
                ) {
                    listOf(
                        "No",
                        "Sí - Plan Felipe",
                        "Sí - Escuela de Líderes",
                        "Sí - Seminario de Visión",
                        "Sí - Discipulado",
                        "Sí - Otro"
                    ).forEach { option ->
                        DropdownMenuItem(
                            text = { Text(option) },
                            onClick = {
                                capacitacion = option
                                expandedCapacitacion = false
                            }
                        )
                    }
                }
            }
            
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

            Button(
                onClick = { handleRegister() },
                modifier = Modifier.fillMaxWidth().height(52.dp),
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
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier
                    .clickable { onNavigateToLogin() }
                    .padding(8.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
