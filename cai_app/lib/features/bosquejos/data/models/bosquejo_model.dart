enum TipoBosquejo { evangelistico, discipulado }

class BosquejoModel {
  final String id;
  final String titulo;
  final String versiculoBase;
  final String introduccion;
  final List<String> puntosDesarrollo; // JSONB en Supabase
  final String conclusion;
  final List<String> preguntasDiscusion; // JSONB
  final TipoBosquejo tipo;
  final String? redDirigidaId; // A qué red va dirigido
  final int mes;
  final int anio;
  final String autorId;
  final bool publicado;
  final DateTime fechaCreacion;
  final DateTime? fechaActualizacion;

  const BosquejoModel({
    required this.id,
    required this.titulo,
    required this.versiculoBase,
    required this.introduccion,
    required this.puntosDesarrollo,
    required this.conclusion,
    required this.preguntasDiscusion,
    required this.tipo,
    this.redDirigidaId,
    required this.mes,
    required this.anio,
    required this.autorId,
    this.publicado = false,
    required this.fechaCreacion,
    this.fechaActualizacion,
  });

  factory BosquejoModel.fromJson(Map<String, dynamic> json) {
    return BosquejoModel(
      id: json['id'],
      titulo: json['titulo'],
      versiculoBase: json['versiculo_base'],
      introduccion: json['introduccion'],
      puntosDesarrollo: List<String>.from(json['puntos_desarrollo'] ?? []),
      conclusion: json['conclusion'],
      preguntasDiscusion: List<String>.from(json['preguntas_discusion'] ?? []),
      tipo: json['tipo'] == 'discipulado' ? TipoBosquejo.discipulado : TipoBosquejo.evangelistico,
      redDirigidaId: json['red_dirigida_id'],
      mes: json['mes'],
      anio: json['anio'],
      autorId: json['autor_id'],
      publicado: json['publicado'] ?? false,
      fechaCreacion: DateTime.parse(json['created_at']),
      fechaActualizacion: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titulo': titulo,
      'versiculo_base': versiculoBase,
      'introduccion': introduccion,
      'puntos_desarrollo': puntosDesarrollo,
      'conclusion': conclusion,
      'preguntas_discusion': preguntasDiscusion,
      'tipo': tipo == TipoBosquejo.discipulado ? 'discipulado' : 'evangelistico',
      'red_dirigida_id': redDirigidaId,
      'mes': mes,
      'anio': anio,
      'autor_id': autorId,
      'publicado': publicado,
      'created_at': fechaCreacion.toIso8601String(),
      'updated_at': fechaActualizacion?.toIso8601String(),
    };
  }
}
