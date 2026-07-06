const supabaseUrl = 'https://fhugnuhatzcepvhnacsm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as'

const baseHeaders = {
    'apikey': supabaseKey,
    'Content-Type': 'application/json'
}

async function signUpAndInsert(email, password, nombreCompleto, username, cedula, equipoLiderId, redId) {
    console.log(`\n--- Registrando nuevo discípulo: ${nombreCompleto} ---`)
    const headers = { ...baseHeaders }
    
    // 1. Sign Up
    const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password })
    })
    const signupData = await signupRes.json()
    
    const sessionToken = signupData.session?.access_token || signupData.access_token
    if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`
    
    const userId = signupData.user?.id || signupData.id
    if (!userId) return null
    
    console.log(`Usuario creado en Auth con ID: ${userId}`)
    
    // 2. Insert into usuarios
    const usuarioInsert = {
        id: userId,
        email: email,
        nombre_completo: nombreCompleto,
        username: username,
        cedula: cedula,
        equipo_lider_id: equipoLiderId,
        red_asignada_id: redId,
        nivel: 1,
        plan_felipe: true,
        capacitacion: "Ninguna",
        ministerio: "Ninguno",
        pendiente_aprobacion: true,
        whatsapp: "60000000",
        direccion: "Direccion de prueba"
    }
    
    const userRes = await fetch(`${supabaseUrl}/rest/v1/usuarios`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(usuarioInsert)
    })
    const userData = await userRes.json()
    if (userData.error || userData.code) {
        console.error("Error insertando en usuarios:", userData.message || JSON.stringify(userData))
        return null
    }
    console.log("Discípulo registrado en public.usuarios (pendiente_aprobacion=true)")
    return userId
}

async function approveDisciple(leaderEmail, leaderPassword, discipleId) {
    console.log(`\n--- Líder (${leaderEmail}) intentando aprobar al discípulo ID: ${discipleId} ---`)
    
    // 1. Login as Leader
    const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ email: leaderEmail, password: leaderPassword })
    })
    const loginData = await loginRes.json()
    if (loginData.error) {
        console.error("Error login líder:", loginData.error_description)
        return
    }
    
    const leaderToken = loginData.access_token
    const headers = {
        ...baseHeaders,
        'Authorization': `Bearer ${leaderToken}`
    }
    
    // 2. Approve disciple (PATCH /rest/v1/usuarios?id=eq.DISCIPLE_ID)
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${discipleId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ pendiente_aprobacion: false })
    })
    
    const patchData = await patchRes.json()
    if (patchData.error || patchData.code) {
        console.error("Error aprobando discípulo (fallo RLS):", patchData.message || JSON.stringify(patchData))
        return
    }
    console.log("Discípulo aprobado con éxito! (pendiente_aprobacion = false)")
    
    // 3. Send Notification to disciple
    const notifRes = await fetch(`${supabaseUrl}/rest/v1/notificaciones`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            usuario_id: discipleId,
            mensaje: "¡Felicidades! Tu líder ha aprobado tu cuenta."
        })
    })
    if (notifRes.status === 201) {
         console.log("Notificación de aprobación enviada al discípulo.")
    } else {
         const notifData = await notifRes.json()
         if (notifData.error) console.error("Error notificación:", notifData.message)
         else console.log("Notificación de aprobación enviada al discípulo.")
    }
}

async function emulateAll() {
    const ts = Date.now()
    const redId = "3dfa8ee7-ef2b-4e02-a368-4c0f920670ff"
    
    // Eduardo Herrera's team ID
    const ehEquipoId = "6709c8cb-8ead-4f5d-823e-4906eea46540"
    
    // Test User's team ID
    const testEquipoId = "35b4417e-e1ab-4d8b-8459-b6edc1731f5f"
    
    // 1. Create a disciple under Eduardo Herrera
    const ehDiscipleId = await signUpAndInsert(
        `eh_disciple_${ts}@example.com`,
        `Pass1234`,
        `Discípulo Eduardo ${ts}`,
        `eh_disciple_${ts}`,
        `8-111-${Math.floor(Math.random()*1000)}`,
        ehEquipoId,
        redId
    )
    
    // 2. Approve the disciple using Eduardo Herrera's account
    if (ehDiscipleId) {
        await approveDisciple('cgiron@superxtra.com', 'Kris3289', ehDiscipleId)
    }
    
    // 3. Create a disciple under Test User
    const testDiscipleId = await signUpAndInsert(
        `test_disciple_${ts}@example.com`,
        `Pass1234`,
        `Discípulo Test ${ts}`,
        `test_disciple_${ts}`,
        `8-222-${Math.floor(Math.random()*1000)}`,
        testEquipoId,
        redId
    )
    
    // 4. Approve the disciple using Test User's account
    if (testDiscipleId) {
        await approveDisciple('testuser_1783210382658@example.com', 'TestPass123', testDiscipleId)
    }
}

emulateAll()
