package com.example.caiapp.ui

import android.content.ComponentName
import android.util.Log
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.ui.PlayerView
import androidx.media3.exoplayer.ExoPlayer
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import coil.compose.AsyncImage
import com.example.caiapp.R
import com.example.caiapp.RadioService
import com.google.common.util.concurrent.ListenableFuture

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RadioScreen(modifier: Modifier = Modifier, isLoggedIn: Boolean = false, onLoginClick: () -> Unit = {}, onLogoutClick: () -> Unit = {}) {
    val context = LocalContext.current
    val isPreview = LocalInspectionMode.current
    
    var mediaController by remember { mutableStateOf<MediaController?>(null) }
    var isPlaying by remember { mutableStateOf(false) }
    var isBuffering by remember { mutableStateOf(false) }
    var metadata by remember { mutableStateOf<MediaMetadata>(MediaMetadata.EMPTY) }
    
    // Casa de Adoración Stream URL
    val radioUrl = "https://studio20.radiolize.com/radio/8050/radio.mp3"
    val mainExecutor = remember(context) { ContextCompat.getMainExecutor(context) }
    
    var showMenu by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        if (isPreview) return@DisposableEffect onDispose {}
        
        try {
            val sessionToken = SessionToken(context, ComponentName(context, RadioService::class.java))
            val controllerFuture: ListenableFuture<MediaController> =
                MediaController.Builder(context, sessionToken).buildAsync()

            controllerFuture.addListener({
                try {
                    val controller = controllerFuture.get()
                    mediaController = controller
                    
                    isPlaying = controller.isPlaying
                    isBuffering = controller.playbackState == Player.STATE_BUFFERING
                    metadata = controller.mediaMetadata

                    if (controller.mediaItemCount == 0) {
                        controller.setMediaItem(MediaItem.fromUri(radioUrl))
                        controller.prepare()
                    }

                    controller.addListener(object : Player.Listener {
                        override fun onIsPlayingChanged(playing: Boolean) {
                            isPlaying = playing
                        }
                        override fun onPlaybackStateChanged(playbackState: Int) {
                            isBuffering = playbackState == Player.STATE_BUFFERING
                        }
                        override fun onMediaMetadataChanged(newMetadata: MediaMetadata) {
                            metadata = newMetadata
                        }
                    })
                } catch (e: Exception) {
                    Log.e("RadioScreen", "Error getting MediaController", e)
                }
            }, mainExecutor)
        } catch (e: Exception) {
            Log.e("RadioScreen", "Error creating SessionToken", e)
        }

        onDispose {
            mediaController?.release()
        }
    }

    // Animation for the rotating disc
    val infiniteTransition = rememberInfiniteTransition(label = "disc_rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(10000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    val visualizerPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            val mediaItem = MediaItem.fromUri("android.resource://${context.packageName}/${R.raw.logo_rotation}")
            setMediaItem(mediaItem)
            repeatMode = Player.REPEAT_MODE_ALL
            prepare()
            playWhenReady = true
        }
    }
    
    DisposableEffect(Unit) {
        onDispose { 
            visualizerPlayer.release() 
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                actions = {
                    if (!isLoggedIn) {
                        TextButton(onClick = onLoginClick) {
                            Text("Ingresar Líder", color = Color(0xFF0D47A1), fontWeight = FontWeight.Bold)
                        }
                    } else {
                        Box {
                            IconButton(onClick = { showMenu = !showMenu }) {
                                Icon(Icons.Rounded.Person, contentDescription = "Perfil", tint = Color(0xFF0D47A1))
                            }
                            DropdownMenu(
                                expanded = showMenu,
                                onDismissRequest = { showMenu = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Cerrar Sesión", color = Color.Red) },
                                    onClick = { 
                                        showMenu = false
                                        onLogoutClick() 
                                    }
                                )
                            }
                        }
                    }
                }
            )
        },
        containerColor = Color.Transparent
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(
                    colors = listOf(Color(0xFFE3F2FD), Color.White)
                ))
                .padding(paddingValues)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Animated Disc / Artwork
            Box(
                modifier = Modifier
                    .size(280.dp)
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                // The Disc
                Box(
                    modifier = Modifier
                        .fillMaxSize(0.95f)
                        .clip(CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    if (metadata.artworkUri != null) {
                        AsyncImage(
                            model = metadata.artworkUri,
                            contentDescription = "Artwork",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        AndroidView(
                            factory = { ctx ->
                                PlayerView(ctx).apply {
                                    player = visualizerPlayer
                                    useController = false
                                }
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(48.dp))

            // Song Info
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(horizontal = 40.dp)
            ) {
                Text(
                    text = metadata.title?.toString() ?: "Casa de Adoración INT",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0D47A1),
                    textAlign = TextAlign.Center,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = metadata.artist?.toString() ?: (if (isBuffering) "Conectando..." else if (isPlaying) "Transmisión en Vivo" else "Radio en Pausa"),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isPlaying) Color(0xFF1976D2) else Color.Gray,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(64.dp))

            // Play/Pause Button
            Surface(
                shape = CircleShape,
                color = if (isPlaying) Color(0xFF0D47A1) else Color(0xFF37474F),
                modifier = Modifier
                    .size(80.dp)
                    .clickable {
                        mediaController?.let {
                            if (it.isPlaying) {
                                it.pause()
                            } else {
                                if (it.playbackState == Player.STATE_IDLE) {
                                    it.prepare()
                                }
                                it.play()
                            }
                        }
                    },
                shadowElevation = 16.dp
            ) {
                Box(contentAlignment = Alignment.Center) {
                    if (isBuffering) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(32.dp), strokeWidth = 3.dp)
                    } else {
                        Icon(
                            imageVector = if (isPlaying) Icons.Rounded.Pause else Icons.Rounded.PlayArrow,
                            contentDescription = "Play/Pause",
                            tint = Color.White,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }
            }
        }
    }
}
