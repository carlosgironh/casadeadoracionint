import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cai_app/features/radio/presentation/bloc/radio_cubit.dart';
// import 'package:lucide_icons/lucide_icons.dart'; // Asegúrate de tener lucide_icons si quieres iconos minimalistas, o usa Icons nativos. Usaremos Icons nativos por seguridad.

class RadioPage extends StatefulWidget {
  const RadioPage({super.key});

  @override
  State<RadioPage> createState() => _RadioPageState();
}

class _RadioPageState extends State<RadioPage> {
  // URL de prueba temporal (Streaming público de audio, ej. Radio clásica)
  final String testStreamUrl = 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service';

  @override
  void initState() {
    super.initState();
    // Conectar a la radio al iniciar la página
    context.read<RadioCubit>().connectToRadio(testStreamUrl);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Radio CAI',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: BlocBuilder<RadioCubit, RadioState>(
        builder: (context, state) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Portada / Logo de la radio
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Icon(
                      Icons.radio,
                      size: 80,
                      color: Colors.grey.shade400,
                    ),
                  ),
                ),
                const SizedBox(height: 48),

                // Título e info
                const Text(
                  'Casa de Adoración Internacional',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  state.status == RadioStatus.loading 
                    ? 'Conectando...' 
                    : (state.status == RadioStatus.playing ? 'En Vivo' : 'Pausado'),
                  style: TextStyle(
                    fontSize: 16,
                    color: state.status == RadioStatus.playing ? Colors.redAccent : Colors.grey.shade500,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                
                if (state.errorMessage != null) ...[
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      state.errorMessage!,
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],

                const SizedBox(height: 64),

                // Controles de Reproducción
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.black87,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: IconButton(
                    iconSize: 40,
                    color: Colors.white,
                    icon: state.status == RadioStatus.loading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Icon(
                            state.status == RadioStatus.playing
                                ? Icons.pause_rounded
                                : Icons.play_arrow_rounded,
                          ),
                    onPressed: () {
                      if (state.status == RadioStatus.playing) {
                        context.read<RadioCubit>().pause();
                      } else {
                        // Si está inicial, pausado o error, intenta reproducir
                        if (state.status == RadioStatus.error) {
                          context.read<RadioCubit>().connectToRadio(testStreamUrl);
                        } else {
                          context.read<RadioCubit>().play();
                        }
                      }
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
