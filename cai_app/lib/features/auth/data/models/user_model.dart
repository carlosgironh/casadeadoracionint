enum NivelJerarquico { pastorPrincipal, liderRed, liderGrupo, liderCelula, miembro, visitante }

class UserModel {
  final String id;
  final String nombreCompleto;
  final String cedula;
  final String email;
  final String telefono;
  final DateTime fechaNacimiento;
  final String sexo; // 'Masculino' | 'Femenino'
  final String estadoCivil; // 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo'
  final String direccion;
  final String? fotoUrl;
  final String codigoInvitacion; // UUID corto para invitar
  final String? liderDirectoId;
  final String? redAsignadaId;
  final NivelJerarquico nivel;
  final String systemRole; // 'admin', 'secretaria', 'soporte', 'user'
  final bool activo;
  final DateTime fechaRegistro;

  const UserModel({
    required this.id,
    required this.nombreCompleto,
    required this.cedula,
    required this.email,
    required this.telefono,
    required this.fechaNacimiento,
    required this.sexo,
    required this.estadoCivil,
    required this.direccion,
    this.fotoUrl,
    required this.codigoInvitacion,
    this.liderDirectoId,
    this.redAsignadaId,
    required this.nivel,
    this.systemRole = 'user',
    this.activo = true,
    required this.fechaRegistro,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      nombreCompleto: json['nombre_completo'],
      cedula: json['cedula'],
      email: json['email'],
      telefono: json['telefono'],
      fechaNacimiento: DateTime.parse(json['fecha_nacimiento']),
      sexo: json['sexo'],
      estadoCivil: json['estado_civil'],
      direccion: json['direccion'],
      fotoUrl: json['foto_url'],
      codigoInvitacion: json['codigo_invitacion'],
      liderDirectoId: json['lider_directo_id'],
      redAsignadaId: json['red_asignada_id'],
      nivel: NivelJerarquico.values[json['nivel'] ?? 5],
      systemRole: json['system_role'] ?? 'user',
      activo: json['activo'] ?? true,
      fechaRegistro: DateTime.parse(json['fecha_registro']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre_completo': nombreCompleto,
      'cedula': cedula,
      'email': email,
      'telefono': telefono,
      'fecha_nacimiento': fechaNacimiento.toIso8601String(),
      'sexo': sexo,
      'estado_civil': estadoCivil,
      'direccion': direccion,
      'foto_url': fotoUrl,
      'codigo_invitacion': codigoInvitacion,
      'lider_directo_id': liderDirectoId,
      'red_asignada_id': redAsignadaId,
      'nivel': nivel.index,
      'system_role': systemRole,
      'activo': activo,
      'fecha_registro': fechaRegistro.toIso8601String(),
    };
  }
}
