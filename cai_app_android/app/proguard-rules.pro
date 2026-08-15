# Add project specific ProGuard rules here.

# ── Kotlin & Coroutines ──────────────────────────────────────────────────────
-keepclassmembers class kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

# ── Kotlin Serialization ─────────────────────────────────────────────────────
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers @kotlinx.serialization.Serializable class ** {
    *** Companion;
    *** INSTANCE;
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.casadeadoracionint.app.**$$serializer { *; }
-keepclassmembers class com.casadeadoracionint.app.** {
    *** Companion;
}
-keepclasseswithmembers class com.casadeadoracionint.app.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# ── Supabase / Ktor ──────────────────────────────────────────────────────────
-keep class io.github.jan.supabase.** { *; }
-dontwarn io.github.jan.supabase.**
-keep class io.ktor.** { *; }
-dontwarn io.ktor.**
-keep class io.ktor.client.** { *; }

# ── OkHttp (usado por Ktor internamente) ─────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**

# ── AndroidX / Compose ───────────────────────────────────────────────────────
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**

# ── Data models del proyecto ─────────────────────────────────────────────────
-keep class com.casadeadoracionint.app.data.** { *; }

# ── Coil (carga de imágenes) ──────────────────────────────────────────────────
-dontwarn coil.**

# ── General ──────────────────────────────────────────────────────────────────
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
