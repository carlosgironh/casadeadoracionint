import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cai_app/app.dart';
import 'package:cai_app/injection.dart';
import 'package:cai_app/config/constants/api_constants.dart';
import 'package:audio_service/audio_service.dart';
import 'package:cai_app/core/services/audio_handler.dart';

late AudioHandler audioHandler;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inicializar AudioService para background playback
  audioHandler = await AudioService.init(
    builder: () => MyAudioHandler(),
    config: const AudioServiceConfig(
      androidNotificationChannelId: 'com.casadeadoracion.cai_app.channel.audio',
      androidNotificationChannelName: 'Radio CAI',
      androidNotificationOngoing: true,
      androidStopForegroundOnPause: true,
    ),
  );

  // Forzar orientación vertical
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Inicializar Supabase
  await Supabase.initialize(
    url: ApiConstants.supabaseUrl,
    anonKey: ApiConstants.supabaseAnonKey,
  );

  // Inicializar inyección de dependencias
  configureDependencies();

  runApp(const CaiApp());
}
