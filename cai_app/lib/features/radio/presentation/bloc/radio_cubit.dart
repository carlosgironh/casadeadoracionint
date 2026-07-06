import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:audio_service/audio_service.dart';
import 'package:cai_app/main.dart'; // Para acceder a audioHandler

enum RadioStatus { initial, loading, playing, paused, error }

class RadioState {
  final RadioStatus status;
  final String? errorMessage;

  const RadioState({
    this.status = RadioStatus.initial,
    this.errorMessage,
  });

  RadioState copyWith({
    RadioStatus? status,
    String? errorMessage,
  }) {
    return RadioState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class RadioCubit extends Cubit<RadioState> {
  late StreamSubscription _playbackStateSubscription;

  RadioCubit() : super(const RadioState()) {
    _init();
  }

  void _init() {
    _playbackStateSubscription = audioHandler.playbackState.listen((playbackState) {
      final isPlaying = playbackState.playing;
      final processingState = playbackState.processingState;

      if (processingState == AudioProcessingState.error) {
        emit(state.copyWith(status: RadioStatus.error, errorMessage: "Error al cargar la transmisión"));
      } else if (processingState == AudioProcessingState.loading || processingState == AudioProcessingState.buffering) {
        emit(state.copyWith(status: RadioStatus.loading));
      } else if (processingState == AudioProcessingState.ready) {
        emit(state.copyWith(status: isPlaying ? RadioStatus.playing : RadioStatus.paused));
      } else {
        emit(state.copyWith(status: RadioStatus.initial));
      }
    });
  }

  Future<void> connectToRadio(String streamUrl) async {
    try {
      emit(state.copyWith(status: RadioStatus.loading));
      // Asumimos que MyAudioHandler tiene setStreamUrl
      // Al ser un BaseAudioHandler, necesitamos castearlo o hacer un custom method,
      // pero por simplicidad de este POC, podemos ejecutar el play desde aquí y la lógica 
      // de stream la maneja el handler, o pasamos la lógica al playMediaItem.
      // Para acceder a métodos custom, castear:
      // (audioHandler as MyAudioHandler).setStreamUrl(streamUrl);
      
      // NOTA: Para no depender del casteo directo, lo ideal es usar customAction.
      // Aquí usaremos dynamic para el POC rápido:
      await (audioHandler as dynamic).setStreamUrl(streamUrl);
      await audioHandler.play();
    } catch (e) {
      emit(state.copyWith(status: RadioStatus.error, errorMessage: e.toString()));
    }
  }

  Future<void> play() async {
    await audioHandler.play();
  }

  Future<void> pause() async {
    await audioHandler.pause();
  }

  @override
  Future<void> close() {
    _playbackStateSubscription.cancel();
    return super.close();
  }
}
