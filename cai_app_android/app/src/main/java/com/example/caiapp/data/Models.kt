package com.example.caiapp.data

import kotlinx.serialization.Serializable

@Serializable
data class Bosquejo(
    val id: String,
    val titulo: String,
    val versiculo_base: String,
    val introduccion: String,
    val puntos_desarrollo: List<String>? = null,
    val conclusion: String,
    val tipo: String? = null,
    val created_at: String
)

@Serializable
data class Anuncio(
    val id: String,
    val titulo: String,
    val contenido: String,
    val fecha: String,
    val imagen_url: String? = null,
    val leyenda: String? = null
)

@Serializable
data class Celula(
    val id: String,
    val lider_id: String,
    val equipo_id: String? = null,
    val colider_id: String? = null,
    val zona: String? = null,
    val direccion: String? = null,
    val categoria: String? = "General",
    val fecha_apertura: String? = null,
    val dia_reunion: String? = null,
    val hora_reunion: String? = null,
    val red: String? = null,
    val lideres_adicionales: String? = null,
    val fecha_cumpleanos: String? = null,
    val fecha_aniversario: String? = null,
    val vacaciones: String? = null,
    val created_at: String? = null
)

@Serializable
data class CelulaUpdate(
    val lider_id: String,
    val colider_id: String? = null,
    val lideres_adicionales: String? = null
)

@Serializable
data class Equipo(
    val id: String,
    val nombre: String,
    val red_id: String
)

@Serializable
data class ZonaExpansion(
    val id: String,
    val numero_zona: Int? = null,
    val lugares: String? = null
)

@Serializable
data class AsistenteCelula(
    val id: String,
    val nombre: String,
    val cedula: String,
    val whatsapp: String? = null,
    val telefono: String? = null,
    val fecha_nacimiento: String? = null,
    val edad: Int? = null,
    val sexo: String? = null,
    val direccion: String? = null,
    val nivel_crecimiento: Int = 1,
    val lider_id: String? = null,
    val red_id: String? = null,
    val libro_juan: Boolean = false,
    val pre_tcd_1: Boolean = false,
    val tiempo_con_dios: Boolean = false,
    val pos_tcd_2: Boolean = false,
    val bautismo: Boolean = false,
    val discipulado_1: Boolean = false,
    val modulo_1_escuela: Boolean = false,
    val seminario_vision: Boolean = false,
    val modulo_2_escuela: Boolean = false,
    val seminario_servicio: Boolean = false,
    val modulo_3: Boolean = false,
    val lanzamiento: Boolean = false,
    val consolidacion: Boolean = false,
    val plan_felipe: Boolean = false,
    val retiro: Boolean = false,
    val encuentro: Boolean = false,
    val liderazgo: Boolean = false,
    val pos_lanzamiento: Boolean = false,
    val graduado: Boolean = false,
    val dirige_evangelistica: Boolean = false,
    val dirige_discipulado: Boolean = false
)

@Serializable
data class AsistenciaReunion(
    val id: String? = null,
    val informe_id: String,
    val asistente_id: String,
    val asistio: Boolean = true,
    val created_at: String? = null
)

@Serializable
data class Notificacion(
    val id: String,
    val usuario_id: String,
    val mensaje: String,
    val leido: Boolean,
    val created_at: String
)

@Serializable
data class Red(
    val id: String,
    val nombre: String
)

@Serializable
data class Usuario(
    val id: String,
    val nombre_completo: String,
    val cedula: String? = null,
    val email: String? = null,
    val username: String? = null,
    val nivel: Int? = null,
    val lider_directo_id: String? = null,
    val red_asignada_id: String? = null,
    val equipo_id: String? = null,
    val equipo_lider_id: String? = null,
    val plan_felipe: Boolean = false,
    val capacitacion: String? = null,
    val ministerio: String? = null,
    val pendiente_aprobacion: Boolean? = false,
    val whatsapp: String? = null,
    val direccion: String? = null
)
