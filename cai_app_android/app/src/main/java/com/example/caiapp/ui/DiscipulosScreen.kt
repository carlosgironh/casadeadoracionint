package com.example.caiapp.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material.icons.rounded.KeyboardArrowUp
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.caiapp.data.AsistenteCelula
import com.example.caiapp.data.Supabase
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiscipulosScreen(onBackClick: () -> Unit) {
    var discipulos by remember { mutableStateOf<List<AsistenteCelula>>(emptyList()) }
    var categoriaCelula by remember { mutableStateOf("General") }
    var isLoading by remember { mutableStateOf(true) }
    var discipuloToEdit by remember { mutableStateOf<AsistenteCelula?>(null) }
    val scope = rememberCoroutineScope()

    fun loadDiscipulos() {
        scope.launch {
            try {
                val currentUser = Supabase.client.auth.currentUserOrNull()
                if (currentUser != null) {
                    val celulas = Supabase.client.from("celulas")
                        .select { filter { eq("lider_id", currentUser.id) } }
                        .decodeList<com.example.caiapp.data.Celula>()
                    
                    if (celulas.isNotEmpty()) {
                        categoriaCelula = celulas.first().categoria ?: "General"
                    }

                    discipulos = Supabase.client.from("asistentes_celula")
                        .select {
                            filter { eq("lider_id", currentUser.id) }
                        }
                        .decodeList<AsistenteCelula>()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        loadDiscipulos()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mis Discípulos", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Regresar", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF004D40))
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF9FAFB))
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            // Resumen Card
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF007F7F)),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Total Registrados", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
                    Text("${discipulos.size}", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.ExtraBold)
                }
            }

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF007F7F))
                }
            } else if (discipulos.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No hay discípulos registrados.", color = Color.Gray)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(discipulos, key = { it.id }) { discipulo ->
                        DiscipuloExpandableCard(
                            discipulo = discipulo,
                            categoriaCelula = categoriaCelula,
                            onUpdate = { updatesMap ->
                                scope.launch {
                                    try {
                                        val currentUser = Supabase.client.auth.currentUserOrNull()
                                        val jsonElements = updatesMap.mapValues { kotlinx.serialization.json.JsonPrimitive(it.value) }
                                        val updates = kotlinx.serialization.json.JsonObject(jsonElements)
                                        Supabase.client.from("asistentes_celula")
                                            .update(updates) {
                                                filter { eq("id", discipulo.id) }
                                            }
                                        // Refresh list
                                        if (currentUser != null) {
                                            discipulos = Supabase.client.from("asistentes_celula")
                                                .select {
                                                    filter { eq("lider_id", currentUser.id) }
                                                }
                                                .decodeList<AsistenteCelula>()
                                        }
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                    }
                                }
                            },
                            onEditClick = { discipuloToEdit = discipulo }
                        )
                    }
                }
            }
        }
    }

    discipuloToEdit?.let { discipulo ->
        EditAsistenteDialog(
            discipulo = discipulo,
            categoriaCelula = categoriaCelula,
            onDismiss = { discipuloToEdit = null },
            onSave = { updatesMap ->
                scope.launch {
                    try {
                        val currentUser = Supabase.client.auth.currentUserOrNull()
                        val jsonElements = updatesMap.mapValues { 
                            val v = it.value
                            if (v is Boolean) kotlinx.serialization.json.JsonPrimitive(v as Boolean)
                            else if (v is Number) kotlinx.serialization.json.JsonPrimitive(v as Number)
                            else kotlinx.serialization.json.JsonPrimitive(v.toString())
                        }
                        val updates = kotlinx.serialization.json.JsonObject(jsonElements)
                        Supabase.client.from("asistentes_celula")
                            .update(updates) {
                                filter { eq("id", discipulo.id) }
                            }
                        discipuloToEdit = null
                        if (currentUser != null) {
                            discipulos = Supabase.client.from("asistentes_celula")
                                .select { filter { eq("lider_id", currentUser.id) } }
                                .decodeList<AsistenteCelula>()
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        )
    }
}

@Composable
fun DiscipuloExpandableCard(discipulo: AsistenteCelula, categoriaCelula: String, onUpdate: (Map<String, Boolean>) -> Unit, onEditClick: () -> Unit = {}) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth().clickable { expanded = !expanded }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(Color(0xFFE0F7FA), RoundedCornerShape(24.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Rounded.Person, contentDescription = null, tint = Color(0xFF007F7F))
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = discipulo.nombre, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1F2937))
                    if (!discipulo.telefono.isNullOrBlank()) {
                        Text(text = "Tel: ${discipulo.telefono}", fontSize = 14.sp, color = Color.Gray)
                    }
                    if (!discipulo.direccion.isNullOrBlank()) {
                        Text(text = "${discipulo.direccion}", fontSize = 12.sp, color = Color.Gray)
                    }
                }
                Icon(
                    imageVector = if (expanded) Icons.Rounded.KeyboardArrowUp else Icons.Rounded.KeyboardArrowDown,
                    contentDescription = "Expandir",
                    tint = Color.Gray
                )
                IconButton(onClick = onEditClick) {
                    Icon(Icons.Filled.Edit, contentDescription = "Editar", tint = Color(0xFF007F7F))
                }
            }

            AnimatedVisibility(visible = expanded) {
                Column(modifier = Modifier.padding(top = 16.dp)) {
                    HorizontalDivider(color = Color(0xFFE5E7EB))
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    if (categoriaCelula == "Niños") {
                        Text("Edad: ${discipulo.edad ?: "N/A"}", fontSize = 14.sp)
                        Text("Sexo: ${discipulo.sexo ?: "N/A"}", fontSize = 14.sp)
                    } else {
                        Text("Escalera de Crecimiento", fontWeight = FontWeight.Bold, color = Color(0xFF004D40))
                        Spacer(modifier = Modifier.height(8.dp))

                        val orderedFields = listOf(
                            "libro_juan", "pre_tcd_1", "tiempo_con_dios", "pos_tcd_2", "bautismo", "discipulado_1",
                            "modulo_1_escuela", "seminario_vision", "modulo_2_escuela", "seminario_servicio",
                            "modulo_3", "lanzamiento", "pos_lanzamiento", "graduado", "dirige_evangelistica", "dirige_discipulado"
                        )
                        val orderedLabels = listOf(
                            "Libro de Juan", "Pre-TCD Meta 1", "Tiempo con Dios", "Pos-TCD Meta 2", "Bautismo", "Discipulado #1",
                            "Módulo #1 Esc. Líderes", "Seminario Visión y Misión", "Módulo #2 Esc. Líderes", "Seminario Servicio y Lid",
                            "Módulo #3", "Lanzamiento", "Pos Lanz. Apertura Célula", "Graduado", "Dirige Célula Evangelística", "Dirige Célula de Discipulado"
                        )
                        val orderedValues = listOf(
                            discipulo.libro_juan, discipulo.pre_tcd_1, discipulo.tiempo_con_dios, discipulo.pos_tcd_2, discipulo.bautismo, discipulo.discipulado_1,
                            discipulo.modulo_1_escuela, discipulo.seminario_vision, discipulo.modulo_2_escuela, discipulo.seminario_servicio,
                            discipulo.modulo_3, discipulo.lanzamiento, discipulo.pos_lanzamiento, discipulo.graduado, discipulo.dirige_evangelistica, discipulo.dirige_discipulado
                        )

                        orderedLabels.forEachIndexed { index, label ->
                            GrowthSwitch(label, orderedValues[index]) { checked ->
                                val updates = mutableMapOf<String, Boolean>()
                                if (index >= 14) {
                                    updates[orderedFields[index]] = checked
                                } else {
                                    if (checked) {
                                        for (i in 0..index) updates[orderedFields[i]] = true
                                    } else {
                                        for (i in index..13) updates[orderedFields[i]] = false
                                    }
                                }
                                onUpdate(updates)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun GrowthSwitch(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, fontSize = 14.sp, color = Color(0xFF374151))
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = Color(0xFF007F7F)
            )
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditAsistenteDialog(
    discipulo: AsistenteCelula,
    categoriaCelula: String,
    onDismiss: () -> Unit,
    onSave: (Map<String, Any>) -> Unit
) {
    var nombre by remember { mutableStateOf(discipulo.nombre) }
    var cedula by remember { mutableStateOf(discipulo.cedula) }
    var sexo by remember { mutableStateOf(discipulo.sexo ?: "M") }
    var telefono by remember { mutableStateOf(discipulo.telefono ?: "") }
    var direccion by remember { mutableStateOf(discipulo.direccion ?: "") }
    var fechaNacimiento by remember { mutableStateOf(discipulo.fecha_nacimiento ?: "") }
    var edadCalculada by remember { mutableStateOf<Int?>(null) }
    val context = androidx.compose.ui.platform.LocalContext.current

    val growthLevels = remember { 
        androidx.compose.runtime.mutableStateListOf(
            discipulo.libro_juan, discipulo.pre_tcd_1, discipulo.tiempo_con_dios, discipulo.pos_tcd_2,
            discipulo.bautismo, discipulo.discipulado_1, discipulo.modulo_1_escuela, discipulo.seminario_vision,
            discipulo.modulo_2_escuela, discipulo.seminario_servicio, discipulo.modulo_3, discipulo.lanzamiento,
            discipulo.pos_lanzamiento, discipulo.graduado, discipulo.dirige_evangelistica, discipulo.dirige_discipulado
        ) 
    }

    LaunchedEffect(fechaNacimiento) {
        try {
            val formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")
            val birthDate = java.time.LocalDate.parse(fechaNacimiento, formatter)
            edadCalculada = java.time.Period.between(birthDate, java.time.LocalDate.now()).years
        } catch (e: java.time.format.DateTimeParseException) {
            edadCalculada = null
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Editar Discípulo") },
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
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.ui.text.input.KeyboardType.Phone),
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
                            Icon(Icons.Filled.ArrowDropDown, contentDescription = "Seleccionar Fecha")
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
                                        for (i in index until 14) growthLevels[i] = false
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
                    if (nombre.isNotBlank()) {
                        onSave(mapOf(
                            "nombre" to nombre,
                            "cedula" to cedula,
                            "telefono" to telefono,
                            "direccion" to direccion,
                            "fecha_nacimiento" to fechaNacimiento,
                            "sexo" to sexo,
                            "libro_juan" to growthLevels[0],
                            "pre_tcd_1" to growthLevels[1],
                            "tiempo_con_dios" to growthLevels[2],
                            "pos_tcd_2" to growthLevels[3],
                            "bautismo" to growthLevels[4],
                            "discipulado_1" to growthLevels[5],
                            "modulo_1_escuela" to growthLevels[6],
                            "seminario_vision" to growthLevels[7],
                            "modulo_2_escuela" to growthLevels[8],
                            "seminario_servicio" to growthLevels[9],
                            "modulo_3" to growthLevels[10],
                            "lanzamiento" to growthLevels[11],
                            "pos_lanzamiento" to growthLevels[12],
                            "graduado" to growthLevels[13],
                            "dirige_evangelistica" to growthLevels[14],
                            "dirige_discipulado" to growthLevels[15]
                        ))
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00796B))
            ) {
                Text("Guardar Cambios")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar", color = Color.Gray)
            }
        }
    )
}
