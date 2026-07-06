package com.example.caiapp

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.Box
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.LibraryBooks
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.serialization.json.put
import kotlinx.coroutines.launch
import com.example.caiapp.ui.BosquejosScreen
import com.example.caiapp.ui.CelugramaScreen
import com.example.caiapp.ui.AnunciosScreen
import com.example.caiapp.ui.RadioScreen
import com.example.caiapp.ui.HistorialCelugramasScreen
import com.example.caiapp.ui.AcercaDeScreen
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.automirrored.filled.ArrowBack

import androidx.compose.material.icons.filled.Person

import com.example.caiapp.ui.MisDiscipulosScreen
import com.example.caiapp.ui.PerfilScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainNavigation(isLoggedIn: Boolean, onLoginClick: () -> Unit, onLogoutClick: () -> Unit) {
    var selectedItem by remember { mutableStateOf(0) }
    
    val items = if (isLoggedIn) {
        listOf("Radio", "Anuncios", "Discípulos", "Bosquejos", "Celugrama")
    } else {
        listOf("Radio", "Anuncios")
    }
    
    val icons = if (isLoggedIn) {
        listOf(Icons.Filled.Radio, Icons.Filled.Campaign, Icons.Filled.Person, Icons.Filled.LibraryBooks, Icons.Filled.Assignment)
    } else {
        listOf(Icons.Filled.Radio, Icons.Filled.Campaign)
    }

    val scope = rememberCoroutineScope()
    var notificacionesList by remember { mutableStateOf<List<com.example.caiapp.data.Notificacion>>(emptyList()) }
    var showNotificaciones by remember { mutableStateOf(false) }
    var userName by remember { mutableStateOf("") }
    
    var showMenu by remember { mutableStateOf(false) }
    var showHistorial by remember { mutableStateOf(false) }
    var showAcercaDe by remember { mutableStateOf(false) }
    var showPerfil by remember { mutableStateOf(false) }

    LaunchedEffect(isLoggedIn) {
        if (isLoggedIn) {
            val currentUser = com.example.caiapp.data.Supabase.client.auth.currentUserOrNull()
            if (currentUser != null) {
                try {
                    val usuarioDB = com.example.caiapp.data.Supabase.client.from("usuarios")
                        .select { filter { eq("id", currentUser.id) } }
                        .decodeSingleOrNull<com.example.caiapp.data.Usuario>()
                    
                    if (usuarioDB != null) {
                        userName = usuarioDB.nombre_completo.split(" ").firstOrNull() ?: ""
                    }

                    val notis = com.example.caiapp.data.Supabase.client.from("notificaciones")
                        .select {
                            filter {
                                eq("usuario_id", currentUser.id)
                            }
                        }.decodeList<com.example.caiapp.data.Notificacion>()
                    notificacionesList = notis.sortedByDescending { it.created_at }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    if (showHistorial) {
        HistorialCelugramasScreen(onBackClick = { showHistorial = false })
        return
    }
    if (showAcercaDe) {
        AcercaDeScreen(onBackClick = { showAcercaDe = false })
        return
    }
    if (showPerfil) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Mi Perfil") },
                    navigationIcon = {
                        IconButton(onClick = { showPerfil = false }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                        }
                    }
                )
            }
        ) { padding ->
            PerfilScreen(
                supabaseClient = com.example.caiapp.data.Supabase.client,
                modifier = Modifier.padding(padding)
            )
        }
        return
    }

    Scaffold(
        topBar = {
            if (isLoggedIn) {
                TopAppBar(
                    title = { 
                        if (userName.isNotEmpty()) {
                            Text("Bienvenido, Líder $userName", color = Color(0xFF00796B), fontWeight = FontWeight.Bold, fontSize = 20.sp) 
                        } else {
                            Text("Casa de Adoración INT", color = Color(0xFF00796B), fontWeight = FontWeight.Bold) 
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White),
                    actions = {
                        IconButton(onClick = { showNotificaciones = true }) {
                            BadgedBox(
                                badge = {
                                    val unreadCount = notificacionesList.count { !it.leido }
                                    if (unreadCount > 0) {
                                        Badge { Text(unreadCount.toString()) }
                                    }
                                }
                            ) {
                                Icon(Icons.Filled.Notifications, contentDescription = "Notificaciones", tint = Color.Gray)
                            }
                        }
                        Box {
                            IconButton(onClick = { showMenu = true }) {
                                Icon(Icons.Filled.MoreVert, contentDescription = "Menú", tint = Color.Gray)
                            }
                            DropdownMenu(
                                expanded = showMenu,
                                onDismissRequest = { showMenu = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Mi Perfil") },
                                    onClick = { showMenu = false; showPerfil = true },
                                    leadingIcon = { Icon(Icons.Filled.Person, contentDescription = null) }
                                )
                                DropdownMenuItem(
                                    text = { Text("Historial de Informes") },
                                    onClick = { showMenu = false; showHistorial = true },
                                    leadingIcon = { Icon(Icons.Filled.History, contentDescription = null) }
                                )
                                DropdownMenuItem(
                                    text = { Text("Acerca de Nosotros") },
                                    onClick = { showMenu = false; showAcercaDe = true },
                                    leadingIcon = { Icon(Icons.Filled.Info, contentDescription = null) }
                                )
                                DropdownMenuItem(
                                    text = { Text("Cerrar Sesión", color = Color.Red) },
                                    onClick = {
                                        showMenu = false
                                        scope.launch {
                                            com.example.caiapp.data.Supabase.client.auth.signOut()
                                            onLogoutClick()
                                        }
                                    },
                                    leadingIcon = { Icon(Icons.Filled.Logout, contentDescription = null, tint = Color.Red) }
                                )
                            }
                        }
                    }
                )
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                items.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = { Icon(icons[index], contentDescription = item) },
                        label = { Text(item) },
                        selected = selectedItem == index,
                        onClick = { selectedItem = index },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF00796B),
                            selectedTextColor = Color(0xFF00796B),
                            indicatorColor = Color(0xFFE0F2F1),
                            unselectedIconColor = Color.Gray,
                            unselectedTextColor = Color.Gray
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        when (selectedItem) {
            0 -> RadioScreen(
                modifier = Modifier.padding(innerPadding),
                isLoggedIn = isLoggedIn,
                onLoginClick = onLoginClick,
                onLogoutClick = onLogoutClick
            )
            1 -> AnunciosScreen(modifier = Modifier.padding(innerPadding))
            2 -> if (isLoggedIn) MisDiscipulosScreen(modifier = Modifier.padding(innerPadding))
            3 -> if (isLoggedIn) BosquejosScreen(modifier = Modifier.padding(innerPadding))
            4 -> if (isLoggedIn) CelugramaScreen(modifier = Modifier.padding(innerPadding))
        }
    }

    if (showNotificaciones) {
        AlertDialog(
            onDismissRequest = { showNotificaciones = false },
            title = { Text("Notificaciones") },
            text = {
                if (notificacionesList.isEmpty()) {
                    Text("No tienes notificaciones.")
                } else {
                    androidx.compose.foundation.lazy.LazyColumn(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
                    ) {
                        items(notificacionesList.size) { index ->
                            val noti = notificacionesList[index]
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (noti.leido) Color(0xFFF5F5F5) else Color(0xFFE3F2FD)
                                )
                            ) {
                                androidx.compose.foundation.layout.Column(
                                    modifier = Modifier.padding(12.dp)
                                ) {
                                    Text(
                                        noti.mensaje,
                                        fontWeight = if (noti.leido) FontWeight.Normal else FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    showNotificaciones = false
                    
                    val unreadIds = notificacionesList.filter { !it.leido }.map { it.id }
                    if (unreadIds.isNotEmpty()) {
                        scope.launch {
                            try {
                                val params = kotlinx.serialization.json.buildJsonObject {
                                    put("leido", true)
                                }
                                com.example.caiapp.data.Supabase.client.postgrest.from("notificaciones")
                                    .update(params) {
                                        filter {
                                            isIn("id", unreadIds)
                                        }
                                    }
                                
                                notificacionesList = notificacionesList.map { 
                                    if (unreadIds.contains(it.id)) it.copy(leido = true) else it
                                }
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }
                        }
                    }
                }) { Text("Cerrar") }
            }
        )
    }
}
