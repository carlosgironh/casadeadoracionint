const supabaseUrl = 'https://fhugnuhatzcepvhnacsm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as'

const baseHeaders = {
    'apikey': supabaseKey,
    'Content-Type': 'application/json'
}

async function emulateCelugrama() {
    const leaderEmail = 'cgiron@superxtra.com'
    const leaderPassword = 'Kris3289'
    
    // 1. Login
    console.log("Haciendo login con", leaderEmail)
    const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ email: leaderEmail, password: leaderPassword })
    })
    const loginData = await loginRes.json()
    if (loginData.error) {
        console.error("Error login:", loginData.error_description)
        return
    }
    
    const token = loginData.access_token
    const userId = loginData.user.id
    console.log("Login exitoso. UserId:", userId)
    
    const headers = { ...baseHeaders, 'Authorization': `Bearer ${token}` }
    
    // 2. Fetch leader's equipo_id
    const userRes = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${userId}&select=equipo_id`, {
        headers
    })
    const userData = await userRes.json()
    const equipoId = userData[0]?.equipo_id
    console.log("Equipo ID:", equipoId)
    
    // 3. Emular Apertura de Célula
    const celulaId = crypto.randomUUID()
    const newCelula = {
        id: celulaId,
        lider_id: userId,
        equipo_id: equipoId,
        colider_id: null,
        zona: "Zona 1",
        direccion: "Dirección de Emulación",
        categoria: "General",
        fecha_apertura: new Date().toISOString()
    }
    
    console.log("\nEnviando Apertura de Célula...")
    const celulaRes = await fetch(`${supabaseUrl}/rest/v1/celulas`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(newCelula)
    })
    const celulaData = await celulaRes.json()
    if (celulaData.error || celulaData.code) {
        console.error("Error Apertura de Célula:", celulaData)
        return
    }
    console.log("Apertura de Célula Exitosa!")
    
    // 4. Emular Informe (Celugrama)
    const informe = {
        lider_id: userId,
        lider_celula_id: userId,
        nombre_celula: "Zona 1",
        lugar: "Dirección de Emulación",
        estado: "enviado",
        fecha_reunion: new Date().toISOString(),
        nuevos_convertidos: 0,
        visitas: 0,
        asistencia_total: 1,
        ofrenda: 0.0,
        uso_bosquejo: false,
        bosquejo_id: null,
        tema_manual: null,
        versiculo_manual: null,
        asistentes: [],
        tema_tratado: "Prueba"
    }
    
    console.log("\nEnviando Informe (Celugrama)...")
    const informeRes = await fetch(`${supabaseUrl}/rest/v1/informes_celula`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(informe)
    })
    const informeData = await informeRes.json()
    if (informeData.error || informeData.code) {
        console.error("Error Informe:", informeData)
        return
    }
    const informeId = informeData[0].id
    console.log("Informe enviado. ID:", informeId)
    
    // 5. Emular Asistencia Reunion
    const asistRecord = {
        informe_id: informeId,
        asistente_id: userId,
        asistio: true,
        created_at: new Date().toISOString()
    }
    console.log("\nEnviando Asistencia...")
    const asistRes = await fetch(`${supabaseUrl}/rest/v1/asistencia_reunion`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(asistRecord)
    })
    const asistData = await asistRes.json()
    if (asistData.error || asistData.code) {
        console.error("Error Asistencia:", asistData)
        return
    }
    console.log("Asistencia enviada con éxito!")
}

emulateCelugrama()
