package com.example.caiapp.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.caiapp.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AcercaDeScreen(onBackClick: () -> Unit) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Acerca de Nosotros", color = Color.White, fontWeight = FontWeight.Bold) },
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
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Logo
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 24.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.app_logo),
                    contentDescription = "Logo",
                    modifier = Modifier.size(150.dp)
                )
            }

            // Misión y Visión
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Nuestra Misión", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF004D40))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Establecer el reino de Dios y su justicia, ganar almas y hacer discípulos en todas las naciones.",
                        fontSize = 16.sp, color = Color.Gray, lineHeight = 24.sp
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text("Nuestra Visión", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF004D40))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Ser una iglesia de influencia mundial, que adora a Dios en espíritu y en verdad, levantando generaciones apasionadas por la presencia del Espíritu Santo.",
                        fontSize = 16.sp, color = Color.Gray, lineHeight = 24.sp
                    )
                }
            }

            // Redes y Contacto
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Contáctanos", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF004D40))
                    Spacer(modifier = Modifier.height(16.dp))

                    ContactRow("YouTube", "youtube.com/c/casadeadoraciónint", Color(0xFFFF0000)) {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/c/casadeadoraci%C3%B3nint")))
                    }
                    ContactRow("Facebook", "CasadeAdoracionInt", Color(0xFF1877F2)) {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.facebook.com/CasadeAdoracionInt")))
                    }
                    ContactRow("Instagram", "@casadeadoracion_int", Color(0xFFE1306C)) {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.instagram.com/casadeadoracion_int/")))
                    }
                    ContactRow("WhatsApp", "+507 6289-1790", Color(0xFF25D366)) {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://api.whatsapp.com/send/?phone=50762891790&text&type=phone_number&app_absent=0")))
                    }
                    ContactRow("Ubicación", "Ver en el mapa", Color(0xFF004D40)) {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://casadeadoracionint.com/rese%C3%B1a-historica")))
                    }
                }
            }
        }
    }
}

@Composable
fun ContactRow(title: String, subtitle: String, iconColor: Color, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(iconColor.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(title.first().toString(), color = iconColor, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(title, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = Color(0xFF1F2937))
            Text(subtitle, fontSize = 14.sp, color = Color.Gray)
        }
    }
}
