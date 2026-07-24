#!/bin/bash
# Script para ejecutar la app en modo desarrollo con credenciales seguras.
# 1. Copia este archivo como launch_dev.local.sh
# 2. Rellena las variables con tus valores reales
# 3. NUNCA commitees launch_dev.local.sh

flutter run \
  --dart-define=SUPABASE_URL=https://kkxjgmnmaxswpnbcimld.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreGpnbW5tYXhzd3BuYmNpbWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEwOTMsImV4cCI6MjA5ODQ0NzA5M30.ikaTjYGKJdTfiskXigmWqHOJAPUXPMv2heWmH6SPdh8
