import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Content Security Policy para el panel web
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // unsafe-inline necesario para Vite HMR en dev
  "style-src 'self' 'unsafe-inline'",  // unsafe-inline necesario para Tailwind
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // Permitir conexiones a Supabase (REST + WebSocket para realtime)
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://studio20.radiolize.com",
  "frame-ancestors 'none'", // Protección anti-clickjacking
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      'Content-Security-Policy': CSP,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
})
