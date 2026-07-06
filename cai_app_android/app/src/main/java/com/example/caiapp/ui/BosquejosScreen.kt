package com.example.caiapp.ui

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import com.example.caiapp.data.Bosquejo
import com.example.caiapp.data.Supabase
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.launch
import android.content.Intent
import androidx.compose.ui.platform.LocalContext
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import android.graphics.pdf.PdfDocument
import android.graphics.Paint
import android.graphics.Color as AndroidColor
import android.text.TextPaint
import android.text.StaticLayout
import android.text.Layout
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

@Composable
fun BosquejosScreen(modifier: Modifier = Modifier) {
    var bosquejos by remember { mutableStateOf<List<Bosquejo>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Discipulado", "Evangelísticos")
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                bosquejos = Supabase.client.from("bosquejos")
                    .select {
                        order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                    }
                    .decodeList<Bosquejo>()
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
            text = "Bosquejos",
            fontSize = 32.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF004D40)
        )
        Text(
            text = "Material para tu célula semanal",
            fontSize = 16.sp,
            color = Color(0xFF007F7F)
        )

        Spacer(modifier = Modifier.height(16.dp))

        PrimaryTabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color.Transparent,
            contentColor = Color(0xFF007F7F),
            modifier = Modifier.fillMaxWidth()
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title, fontWeight = FontWeight.Bold) }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))

        val filteredBosquejos = remember(bosquejos, selectedTab) {
            val tipoBuscado = if (selectedTab == 0) "discipulado" else "evangelistico"
            bosquejos.filter { it.tipo.equals(tipoBuscado, ignoreCase = true) }
        }

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF007F7F))
            }
        } else if (filteredBosquejos.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No hay bosquejos disponibles en esta categoría.", color = Color.Gray)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(filteredBosquejos) { bosquejo ->
                    BosquejoCard(bosquejo)
                }
            }
        }
    }
}

@Composable
fun BosquejoCard(bosquejo: Bosquejo) {
    var expanded by remember { mutableStateOf(false) }
    val context = LocalContext.current

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize()
            .clickable { expanded = !expanded }
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(
                    text = bosquejo.titulo,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 24.sp,
                    color = Color(0xFF1F2937),
                    modifier = Modifier.weight(1f)
                )
                
                IconButton(onClick = {
                    shareBosquejoAsPdf(context, bosquejo)
                }) {
                    Icon(Icons.Filled.Share, contentDescription = "Compartir como PDF", tint = Color(0xFF00796B))
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Versículo Base: ${bosquejo.versiculo_base}",
                fontSize = 16.sp,
                color = Color(0xFF007F7F),
                fontWeight = FontWeight.SemiBold,
                lineHeight = 24.sp
            )
            
            if (expanded) {
                Spacer(modifier = Modifier.height(20.dp))
                HorizontalDivider(color = Color(0xFFE5E7EB))
                Spacer(modifier = Modifier.height(20.dp))
                
                Text(
                    text = "Introducción",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 18.sp,
                    color = Color(0xFF374151)
                )
                Text(
                    text = bosquejo.introduccion,
                    fontSize = 16.sp,
                    color = Color(0xFF4B5563),
                    modifier = Modifier.padding(vertical = 8.dp),
                    lineHeight = 26.sp
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                if (!bosquejo.puntos_desarrollo.isNullOrEmpty()) {
                    Text(
                        text = "Desarrollo / Puntos",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp,
                        color = Color(0xFF374151)
                    )
                    bosquejo.puntos_desarrollo.forEachIndexed { index, punto ->
                        Text(
                            text = "${index + 1}. $punto",
                            fontSize = 16.sp,
                            color = Color(0xFF4B5563),
                            modifier = Modifier.padding(vertical = 4.dp),
                            lineHeight = 26.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }
                
                Text(
                    text = "Conclusión",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 18.sp,
                    color = Color(0xFF374151)
                )
                Text(
                    text = bosquejo.conclusion,
                    fontSize = 16.sp,
                    color = Color(0xFF4B5563),
                    modifier = Modifier.padding(vertical = 8.dp),
                    lineHeight = 26.sp
                )
            }
        }
    }
}

fun shareBosquejoAsPdf(context: android.content.Context, bosquejo: Bosquejo) {
    try {
        val document = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = document.startPage(pageInfo)
        val canvas = page.canvas

        val titlePaint = TextPaint().apply {
            color = AndroidColor.BLACK
            textSize = 24f
            isFakeBoldText = true
        }

        val headingPaint = TextPaint().apply {
            color = AndroidColor.parseColor("#007F7F")
            textSize = 18f
            isFakeBoldText = true
        }

        val bodyPaint = TextPaint().apply {
            color = AndroidColor.DKGRAY
            textSize = 14f
        }

        var currentY = 50

        // Helper to draw wrapped text
        fun drawText(text: String, paint: TextPaint) {
            val staticLayout = StaticLayout.Builder.obtain(text, 0, text.length, paint, 495)
                .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                .setLineSpacing(1f, 1f)
                .setIncludePad(false)
                .build()
            
            canvas.save()
            canvas.translate(50f, currentY.toFloat())
            staticLayout.draw(canvas)
            canvas.restore()
            
            currentY += staticLayout.height + 20
        }

        drawText(bosquejo.titulo, titlePaint)
        drawText("Versículo Base:", headingPaint)
        drawText(bosquejo.versiculo_base, bodyPaint)
        drawText("Introducción:", headingPaint)
        drawText(bosquejo.introduccion, bodyPaint)

        if (!bosquejo.puntos_desarrollo.isNullOrEmpty()) {
            drawText("Desarrollo:", headingPaint)
            bosquejo.puntos_desarrollo.forEachIndexed { index, punto ->
                drawText("${index + 1}. $punto", bodyPaint)
            }
        }

        drawText("Conclusión:", headingPaint)
        drawText(bosquejo.conclusion, bodyPaint)

        document.finishPage(page)

        val pdfsDir = File(context.cacheDir, "pdfs")
        if (!pdfsDir.exists()) pdfsDir.mkdirs()
        
        val file = File(pdfsDir, "Bosquejo_${bosquejo.titulo.take(15).replace(" ", "_")}.pdf")
        val outputStream = FileOutputStream(file)
        document.writeTo(outputStream)
        document.close()
        outputStream.close()

        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(intent, "Compartir Bosquejo PDF"))
    } catch (e: Exception) {
        e.printStackTrace()
    }
}
