/// Constantes de API para la aplicación CAI.
///
/// Las variables SUPABASE_URL y SUPABASE_ANON_KEY deben ser inyectadas
/// en tiempo de compilación usando --dart-define:
///
///   flutter run \
///     --dart-define=SUPABASE_URL=https://TU_PROYECTO.supabase.co \
///     --dart-define=SUPABASE_ANON_KEY=TU_CLAVE_AQUI
///
/// Para producción, configura estas variables en el sistema de CI/CD.
class ApiConstants {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  /// URL del stream de radio de la iglesia
  static const String radioStreamUrl =
      'https://studio20.radiolize.com/listen/radio_adoracion_int/radio.mp3';

  /// Valida que las constantes de entorno estén configuradas
  static void validate() {
    if (supabaseUrl.isEmpty) {
      throw StateError(
        '[ApiConstants] SUPABASE_URL no está configurado. '
        'Usa --dart-define=SUPABASE_URL=... al compilar.',
      );
    }
    if (supabaseAnonKey.isEmpty) {
      throw StateError(
        '[ApiConstants] SUPABASE_ANON_KEY no está configurado. '
        'Usa --dart-define=SUPABASE_ANON_KEY=... al compilar.',
      );
    }
  }
}
