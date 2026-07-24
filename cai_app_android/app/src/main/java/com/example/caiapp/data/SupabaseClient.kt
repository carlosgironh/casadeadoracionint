package com.example.caiapp.data

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.postgrest.Postgrest

object Supabase {
    private const val SUPABASE_URL = "https://kkxjgmnmaxswpnbcimld.supabase.co"
    private const val SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreGpnbW5tYXhzd3BuYmNpbWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEwOTMsImV4cCI6MjA5ODQ0NzA5M30.ikaTjYGKJdTfiskXigmWqHOJAPUXPMv2heWmH6SPdh8"

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
