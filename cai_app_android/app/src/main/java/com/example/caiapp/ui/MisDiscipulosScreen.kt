package com.example.caiapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.caiapp.data.AsistenteCelula
import com.example.caiapp.data.Notificacion
import com.example.caiapp.data.Supabase
import com.example.caiapp.data.CelulaUpdate
import com.example.caiapp.ui.NotificacionInsert
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

import com.example.caiapp.data.Usuario
import com.example.caiapp.data.Celula

@kotlinx.serialization.Serializable
data class AprobarUpdate(val pendiente_aprobacion: Boolean)



@Composable
fun MisDiscipulosScreen(modifier: Modifier = Modifier) {
    val context = androidx.compose.ui.platform.LocalContext.current
    var discipulos by remember { mutableStateOf<List<AsistenteCelula>>(emptyList()) }
    var lideresFormacion by remember { mutableStateOf<List<Usuario>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var showAddDialog by remember { mutableStateOf(false) }
    var cedulaToClaim by remember { mutableStateOf("") }
    var expandLideres by remember { mutableStateOf(true) }
    var expandDiscipulos by remember { mutableStateOf(true) }
    var expandEquipos by remember { mutableStateOf(true) }
    var equiposBajoCargo by remember { mutableStateOf<List<Celula>>(emptyList()) }
    var showReasignarDialog by remember { mutableStateOf(false) }
    var celulaToReassign by remember { mutableStateOf<Celula?>(null) }
    var newLiderIdToReassign by remember { mutableStateOf<String?>("") }
    var newColiderIdToReassign by remember { mutableStateOf<String?>("") }
    
    var usuarioToEdit by remember { mutableStateOf<Usuario?>(null) }
    var discipuloToEdit by remember { mutableStateOf<AsistenteCelula?>(null) }
    val scope = rememberCoroutineScope()
    
    val currentUser = Supabase.client.auth.currentUserOrNull()

    fun fetchDiscipulos() {
        if (currentUser == null) return
        scope.launch {
            isLoading = true
            try {
                val miUsuario = Supabase.client.from("usuarios")
                    .select { filter { eq("id", currentUser.id) } }
                    .decodeSingleOrNull<Usuario>()
                
                val miEquipoId = miUsuario?.equipo_id

                val fetchedDiscipulos = Supabase.client.from("asistentes_celula")
                    .select {
                        filter {
                            eq("lider_id", currentUser.id)
                        }
                    }
                    .decodeList<AsistenteCelula>()
                    
                val fetchedLideres = Supabase.client.from("usuarios")
                    .select {
                        filter {
                            if (miEquipoId != null) {
                                eq("equipo_lider_id", miEquipoId)
                            } else {
                                eq("lider_directo_id", currentUser.id)
                            }
                        }
                    }
                    .decodeList<Usuario>()

                val fetchedLideresIds = fetchedLideres.map { it.id }
                val fetchedEquipos = if (fetchedLideresIds.isNotEmpty()) {
                    Supabase.client.from("celulas")
                        .select {
                            filter {
                                isIn("lider_id", fetchedLideresIds)
                            }
                        }
                        .decodeList<Celula>()
                } else {
                    emptyList()
                }
                    
                discipulos = fetchedDiscipulos
                lideresFormacion = fetchedLideres
                equiposBajoCargo = fetchedEquipos
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        fetchDiscipulos()
    }

    fun reclamarDiscipulo(cedula: String) {
        if (currentUser == null || cedula.isBlank()) return
        scope.launch {
            try {
                // Check if disciple exists
                val results = Supabase.client.from("asistentes_celula")
                    .select { filter { eq("cedula", cedula) } }
                    .decodeList<AsistenteCelula>()
                
                if (results.isNotEmpty()) {
                    val discipulo = results.first()
                    // Reclaim if belongs to another
                    if (discipulo.lider_id != currentUser.id) {
                        Supabase.client.from("asistentes_celula")
                            .update(mapOf("lider_id" to currentUser.id)) {
                                filter { eq("id", discipulo.id) }
                            }
                        
                        // Send notification to previous leader
                        if (discipulo.lider_id != null) {
                            val msg = "El líder actual ha trasladado a ${discipulo.nombre} a su célula."
                            Supabase.client.from("notificaciones")
                                .insert(mapOf(
                                    "usuario_id" to discipulo.lider_id,
                                    "mensaje" to msg
                                ))
                        }
                    }
                } else {
                    // Create new empty if not found? Better let them create in Celugrama.
                }
                showAddDialog = false
                fetchDiscipulos()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun aprobarLider(liderId: String) {
        scope.launch {
            try {
                Supabase.client.from("usuarios")
                    .update(AprobarUpdate(pendiente_aprobacion = false)) {
                        filter { eq("id", liderId) }
                    }
                
                val msg = "¡Felicidades! Tu líder ha aprobado tu cuenta."
                Supabase.client.from("notificaciones")
                    .insert(NotificacionInsert(usuario_id = liderId, mensaje = msg))
                
                fetchDiscipulos()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun reasignarEquipo() {
        val currentUserLocal = currentUser ?: return
        val celulaId = celulaToReassign?.id ?: return
        val nuevoLiderId = if (newLiderIdToReassign == "currentUser" || newLiderIdToReassign.isNullOrBlank()) currentUserLocal.id else newLiderIdToReassign!!
        val coliderId = if (newColiderIdToReassign.isNullOrBlank()) null else newColiderIdToReassign
        val coliderNombre = lideresFormacion.find { it.id == coliderId }?.nombre_completo ?: ""

        scope.launch {
            try {
                // Utilizamos una llamada RPC para evitar que el RLS bloquee la transferencia (WITH CHECK constraint)
                @Serializable
                data class ReasignarParams(
                    val p_celula_id: String,
                    val p_nuevo_lider_id: String,
                    val p_nuevo_colider_id: String?,
                    val p_lideres_adicionales: String
                )
                Supabase.client.postgrest.rpc(
                    "reasignar_celula_bypass_rls",
                    ReasignarParams(
                        p_celula_id = celulaId,
                        p_nuevo_lider_id = nuevoLiderId,
                        p_nuevo_colider_id = coliderId,
                        p_lideres_adicionales = coliderNombre
                    )
                )
                showReasignarDialog = false
                celulaToReassign = null
                newLiderIdToReassign = ""
                newColiderIdToReassign = ""
                fetchDiscipulos()
            } catch (e: Exception) {
                e.printStackTrace()
                launch(kotlinx.coroutines.Dispatchers.Main) {
                    android.widget.Toast.makeText(context, "Error: ${e.message}", android.widget.Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Mis Discípulos", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF004D40))
                Text("Gestión de tu célula", fontSize = 14.sp, color = Color.Gray)
            }
            IconButton(
                onClick = { showAddDialog = true },
                modifier = Modifier.background(Color(0xFF0D509E), RoundedCornerShape(12.dp))
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Reclamar Discípulo", tint = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF007F7F))
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { expandLideres = !expandLideres }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "Mis Líderes en Formación",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = Color(0xFF007F7F)
                        )
                        Icon(
                            imageVector = if (expandLideres) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                            contentDescription = "Expandir/Colapsar",
                            tint = Color(0xFF007F7F)
                        )
                    }
                }
                
                if (expandLideres) {
                if (lideresFormacion.isEmpty()) {
                    item {
                        Text("No tienes líderes en formación registrados.", color = Color.Gray, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic, modifier = Modifier.padding(bottom = 16.dp))
                    }
                } else {
                    items(lideresFormacion) { lider ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF3F4F6)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Filled.Person, contentDescription = null, tint = Color(0xFF0D509E), modifier = Modifier.size(40.dp))
                                Spacer(modifier = Modifier.width(16.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(lider.nombre_completo, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1F2937))
                                    Text("Nivel: ${lider.nivel ?: 1}", fontSize = 14.sp, color = Color.Gray)
                                    if (lider.pendiente_aprobacion == true) {
                                        Text("Pendiente de Aprobación", fontSize = 12.sp, color = Color(0xFFD97706), fontWeight = FontWeight.Bold)
                                    }
                                }
                                if (lider.pendiente_aprobacion == true) {
                                    Button(
                                        onClick = { aprobarLider(lider.id) },
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00796B)),
                                        shape = RoundedCornerShape(24.dp),
                                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                                    ) {
                                        Text("Aprobar", color = Color.White, fontSize = 14.sp)
                                    }
                                }
                            }
                        }
                    }
                    item { Spacer(modifier = Modifier.height(16.dp)) }
                }
                }

                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { expandDiscipulos = !expandDiscipulos }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "Discípulos (Celugrama)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = Color(0xFF007F7F)
                        )
                        Icon(
                            imageVector = if (expandDiscipulos) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                            contentDescription = "Expandir/Colapsar",
                            tint = Color(0xFF007F7F)
                        )
                    }
                }
                
                if (expandDiscipulos) {
                if (discipulos.isEmpty()) {
                    item {
                        Text("No tienes discípulos en tu celugrama.", color = Color.Gray, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                    }
                } else {
                    items(discipulos) { discipulo ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF9FAFB)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Filled.Person, contentDescription = null, tint = Color(0xFF007F7F), modifier = Modifier.size(40.dp))
                                Spacer(modifier = Modifier.width(16.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(discipulo.nombre, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1F2937))
                                    Text("C.I: ${discipulo.cedula}", fontSize = 14.sp, color = Color.Gray)
                                }
                                IconButton(onClick = { discipuloToEdit = discipulo }) {
                                    Icon(Icons.Filled.Edit, contentDescription = "Editar", tint = Color(0xFF007F7F))
                                }
                            }
                        }
                    }
                }
                }
                
                item { Spacer(modifier = Modifier.height(16.dp)) }

                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { expandEquipos = !expandEquipos }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "Equipos a mi cargo",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = Color(0xFF007F7F)
                        )
                        Icon(
                            imageVector = if (expandEquipos) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                            contentDescription = "Expandir/Colapsar",
                            tint = Color(0xFF007F7F)
                        )
                    }
                }
                
                if (expandEquipos) {
                    if (equiposBajoCargo.isEmpty()) {
                        item {
                            Text("No tienes equipos bajo tu cargo.", color = Color.Gray, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                        }
                    } else {
                        itemsIndexed(equiposBajoCargo) { index, equipo ->
                            val liderNombre = lideresFormacion.find { it.id == equipo.lider_id }?.nombre_completo?.split(" ")?.firstOrNull() ?: "Yo"
                            val coliderNombre = lideresFormacion.find { it.id == equipo.colider_id }?.nombre_completo?.split(" ")?.firstOrNull()
                            val buttonText = if (coliderNombre != null) "$liderNombre y $coliderNombre" else liderNombre

                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF7ED)),
                                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Filled.Person, contentDescription = null, tint = Color(0xFFD97706), modifier = Modifier.size(40.dp))
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Equipo ${index + 1}", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1F2937))
                                        Text("Día: ${equipo.dia_reunion ?: "N/A"} - ${equipo.hora_reunion ?: ""}", fontSize = 14.sp, color = Color.Gray)
                                    }
                                    Button(
                                        onClick = { 
                                            celulaToReassign = equipo
                                            newLiderIdToReassign = equipo.lider_id
                                            newColiderIdToReassign = equipo.colider_id ?: ""
                                            showReasignarDialog = true 
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706)),
                                        shape = RoundedCornerShape(24.dp),
                                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                                    ) {
                                        Text(buttonText, color = Color.White, fontSize = 14.sp, maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Reclamar Discípulo", fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text("Ingresa la cédula del discípulo para agregarlo a tu célula. Si pertenece a otro líder, será trasladado automáticamente.", fontSize = 14.sp, color = Color.Gray)
                    Spacer(modifier = Modifier.height(16.dp))
                    OutlinedTextField(
                        value = cedulaToClaim,
                        onValueChange = { cedulaToClaim = it },
                        label = { Text("Cédula") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { reclamarDiscipulo(cedulaToClaim) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF007F7F))
                ) {
                    Text("Reclamar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancelar", color = Color.Gray)
                }
            }
        )
    }

    if (showReasignarDialog && celulaToReassign != null) {
        AlertDialog(
            onDismissRequest = { showReasignarDialog = false },
            title = { Text("Integrantes del Equipo", fontWeight = FontWeight.Bold) },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    Text("Selecciona al Líder Principal (obligatorio) y al Compañero de Liderazgo (opcional):", fontSize = 14.sp, color = Color.Gray)
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text("Líder Principal:", fontWeight = FontWeight.Bold, color = Color(0xFF1F2937))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(
                            selected = newLiderIdToReassign == "currentUser" || newLiderIdToReassign == currentUser?.id,
                            onClick = { newLiderIdToReassign = currentUser?.id }
                        )
                        Text("Asumir liderazgo (Yo)")
                    }
                    
                    lideresFormacion.forEach { lider ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(
                                selected = newLiderIdToReassign == lider.id,
                                onClick = { newLiderIdToReassign = lider.id }
                            )
                            Text(lider.nombre_completo)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Compañero de Liderazgo:", fontWeight = FontWeight.Bold, color = Color(0xFF1F2937))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(
                            selected = newColiderIdToReassign.isNullOrBlank(),
                            onClick = { newColiderIdToReassign = "" }
                        )
                        Text("Ninguno")
                    }
                    
                    lideresFormacion.forEach { lider ->
                        if (lider.id != newLiderIdToReassign) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                RadioButton(
                                    selected = newColiderIdToReassign == lider.id,
                                    onClick = { newColiderIdToReassign = lider.id }
                                )
                                Text(lider.nombre_completo)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { reasignarEquipo() },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706))
                ) {
                    Text("Guardar Cambios")
                }
            },
            dismissButton = {
                TextButton(onClick = { showReasignarDialog = false }) {
                    Text("Cancelar", color = Color.Gray)
                }
            }
        )
    }

    discipuloToEdit?.let { discipulo ->
        EditAsistenteDialog(
            discipulo = discipulo,
            categoriaCelula = "General",
            onDismiss = { discipuloToEdit = null },
            onSave = { updatesMap ->
                scope.launch {
                    try {
                        val jsonElements = updatesMap.mapValues { 
                            val v = it.value
                            if (v is Boolean) kotlinx.serialization.json.JsonPrimitive(v as Boolean)
                            else if (v is Number) kotlinx.serialization.json.JsonPrimitive(v as Number)
                            else kotlinx.serialization.json.JsonPrimitive(v.toString())
                        }
                        val updates = kotlinx.serialization.json.JsonObject(jsonElements)
                        Supabase.client.from("asistentes_celula").update(updates) {
                            filter { eq("id", discipulo.id) }
                        }
                        discipuloToEdit = null
                        fetchDiscipulos()
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        )
    }

    usuarioToEdit?.let { usuario ->
        EditUsuarioDialog(
            usuario = usuario,
            onDismiss = { usuarioToEdit = null },
            onSave = { updatesMap ->
                scope.launch {
                    try {
                        val jsonElements = updatesMap.mapValues { 
                            val v = it.value
                            if (v is Boolean) kotlinx.serialization.json.JsonPrimitive(v as Boolean)
                            else if (v is Number) kotlinx.serialization.json.JsonPrimitive(v as Number)
                            else kotlinx.serialization.json.JsonPrimitive(v.toString())
                        }
                        val updates = kotlinx.serialization.json.JsonObject(jsonElements)
                        Supabase.client.from("usuarios").update(updates) {
                            filter { eq("id", usuario.id) }
                        }
                        usuarioToEdit = null
                        fetchDiscipulos()
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditUsuarioDialog(
    usuario: Usuario,
    onDismiss: () -> Unit,
    onSave: (Map<String, String>) -> Unit
) {
    var nombre by remember { mutableStateOf(usuario.nombre_completo) }
    var cedula by remember { mutableStateOf(usuario.cedula ?: "") }
    var telefono by remember { mutableStateOf(usuario.whatsapp ?: "") }
    var direccion by remember { mutableStateOf(usuario.direccion ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Editar Líder / Usuario") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = nombre,
                    onValueChange = { nombre = it },
                    label = { Text("Nombre Completo") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = cedula,
                    onValueChange = { cedula = it },
                    label = { Text("Cédula") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = telefono,
                    onValueChange = { telefono = it },
                    label = { Text("Teléfono / WhatsApp") },
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.ui.text.input.KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = direccion,
                    onValueChange = { direccion = it },
                    label = { Text("Dirección") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (nombre.isNotBlank()) {
                        onSave(mapOf(
                            "nombre_completo" to nombre,
                            "cedula" to cedula,
                            "whatsapp" to telefono,
                            "direccion" to direccion
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
                Text("Cancelar")
            }
        }
    )
}
