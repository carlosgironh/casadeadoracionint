package com.example.caiapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.caiapp.data.Anuncio
import com.example.caiapp.data.Supabase
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontStyle

@Composable
fun AnunciosScreen(modifier: Modifier = Modifier) {
    var anuncios by remember { mutableStateOf<List<Anuncio>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                anuncios = Supabase.client.from("anuncios")
                    .select {
                        order("fecha", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                    }
                    .decodeList<Anuncio>()
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoading = false
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(
                androidx.compose.ui.graphics.Brush.verticalGradient(
                    colors = listOf(Color(0xFFE0F7FA), Color.White)
                )
            )
            .padding(16.dp),
        horizontalAlignment = Alignment.Start
    ) {
        Text(
            text = "Anuncios",
            fontSize = 32.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF004D40)
        )
        Text(
            text = "Comunicados y eventos de la iglesia",
            fontSize = 16.sp,
            color = Color(0xFF007F7F)
        )

        Spacer(modifier = Modifier.height(24.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF007F7F))
            }
        } else if (anuncios.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No hay anuncios por el momento.", color = Color.Gray)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(anuncios) { anuncio ->
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(
                                text = anuncio.titulo,
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp,
                                color = Color(0xFF1F2937)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            
                            val dateStr = try {
                                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                                val formatter = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
                                val parsed = parser.parse(anuncio.fecha.substringBefore("."))
                                if (parsed != null) formatter.format(parsed) else anuncio.fecha
                            } catch (e: Exception) {
                                anuncio.fecha
                            }
                            
                            Text(
                                text = dateStr,
                                fontSize = 12.sp,
                                color = Color(0xFF6B7280)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            if (!anuncio.imagen_url.isNullOrEmpty()) {
                                AsyncImage(
                                    model = anuncio.imagen_url,
                                    contentDescription = "Imagen de Anuncio",
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(200.dp)
                                        .clip(RoundedCornerShape(8.dp)),
                                    contentScale = ContentScale.Crop
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                            }
                            
                            if (!anuncio.leyenda.isNullOrEmpty()) {
                                Text(
                                    text = anuncio.leyenda,
                                    fontSize = 13.sp,
                                    fontStyle = FontStyle.Italic,
                                    color = Color(0xFF4B5563)
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                            
                            Text(
                                text = anuncio.contenido,
                                fontSize = 16.sp,
                                color = Color(0xFF4B5563),
                                lineHeight = 24.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
