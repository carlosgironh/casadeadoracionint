package com.example.caiapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.time.LocalDate
import java.time.Period
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.UUID

import com.example.caiapp.data.Bosquejo
import com.example.caiapp.data.Supabase
import com.example.caiapp.data.AsistenteCelula
import com.example.caiapp.data.Celula
import com.example.caiapp.data.AsistenciaReunion
import com.example.caiapp.data.Usuario
import com.example.caiapp.data.ZonaExpansion
import com.example.caiapp.data.Red
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.launch

@kotlinx.serialization.Serializable
data class InformeResponse(val id: String)

@kotlinx.serialization.Serializable
data class InformeInsert(
    val lider_id: String,
    val lider_celula_id: String,
    val nombre_celula: String,
    val lugar: String,
    val estado: String,
    val fecha_reunion: String,
    val nuevos_convertidos: Int,
    val visitas: Int,
    val asistencia_total: Int,
    val ofrenda: Double?,
    val uso_bosquejo: Boolean,
    val bosquejo_id: String?,
    val tema_manual: String?,
    val versiculo_manual: String?,
    val asistentes: List<String>,
    val tema_tratado: String
)

@Composable
fun CelugramaScreen(modifier: Modifier = Modifier) {
    var isLoadingInitial by remember { mutableStateOf(true) }
    var celulasList by remember { mutableStateOf<List<Celula>>(emptyList()) }
    var celulaActual by remember { mutableStateOf<Celula?>(null) }
    var isCreatingNew by remember { mutableStateOf(false) }
    var isPendiente by remember { mutableStateOf(false) }
    var selectedTab by remember { mutableStateOf(0) }
    val scope = rememberCoroutineScope()
    val currentUser = Supabase.client.auth.currentUserOrNull()

    LaunchedEffect(Unit) {
        if (currentUser != null) {
            try {
                val usuarioDB = Supabase.client.from("usuarios")
                    .select { filter { eq("id", currentUser.id) } }
                    .decodeSingleOrNull<Usuario>()
                
                if (usuarioDB?.pendiente_aprobacion == true) {
                    isPendiente = true
                } else {
                    celulasList = Supabase.client.from("celulas")
                        .select { filter { eq("lider_id", currentUser.id) } }
                        .decodeList<Celula>()
                    celulaActual = celulasList.firstOrNull()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoadingInitial = false
            }
        } else {
            isLoadingInitial = false
        }
    }

    if (isLoadingInitial) {
        Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF007F7F))
        }
    } else if (isPendiente) {
        Box(modifier = modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(64.dp), tint = Color(0xFFD97706)) // O usa otro ícono si prefieres
                Spacer(modifier = Modifier.height(16.dp))
                Text("Cuenta Pendiente de Aprobación", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color(0xFFD97706))
                Spacer(modifier = Modifier.height(8.dp))
                Text("El líder desde su panel debe confirmar tu usuario de líder nuevo para que puedas generar reportes o crear células.", color = Color.Gray, fontSize = 16.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            }
        }
    } else if (celulaActual == null || isCreatingNew) {
        AperturaCelulaForm(
            onCelulaCreada = { newCelula -> 
                celulasList = celulasList + newCelula
                celulaActual = newCelula
                isCreatingNew = false
            },
            modifier = modifier
        )
    } else {
        Column(modifier = modifier.fillMaxSize()) {
            // Dropdown para seleccionar la célula activa y botón de +
            var expandedCellDropdown by remember { mutableStateOf(false) }
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(modifier = Modifier.weight(1f)) {
                    OutlinedButton(
                        onClick = { expandedCellDropdown = true },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF004D40))
                    ) {
                        Text(celulaActual?.zona ?: "Seleccionar Célula", maxLines = 1)
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.ArrowDropDown, contentDescription = null)
                    }
                    DropdownMenu(
                        expanded = expandedCellDropdown,
                        onDismissRequest = { expandedCellDropdown = false }
                    ) {
                        celulasList.forEach { cel ->
                            DropdownMenuItem(
                                text = { Text("${cel.zona} - ${cel.direccion}") },
                                onClick = {
                                    celulaActual = cel
                                    expandedCellDropdown = false
                                }
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(
                    onClick = { isCreatingNew = true },
                    modifier = Modifier.background(Color(0xFF00796B), shape = RoundedCornerShape(8.dp))
                ) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = "Nueva Célula", tint = Color.White)
                }
            }

            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color(0xFFE0F7FA),
                contentColor = Color(0xFF00796B)
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Reporte Semanal", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Datos de Célula", fontWeight = FontWeight.Bold) }
                )
            }
            if (selectedTab == 0) {
                CelugramaForm(celulaActual = celulaActual!!, modifier = Modifier.weight(1f))
            } else {
                DatosCelulaForm(
                    celula = celulaActual!!, 
                    onSaved = { updatedCelula -> 
                        celulaActual = updatedCelula
                        celulasList = celulasList.map { if (it.id == updatedCelula.id) updatedCelula else it }
                    }, 
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AperturaCelulaForm(onCelulaCreada: (Celula) -> Unit, modifier: Modifier = Modifier) {
    var selectedZona by remember { mutableStateOf<ZonaExpansion?>(null) }
    var expandedZonas by remember { mutableStateOf(false) }
    var zonasList by remember { mutableStateOf<List<ZonaExpansion>>(emptyList()) }
    var direccion by remember { mutableStateOf("") }
    var categoria by remember { mutableStateOf("General") }
    var fechaApertura by remember { mutableStateOf<java.time.LocalDate?>(null) }
    val context = androidx.compose.ui.platform.LocalContext.current
    var isLoading by remember { mutableStateOf(false) }
    
    var colideres by remember { mutableStateOf<List<Usuario>>(emptyList()) }
    var selectedColider by remember { mutableStateOf<Usuario?>(null) }
    var expandedColideres by remember { mutableStateOf(false) }
    var miEquipoId by remember { mutableStateOf<String?>(null) }

    val scope = rememberCoroutineScope()
    val currentUser = Supabase.client.auth.currentUserOrNull()

    LaunchedEffect(Unit) {
        if (currentUser == null) return@LaunchedEffect
        try {
            zonasList = Supabase.client.from("zonas_expansion")
                .select()
                .decodeList<ZonaExpansion>()

            val miUsuario = Supabase.client.from("usuarios")
                .select { filter { eq("id", currentUser.id) } }
                .decodeSingleOrNull<Usuario>()
            
            miEquipoId = miUsuario?.equipo_id
            
            if (miEquipoId != null) {
                colideres = Supabase.client.from("usuarios")
                    .select {
                        filter {
                            eq("equipo_lider_id", miEquipoId!!)
                            eq("pendiente_aprobacion", false)
                        }
                    }
                    .decodeList<Usuario>()
            }
        } catch (e: Exception) {
            e.printStackTrace()
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
        Text("Apertura de Célula", fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF004D40))
        Text("Registra los datos de tu nueva célula", fontSize = 16.sp, color = Color(0xFF6B7280))
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                
                // Selector de Fecha de Apertura
                Text("Fecha de Apertura", fontWeight = FontWeight.Bold, color = Color(0xFF374151))
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = fechaApertura?.toString() ?: "Seleccionar Fecha",
                    onValueChange = {},
                    readOnly = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        IconButton(onClick = {
                            val c = java.util.Calendar.getInstance()
                            val year = c.get(java.util.Calendar.YEAR)
                            val month = c.get(java.util.Calendar.MONTH)
                            val day = c.get(java.util.Calendar.DAY_OF_MONTH)
                            
                            android.app.DatePickerDialog(
                                context,
                                { _, y, m, d ->
                                    fechaApertura = java.time.LocalDate.of(y, m + 1, d)
                                },
                                year, month, day
                            ).show()
                        }) {
                            Icon(Icons.Default.ArrowDropDown, contentDescription = "Seleccionar Fecha")
                        }
                    }
                )
                Spacer(modifier = Modifier.height(16.dp))

                ExposedDropdownMenuBox(
                    expanded = expandedZonas,
                    onExpandedChange = { expandedZonas = !expandedZonas }
                ) {
                    OutlinedTextField(
                        value = if (selectedZona != null) "Zona ${selectedZona?.numero_zona ?: ""} - ${selectedZona?.lugares ?: ""}" else "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Zona") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedZonas) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    ExposedDropdownMenu(
                        expanded = expandedZonas,
                        onDismissRequest = { expandedZonas = false }
                    ) {
                        zonasList.forEach { z ->
                            DropdownMenuItem(
                                text = { Text("Zona ${z.numero_zona} - ${z.lugares}") },
                                onClick = {
                                    selectedZona = z
                                    expandedZonas = false
                                }
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = direccion,
                    onValueChange = { direccion = it },
                    label = { Text("Dirección de la Célula") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                
                Text("Categoría de Célula", fontWeight = FontWeight.Bold, color = Color(0xFF374151))
                Spacer(modifier = Modifier.height(8.dp))
                var mainCategoria by remember { mutableStateOf(if (categoria == "Niños") "Niños" else "General") }
                var expandedGeneralCat by remember { mutableStateOf(false) }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(
                            selected = mainCategoria == "Niños",
                            onClick = { 
                                mainCategoria = "Niños"
                                categoria = "Niños"
                            },
                            colors = RadioButtonDefaults.colors(selectedColor = Color(0xFF007F7F))
                        )
                        Text("Niños", fontSize = 14.sp)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(
                            selected = mainCategoria == "General",
                            onClick = { 
                                mainCategoria = "General"
                                if (categoria == "Niños") categoria = "Evangelística"
                            },
                            colors = RadioButtonDefaults.colors(selectedColor = Color(0xFF007F7F))
                        )
                        Text("General", fontSize = 14.sp)
                    }
                }

                if (mainCategoria == "General") {
                    Spacer(modifier = Modifier.height(12.dp))
                    ExposedDropdownMenuBox(
                        expanded = expandedGeneralCat,
                        onExpandedChange = { expandedGeneralCat = !expandedGeneralCat }
                    ) {
                        OutlinedTextField(
                            value = categoria,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Tipo de Célula General") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedGeneralCat) },
                            modifier = Modifier.menuAnchor().fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                        ExposedDropdownMenu(
                            expanded = expandedGeneralCat,
                            onDismissRequest = { expandedGeneralCat = false }
                        ) {
                            listOf("Evangelística", "Discipulado").forEach { cat ->
                                DropdownMenuItem(
                                    text = { Text(cat) },
                                    onClick = {
                                        categoria = cat
                                        expandedGeneralCat = false
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                
                Text("Compañero de Liderazgo (Opcional)", fontWeight = FontWeight.Bold, color = Color(0xFF374151))
                Spacer(modifier = Modifier.height(8.dp))
                
                ExposedDropdownMenuBox(
                    expanded = expandedColideres,
                    onExpandedChange = { expandedColideres = !expandedColideres }
                ) {
                    OutlinedTextField(
                        value = selectedColider?.nombre_completo ?: "Ninguno",
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedColideres) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    ExposedDropdownMenu(
                        expanded = expandedColideres,
                        onDismissRequest = { expandedColideres = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Ninguno", color = Color.Gray) },
                            onClick = {
                                selectedColider = null
                                expandedColideres = false
                            }
                        )
                        colideres.forEach { c ->
                            DropdownMenuItem(
                                text = { Text(c.nombre_completo) },
                                onClick = {
                                    selectedColider = c
                                    expandedColideres = false
                                }
                            )
                        }
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = {
                if (currentUser == null) return@Button
                isLoading = true
                scope.launch {
                    try {
                        // Si no eligió fecha, por defecto la de hoy
                        val finalFecha = fechaApertura?.let { 
                            java.time.OffsetDateTime.of(it.atTime(0, 0), java.time.ZoneOffset.UTC).toString()
                        } ?: java.time.OffsetDateTime.now().toString()

                        val newCelula = Celula(
                            id = UUID.randomUUID().toString(),
                            lider_id = currentUser.id,
                            equipo_id = miEquipoId,
                            colider_id = selectedColider?.id,
                            lideres_adicionales = selectedColider?.nombre_completo ?: "",
                            zona = if (selectedZona != null) "Zona ${selectedZona?.numero_zona}" else "",
                            direccion = direccion,
                            categoria = categoria,
                            fecha_apertura = finalFecha
                        )
                        Supabase.client.from("celulas").insert(newCelula)
                        onCelulaCreada(newCelula)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    } finally {
                        isLoading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF007F7F)),
            enabled = !isLoading && selectedZona != null && direccion.isNotBlank()
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
            } else {
                Text("Registrar Célula", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CelugramaForm(celulaActual: Celula, modifier: Modifier = Modifier) {
    var ofrenda by remember { mutableStateOf("") }
    
    // Meeting data
    var usoBosquejo by remember { mutableStateOf(false) }
    var temaSemanal by remember { mutableStateOf("Cargando...") }
    var versiculoSemanal by remember { mutableStateOf("Cargando...") }
    var bosquejoId by remember { mutableStateOf<String?>(null) }
    
    var temaManual by remember { mutableStateOf("") }
    var versiculoManual by remember { mutableStateOf("") }

    val scope = rememberCoroutineScope()
    val currentUser = Supabase.client.auth.currentUserOrNull()

    LaunchedEffect(usoBosquejo) {
        if (usoBosquejo && temaSemanal == "Cargando...") {
            scope.launch {
                try {
                    val tipoBuscado = if (celulaActual.categoria?.contains("Evangelística", ignoreCase = true) == true) "evangelistico" 
                                      else if (celulaActual.categoria?.contains("Discipulado", ignoreCase = true) == true) "discipulado" 
                                      else ""
                    val latestBosquejos = Supabase.client.from("bosquejos")
                        .select {
                            if (tipoBuscado.isNotEmpty()) {
                                filter { eq("tipo", tipoBuscado) }
                            }
                            order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                            limit(1)
                        }
                        .decodeList<Bosquejo>()

                    if (latestBosquejos.isNotEmpty()) {
                        temaSemanal = latestBosquejos.first().titulo
                        versiculoSemanal = latestBosquejos.first().versiculo_base
                        bosquejoId = latestBosquejos.first().id
                    } else {
                        temaSemanal = "No hay bosquejos disponibles"
                        versiculoSemanal = "-"
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                    temaSemanal = "Error al cargar"
                    versiculoSemanal = "-"
                }
            }
        }
    }

    var discipulos by remember { mutableStateOf<List<AsistenteCelula>>(emptyList()) }
    val checkedState = remember { mutableStateMapOf<String, Boolean>() }
    var showAddDialog by remember { mutableStateOf(false) }
    var isLoadingEnvio by remember { mutableStateOf(false) }

    fun refreshDiscipulos() {
        if (currentUser != null) {
            scope.launch {
                try {
                    val fetched = Supabase.client.from("asistentes_celula")
                        .select { filter { eq("lider_id", currentUser.id) } }
                        .decodeList<AsistenteCelula>()
                    discipulos = fetched
                    // By default, everyone is unchecked initially, or we leave whatever state is there
                    fetched.forEach { 
                        if (!checkedState.containsKey(it.id)) {
                            checkedState[it.id] = false 
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshDiscipulos()
    }

    val context = androidx.compose.ui.platform.LocalContext.current
    fun enviarCelugrama() {
        if (currentUser == null) return
        scope.launch {
            isLoadingEnvio = true
            try {
                // Determine total attendance
                val attendedIds = checkedState.filter { it.value }.keys.toList()
                val totalAsistencia = attendedIds.size

                // Determine total attendance

                // Create Informe
                val informe = InformeInsert(
                    lider_id = currentUser.id,
                    lider_celula_id = currentUser.id,
                    nombre_celula = celulaActual.zona ?: "Célula App",
                    lugar = celulaActual.direccion ?: "Asignado",
                    estado = "enviado",
                    fecha_reunion = java.time.OffsetDateTime.now().toString(),
                    nuevos_convertidos = 0,
                    visitas = 0,
                    asistencia_total = totalAsistencia,
                    ofrenda = ofrenda.toDoubleOrNull(),
                    uso_bosquejo = usoBosquejo,
                    bosquejo_id = if (usoBosquejo) bosquejoId else null,
                    tema_manual = if (!usoBosquejo) temaManual else null,
                    versiculo_manual = if (!usoBosquejo) versiculoManual else null,
                    asistentes = emptyList(),
                    tema_tratado = if (usoBosquejo) "Bosquejo Semanal" else (temaManual.takeIf { it.isNotBlank() } ?: "Tema General")
                )
                
                
                // We need the inserted ID to link the attendance
                val inserted = Supabase.client.from("informes_celula")
                    .insert(informe) { select() }
                    .decodeSingle<InformeResponse>()
                
                // Insert individual attendance
                attendedIds.forEach { asId ->
                    val asistRecord = AsistenciaReunion(
                        informe_id = inserted.id,
                        asistente_id = asId,
                        asistio = true,
                        created_at = java.time.OffsetDateTime.now().toString()
                    )
                    Supabase.client.from("asistencia_reunion").insert(asistRecord)
                }
                
                // Reset form
                ofrenda = ""
                temaManual = ""
                versiculoManual = ""
                checkedState.keys.forEach { checkedState[it] = false }
                
                android.widget.Toast.makeText(
                    context,
                    "¡Reporte enviado exitosamente!",
                    android.widget.Toast.LENGTH_SHORT
                ).show()
                
            } catch (e: Exception) {
                e.printStackTrace()
                android.widget.Toast.makeText(
                    context,
                    "Error al enviar: ${e.message}",
                    android.widget.Toast.LENGTH_LONG
                ).show()
            } finally {
                isLoadingEnvio = false
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
        Text("Celugrama", fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF004D40))
        Text("Reporte semanal de tu célula", fontSize = 16.sp, color = Color(0xFF6B7280))

        Spacer(modifier = Modifier.height(24.dp))

        // Tarjeta de Datos Generales
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Datos Generales", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF1F2937))
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = ofrenda,
                    onValueChange = { ofrenda = it },
                    label = { Text("Ofrenda Recaudada") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                HorizontalDivider(color = Color(0xFFE5E7EB))
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = usoBosquejo,
                        onCheckedChange = { usoBosquejo = it },
                        colors = CheckboxDefaults.colors(checkedColor = Color(0xFF007F7F))
                    )
                    Text("¿Usó el bosquejo semanal?", fontWeight = FontWeight.Medium, color = Color(0xFF374151))
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                if (usoBosquejo) {
                    OutlinedTextField(
                        value = temaSemanal,
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("Tema") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = versiculoSemanal,
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("Versículo") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                } else {
                    OutlinedTextField(
                        value = temaManual,
                        onValueChange = { temaManual = it },
                        label = { Text("Tema Manual") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = versiculoManual,
                        onValueChange = { versiculoManual = it },
                        label = { Text("Versículo Manual") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Lista de Asistentes Interactiva
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Asistencia (${checkedState.values.count { it }})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1F2937))
            IconButton(
                onClick = { showAddDialog = true },
                colors = IconButtonDefaults.iconButtonColors(containerColor = Color(0xFF007F7F))
            ) {
                Icon(Icons.Default.Add, contentDescription = "Agregar asistente", tint = Color.White)
            }
        }
        
        Text("Marca quiénes asistieron a esta reunión.", fontSize = 14.sp, color = Color.Gray)
        Spacer(modifier = Modifier.height(8.dp))

        if (discipulos.isEmpty()) {
            Text("No tienes discípulos registrados.", color = Color.Gray, modifier = Modifier.padding(vertical = 16.dp))
        } else {
            discipulos.forEach { asistente ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable { checkedState[asistente.id] = !(checkedState[asistente.id] ?: false) },
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = checkedState[asistente.id] ?: false,
                            onCheckedChange = { checkedState[asistente.id] = it },
                            colors = CheckboxDefaults.colors(checkedColor = Color(0xFF007F7F))
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(asistente.nombre, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("C.I: ${asistente.cedula}", color = Color.Gray, fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = { enviarCelugrama() },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF007F7F)),
            enabled = !isLoadingEnvio
        ) {
            if (isLoadingEnvio) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
            } else {
                Text("Enviar Celugrama", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }

    if (showAddDialog) {
        AddAsistenteDialog(
            categoriaCelula = celulaActual.categoria ?: "General",
            onDismiss = { showAddDialog = false },
            onAdd = { 
                scope.launch {
                    try {
                        Supabase.client.from("asistentes_celula").insert(it)
                        refreshDiscipulos()
                        checkedState[it.id] = true // Mark as attended automatically
                        showAddDialog = false
                    } catch(e: Exception) {
                        e.printStackTrace()
                    }
                }
            },
            currentUser = currentUser?.id
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DatosCelulaForm(celula: Celula, onSaved: (Celula) -> Unit, modifier: Modifier = Modifier) {
    var dia by remember { mutableStateOf(celula.dia_reunion ?: "") }
    var hora by remember { mutableStateOf(celula.hora_reunion ?: "") }
    var red by remember { mutableStateOf(celula.red ?: "") }
    var lideresAdicionales by remember { mutableStateOf(celula.lideres_adicionales ?: "") }
    var cumpleanos by remember { mutableStateOf(celula.fecha_cumpleanos ?: "") }
    var aniversario by remember { mutableStateOf(celula.fecha_aniversario ?: "") }
    var vacaciones by remember { mutableStateOf(celula.vacaciones ?: "") }
    
    var isSaving by remember { mutableStateOf(false) }
    var showSuccess by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current

    val diasList = listOf("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")
    var expandedDias by remember { mutableStateOf(false) }

    var expandedRedes by remember { mutableStateOf(false) }
    var redesList by remember { mutableStateOf<List<Red>>(emptyList()) }

    LaunchedEffect(Unit) {
        try {
            redesList = Supabase.client.from("redes").select().decodeList<Red>()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(androidx.compose.ui.graphics.Brush.verticalGradient(
                colors = listOf(Color(0xFFF3F4F6), Color.White)
            ))
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text("Información Fija de Célula", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF004D40))
        Spacer(modifier = Modifier.height(16.dp))

        // Dia Selector
        ExposedDropdownMenuBox(
            expanded = expandedDias,
            onExpandedChange = { expandedDias = !expandedDias }
        ) {
            OutlinedTextField(
                value = dia,
                onValueChange = {},
                readOnly = true,
                label = { Text("Día de la Reunión") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDias) },
                modifier = Modifier.menuAnchor().fillMaxWidth(),
                singleLine = true
            )
            ExposedDropdownMenu(
                expanded = expandedDias,
                onDismissRequest = { expandedDias = false }
            ) {
                diasList.forEach { d ->
                    DropdownMenuItem(
                        text = { Text(d) },
                        onClick = {
                            dia = d
                            expandedDias = false
                        }
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        
        // Hora Selector
        OutlinedTextField(
            value = hora,
            onValueChange = {},
            readOnly = true,
            label = { Text("Hora de la Reunión") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            trailingIcon = {
                IconButton(onClick = {
                    val c = java.util.Calendar.getInstance()
                    val h = c.get(java.util.Calendar.HOUR_OF_DAY)
                    val m = c.get(java.util.Calendar.MINUTE)
                    android.app.TimePickerDialog(context, { _, hourOfDay, minute ->
                        val amPm = if (hourOfDay >= 12) "PM" else "AM"
                        val hFormat = if (hourOfDay % 12 == 0) 12 else hourOfDay % 12
                        val mFormat = String.format("%02d", minute)
                        hora = "$hFormat:$mFormat $amPm"
                    }, h, m, false).show()
                }) {
                    Icon(Icons.Default.Add, contentDescription = "Seleccionar Hora") // Using Add icon as a generic fallback since Time icon might not be imported.
                }
            }
        )
        Spacer(modifier = Modifier.height(8.dp))
        
        // Red Selector
        ExposedDropdownMenuBox(
            expanded = expandedRedes,
            onExpandedChange = { expandedRedes = !expandedRedes }
        ) {
            OutlinedTextField(
                value = red,
                onValueChange = {},
                readOnly = true,
                label = { Text("Red") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedRedes) },
                modifier = Modifier.menuAnchor().fillMaxWidth(),
                singleLine = true
            )
            ExposedDropdownMenu(
                expanded = expandedRedes,
                onDismissRequest = { expandedRedes = false }
            ) {
                redesList.forEach { r ->
                    DropdownMenuItem(
                        text = { Text(r.nombre) },
                        onClick = {
                            red = r.nombre
                            expandedRedes = false
                        }
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(16.dp))

        Text("Compañero de Liderazgo", fontWeight = FontWeight.Bold, color = Color(0xFF374151))
        OutlinedTextField(
            value = lideresAdicionales,
            onValueChange = {},
            readOnly = true,
            label = { Text("Asignado en Apertura") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))

        Text("Fechas Especiales del Líder", fontWeight = FontWeight.Bold, color = Color(0xFF374151))
        OutlinedTextField(
            value = cumpleanos,
            onValueChange = {},
            readOnly = true,
            label = { Text("Cumpleaños") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            trailingIcon = {
                IconButton(onClick = {
                    val c = java.util.Calendar.getInstance()
                    android.app.DatePickerDialog(context, { _, y, m, d ->
                        cumpleanos = java.time.LocalDate.of(y, m + 1, d).toString()
                    }, c.get(java.util.Calendar.YEAR), c.get(java.util.Calendar.MONTH), c.get(java.util.Calendar.DAY_OF_MONTH)).show()
                }) {
                    Icon(Icons.Default.ArrowDropDown, contentDescription = "Seleccionar Fecha")
                }
            }
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = aniversario,
            onValueChange = {},
            readOnly = true,
            label = { Text("Aniversario") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            trailingIcon = {
                IconButton(onClick = {
                    val c = java.util.Calendar.getInstance()
                    android.app.DatePickerDialog(context, { _, y, m, d ->
                        aniversario = java.time.LocalDate.of(y, m + 1, d).toString()
                    }, c.get(java.util.Calendar.YEAR), c.get(java.util.Calendar.MONTH), c.get(java.util.Calendar.DAY_OF_MONTH)).show()
                }) {
                    Icon(Icons.Default.ArrowDropDown, contentDescription = "Seleccionar Fecha")
                }
            }
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = vacaciones,
            onValueChange = {},
            readOnly = true,
            label = { Text("Vacaciones (Fecha)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            trailingIcon = {
                IconButton(onClick = {
                    val c = java.util.Calendar.getInstance()
                    android.app.DatePickerDialog(context, { _, y, m, d ->
                        vacaciones = java.time.LocalDate.of(y, m + 1, d).toString()
                    }, c.get(java.util.Calendar.YEAR), c.get(java.util.Calendar.MONTH), c.get(java.util.Calendar.DAY_OF_MONTH)).show()
                }) {
                    Icon(Icons.Default.ArrowDropDown, contentDescription = "Seleccionar Fecha")
                }
            }
        )

        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = {
                scope.launch {
                    isSaving = true
                    try {
                        val updatedCelula = celula.copy(
                            dia_reunion = dia,
                            hora_reunion = hora,
                            red = red,
                            lideres_adicionales = lideresAdicionales,
                            fecha_cumpleanos = cumpleanos,
                            fecha_aniversario = aniversario,
                            vacaciones = vacaciones
                        )
                        Supabase.client.from("celulas").update(updatedCelula) {
                            filter { eq("id", celula.id) }
                        }
                        onSaved(updatedCelula)
                        showSuccess = true
                    } catch (e: Exception) {
                        e.printStackTrace()
                    } finally {
                        isSaving = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00796B)),
            enabled = !isSaving
        ) {
            Text(if (isSaving) "Guardando..." else "Guardar Datos")
        }

        if (showSuccess) {
            Spacer(modifier = Modifier.height(16.dp))
            Text("¡Datos guardados con éxito!", color = Color(0xFF059669), fontWeight = FontWeight.Bold)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddAsistenteDialog(
    categoriaCelula: String,
    onDismiss: () -> Unit,
    onAdd: (AsistenteCelula) -> Unit,
    currentUser: String?
) {
    var nombre by remember { mutableStateOf("") }
    var cedula by remember { mutableStateOf("") }
    var sexo by remember { mutableStateOf("M") }
    var telefono by remember { mutableStateOf("") }
    var direccion by remember { mutableStateOf("") }
    
    var fechaNacimiento by remember { mutableStateOf("") }
    var edadCalculada by remember { mutableStateOf<Int?>(null) }
    val context = androidx.compose.ui.platform.LocalContext.current
    
    // Formación y Crecimiento
    val growthLevels = remember { androidx.compose.runtime.mutableStateListOf(*Array(16) { false }) }

    LaunchedEffect(fechaNacimiento) {
        try {
            val formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")
            val birthDate = LocalDate.parse(fechaNacimiento, formatter)
            edadCalculada = Period.between(birthDate, LocalDate.now()).years
        } catch (e: DateTimeParseException) {
            edadCalculada = null
        }
    }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nuevo Discípulo") },
        text = {
            Column(modifier = Modifier.heightIn(max = 400.dp).verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = nombre,
                    onValueChange = { nombre = it },
                    label = { Text("Nombre Completo") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = cedula,
                    onValueChange = { cedula = it },
                    label = { Text("Cédula o Pasaporte") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = telefono,
                    onValueChange = { telefono = it },
                    label = { Text("Teléfono / WhatsApp") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = fechaNacimiento,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Nacimiento") },
                    supportingText = { Text(if (edadCalculada != null) "Edad: $edadCalculada años" else "") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        IconButton(onClick = {
                            val c = java.util.Calendar.getInstance()
                            android.app.DatePickerDialog(context, { _, y, m, d ->
                                val date = java.time.LocalDate.of(y, m + 1, d)
                                val formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")
                                fechaNacimiento = date.format(formatter)
                            }, c.get(java.util.Calendar.YEAR), c.get(java.util.Calendar.MONTH), c.get(java.util.Calendar.DAY_OF_MONTH)).show()
                        }) {
                            Icon(Icons.Default.ArrowDropDown, contentDescription = "Seleccionar Fecha")
                        }
                    }
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = direccion,
                    onValueChange = { direccion = it },
                    label = { Text("Dirección") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                if (categoriaCelula == "Niños") {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Sexo", fontWeight = FontWeight.Bold)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(selected = sexo == "M", onClick = { sexo = "M" })
                        Text("Masculino")
                        Spacer(modifier = Modifier.width(16.dp))
                        RadioButton(selected = sexo == "F", onClick = { sexo = "F" })
                        Text("Femenino")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                Text("Formación y Liderazgo", fontWeight = FontWeight.Bold, color = Color(0xFF00796B))
                Spacer(modifier = Modifier.height(8.dp))
                
                val orderedLabels = listOf(
                    "Libro de Juan", "Pre-TCD Meta 1", "Tiempo con Dios", "Pos-TCD Meta 2", "Bautismo", "Discipulado #1",
                    "Módulo #1 Esc. Líderes", "Seminario Visión y Misión", "Módulo #2 Esc. Líderes", "Seminario Servicio y Lid",
                    "Módulo #3", "Lanzamiento", "Pos Lanz. Apertura Célula", "Graduado", "Dirige Célula Evangelística", "Dirige Célula de Discipulado"
                )

                orderedLabels.forEachIndexed { index, label ->
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                        Checkbox(
                            checked = growthLevels[index],
                            onCheckedChange = { checked ->
                                if (index >= 14) {
                                    growthLevels[index] = checked
                                } else {
                                    if (checked) {
                                        for (i in 0..index) growthLevels[i] = true
                                    } else {
                                        for (i in index..13) growthLevels[i] = false
                                    }
                                }
                            }
                        )
                        Text(label, fontSize = 14.sp)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (nombre.isNotBlank() && currentUser != null) {
                        onAdd(AsistenteCelula(
                            id = UUID.randomUUID().toString(),
                            nombre = nombre,
                            cedula = cedula,
                            telefono = telefono,
                            whatsapp = telefono,
                            fecha_nacimiento = fechaNacimiento,
                            edad = edadCalculada,
                            sexo = if (categoriaCelula == "Niños") sexo else null,
                            direccion = direccion,
                            lider_id = currentUser,
                            libro_juan = growthLevels[0],
                            pre_tcd_1 = growthLevels[1],
                            tiempo_con_dios = growthLevels[2],
                            pos_tcd_2 = growthLevels[3],
                            bautismo = growthLevels[4],
                            discipulado_1 = growthLevels[5],
                            modulo_1_escuela = growthLevels[6],
                            seminario_vision = growthLevels[7],
                            modulo_2_escuela = growthLevels[8],
                            seminario_servicio = growthLevels[9],
                            modulo_3 = growthLevels[10],
                            lanzamiento = growthLevels[11],
                            pos_lanzamiento = growthLevels[12],
                            graduado = growthLevels[13],
                            dirige_evangelistica = growthLevels[14],
                            dirige_discipulado = growthLevels[15]
                        ))
                    }
                }
            ) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}
