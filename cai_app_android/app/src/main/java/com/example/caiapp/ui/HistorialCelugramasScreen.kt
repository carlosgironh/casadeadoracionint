package com.example.caiapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.caiapp.data.Supabase
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import java.text.SimpleDateFormat
import java.util.Locale

@Serializable
data class InformeSimple(
    val id: String,
    val nombre_celula: String,
    val fecha_reunion: String,
    val asistencia_total: Int? = 0,
    val estado: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistorialCelugramasScreen(onBackClick: () -> Unit) {
    var informes by remember { mutableStateOf<List<InformeSimple>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val currentUser = Supabase.client.auth.currentUserOrNull()
                if (currentUser != null) {
                    informes = Supabase.client.from("informes_celula")
                        .select {
                            filter { eq("lider_id", currentUser.id) }
                            order("fecha_reunion", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                        }
                        .decodeList<InformeSimple>()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoading = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Historial de Celugramas", color = Color.White, fontWeight = FontWeight.Bold) },
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
            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF007F7F))
                }
            } else if (informes.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No has enviado ningún celugrama.", color = Color.Gray)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(informes) { informe ->
                        InformeCard(informe)
                    }
                }
            }
        }
    }
}

@Composable
fun InformeCard(informe: InformeSimple) {
    val date = try {
        val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).parse(informe.fecha_reunion.take(19))
        SimpleDateFormat("dd MMM yyyy", Locale("es", "ES")).format(parsed!!)
    } catch (e: Exception) {
        informe.fecha_reunion.take(10)
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(text = informe.nombre_celula, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1F2937))
                Text(text = date, fontSize = 14.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(text = "Asistencia: ${informe.asistencia_total ?: 0}", color = Color(0xFF4B5563))
                Text(
                    text = informe.estado.uppercase(),
                    color = if (informe.estado == "enviado") Color(0xFF059669) else Color(0xFFD97706),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }
    }
}
