class ApiConstants {
  // Asegúrate de reemplazar esto en el futuro con dart-define o un .env
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://fhugnuhatzcepvhnacsm.supabase.co');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as');
  
  // Radiolize API o Stream URL
  static const String radioStreamUrl = 'https://studio20.radiolize.com/listen/radio_adoracion_int/radio.mp3';
}
