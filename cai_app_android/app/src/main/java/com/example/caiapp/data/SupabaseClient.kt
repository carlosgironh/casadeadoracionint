package com.example.caiapp.data

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.postgrest.Postgrest

object Supabase {
    private const val SUPABASE_URL = "https://fhugnuhatzcepvhnacsm.supabase.co"
    private const val SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as"

    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = SUPABASE_URL,
            supabaseKey = SUPABASE_KEY
        ) {
            install(Postgrest)
            install(Auth)
        }
    }
}
