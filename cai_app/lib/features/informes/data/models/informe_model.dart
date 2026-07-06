class AsistenteModel {
  final String nombre;
  final String? telefono;
  final bool asistio;
  final bool esNuevo;
  final bool esVisita;

  const AsistenteModel({
    required this.nombre,
    this.telefono,
    this.asistio = true,
    this.esNuevo = false,
    this.esVisita = false,
  });

  factory AsistenteModel.fromJson(Map<String, dynamic> json) {
    return AsistenteModel(
      nombre: json['nombre'],
      telefono: json['telefono'],
      asistio: json['asistio'] ?? true,
      esNuevo: json['esNuevo'] ?? false,
      esVisita: json['esVisita'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nombre': nombre,
      'telefono': telefono,
      'asistio': asistio,
      'esNuevo': esNuevo,
      'esVisita': esVisita,
    };
  }
}

class InformeCelulaModel {
  final String id;
  final String liderCelulaId;
  final String nombreCelula;
  final DateTime fechaReunion;
  final String lugar;
  final List<AsistenteModel> asistentes; // JSONB
  final int nuevosConvertidos;
  final int visitas;
  final double? ofrenda;
  final String? bosquejoUsadoId;
  final String temaTratado;
  final List<String> peticionesOracion; // JSONB
  final List<String>? fotosUrls; // JSONB
  final String? observaciones;
  final DateTime fechaRegistro;

  const InformeCelulaModel({
    required this.id,
    required this.liderCelulaId,
    required this.nombreCelula,
    required this.fechaReunion,
    required this.lugar,
    required this.asistentes,
    this.nuevosConvertidos = 0,
    this.visitas = 0,
    this.ofrenda,
    this.bosquejoUsadoId,
    required this.temaTratado,
    required this.peticionesOracion,
    this.fotosUrls,
    this.observaciones,
    required this.fechaRegistro,
  });

  factory InformeCelulaModel.fromJson(Map<String, dynamic> json) {
    return InformeCelulaModel(
      id: json['id'],
      liderCelulaId: json['lider_celula_id'],
      nombreCelula: json['nombre_celula'],
      fechaReunion: DateTime.parse(json['fecha_reunion']),
      lugar: json['lugar'],
      asistentes: (json['asistentes'] as List<dynamic>?)
              ?.map((e) => AsistenteModel.fromJson(e))
              .toList() ??
          [],
      nuevosConvertidos: json['nuevos_convertidos'] ?? 0,
      visitas: json['visitas'] ?? 0,
      ofrenda: json['ofrenda'] != null ? double.parse(json['ofrenda'].toString()) : null,
      bosquejoUsadoId: json['bosquejo_usado_id'],
      temaTratado: json['tema_tratado'],
      peticionesOracion: List<String>.from(json['peticiones_oracion'] ?? []),
      fotosUrls: json['fotos_urls'] != null ? List<String>.from(json['fotos_urls']) : null,
      observaciones: json['observaciones'],
      fechaRegistro: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lider_celula_id': liderCelulaId,
      'nombre_celula': nombreCelula,
      'fecha_reunion': fechaReunion.toIso8601String(),
      'lugar': lugar,
      'asistentes': asistentes.map((e) => e.toJson()).toList(),
      'nuevos_convertidos': nuevosConvertidos,
      'visitas': visitas,
      'ofrenda': ofrenda,
      'bosquejo_usado_id': bosquejoUsadoId,
      'tema_tratado': temaTratado,
      'peticiones_oracion': peticionesOracion,
      'fotos_urls': fotosUrls,
      'observaciones': observaciones,
      'created_at': fechaRegistro.toIso8601String(),
    };
  }
}
