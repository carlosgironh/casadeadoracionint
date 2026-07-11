#!/bin/bash
# Script para ejecutar la app en modo desarrollo con credenciales seguras.
# 1. Copia este archivo como launch_dev.local.sh
# 2. Rellena las variables con tus valores reales
# 3. NUNCA commitees launch_dev.local.sh

flutter run \
  --dart-define=SUPABASE_URL=https://fhugnuhatzcepvhnacsm.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=REEMPLAZA_CON_LA_NUEVA_CLAVE_ROTADA
