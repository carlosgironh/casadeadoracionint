package com.example.caiapp.ui

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Campaign
import androidx.compose.material.icons.rounded.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.caiapp.data.Supabase
import io.github.jan.supabase.postgrest.from
import kotlinx.serialization.Serializable

@Serializable
data class SupabaseEvent(
    val id: Int,
    val title: String,
    val date_str: String,
    val location: String,
    val description: String,
    val is_special_event: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventsScreen(modifier: Modifier = Modifier) {
    var events by remember { mutableStateOf<List<SupabaseEvent>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            isLoading = true
            val results = Supabase.client.from("events").select().decodeList<SupabaseEvent>()
            events = results
            isLoading = false
        } catch (e: Exception) {
            Log.e("EventsScreen", "Error fetching events", e)
            error = "No se pudieron cargar los eventos. Revisa tu conexión."
            isLoading = false
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(
                colors = listOf(Color(0xFFE3F2FD), Color.White)
            ))
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
        ) {
            Text(
                text = "Próximos Eventos",
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                color = Color(0xFF0D47A1)
            )
        }

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF0D47A1))
            }
        } else if (error != null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = error!!, color = Color.Red, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(events) { event ->
                    EventCard(event)
                }
            }
        }
    }
}

@Composable
fun EventCard(event: SupabaseEvent) {
    val accentColor = if (event.is_special_event) Color(0xFF0D47A1) else Color(0xFF1976D2)
    val icon = if (event.is_special_event) Icons.Rounded.CalendarMonth else Icons.Rounded.Campaign

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(accentColor.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = accentColor)
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column {
                    Text(
                        text = event.title,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF263238)
                    )
                    Text(
                        text = if (event.is_special_event) "Evento Especial" else "Anuncio",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = accentColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = event.description,
                fontSize = 14.sp,
                color = Color.Gray,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            Divider(color = Color.LightGray.copy(alpha = 0.5f))

            Spacer(modifier = Modifier.height(12.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Rounded.CalendarMonth, contentDescription = null, size = 16.dp, color = Color.Gray)
                Spacer(modifier = Modifier.width(4.dp))
                Text(event.date_str, fontSize = 12.sp, color = Color.Gray)
                
                Spacer(modifier = Modifier.weight(1f))
                
                Icon(Icons.Rounded.LocationOn, contentDescription = null, size = 16.dp, color = Color.Gray)
                Spacer(modifier = Modifier.width(4.dp))
                Text(event.location, fontSize = 12.sp, color = Color.Gray)
            }
        }
    }
}

@Composable
private fun Icon(imageVector: ImageVector, contentDescription: String?, size: androidx.compose.ui.unit.Dp, color: Color) {
    Icon(
        imageVector = imageVector,
        contentDescription = contentDescription,
        modifier = Modifier.size(size),
        tint = color
    )
}
