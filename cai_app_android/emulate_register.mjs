const supabaseUrl = 'https://fhugnuhatzcepvhnacsm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as'

let headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
}

async function emulateRegister() {
    const timestamp = Date.now()
    const email = `testuser_${timestamp}@example.com`
    const password = `TestPass123`
    const nombreCompleto = `Test User ${timestamp}`
    const username = `testuser_${timestamp}`
    const cedula = `8-000-${Math.floor(Math.random() * 10000)}`
    const equipoId = "7a0fd636-6b9a-4161-83da-084939cfe266" // Esposos Ashby
    const redId = "3dfa8ee7-ef2b-4e02-a368-4c0f920670ff"
    
    console.log(`1. Iniciando registro para ${email}...`)
    
    // 1. Sign Up
    const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password })
    })
    const signupData = await signupRes.json()
    
    if (signupData.error_code) {
        console.error("Error en Auth:", signupData.msg || signupData.error_description)
        return
    }
    
    // Auto-login active, so access_token is returned
    const sessionToken = signupData.session?.access_token || signupData.access_token
    if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`
    }
    
    const userId = signupData.user?.id || signupData.id
    if (!userId) {
        console.error("No se pudo obtener el userId después del signUp. Data:", signupData)
        return
    }
    
    console.log(`2. Usuario de Auth creado. ID: ${userId}`)
    
    // 2. Insert into usuarios
    const usuarioInsert = {
        id: userId,
        email: email,
        nombre_completo: nombreCompleto,
        username: username,
        cedula: cedula,
        equipo_lider_id: equipoId,
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
        headers: {
            ...headers,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(usuarioInsert)
    })
    
    const userData = await userRes.json()
    
    if (userData.error || userData.code) {
        console.error("Error insertando en usuarios:", userData.message || JSON.stringify(userData))
        return
    }
    console.log("3. Registro en public.usuarios insertado correctamente.")
    
    // 3. Find leaders
    const leadersRes = await fetch(`${supabaseUrl}/rest/v1/usuarios?equipo_id=eq.${equipoId}`, {
        method: 'GET',
        headers
    })
    const teamLeaders = await leadersRes.json()
    
    if (teamLeaders.error || teamLeaders.code) {
        console.error("Error buscando líderes:", teamLeaders.message)
    } else {
        const msg = `¡Un nuevo líder (${nombreCompleto}) se ha registrado bajo tu equipo y está pendiente de aprobación!`
        const notificaciones = teamLeaders.map(lider => ({
            usuario_id: lider.id,
            mensaje: msg
        }))
        
        if (notificaciones.length > 0) {
            const notifRes = await fetch(`${supabaseUrl}/rest/v1/notificaciones`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(notificaciones)
            })
            // Fetch may return 201 Created with no body if return=representation is missing or not honored
            if (notifRes.status === 201) {
                console.log(`4. Se enviaron ${notificaciones.length} notificaciones a los líderes.`)
            } else {
                const notifData = await notifRes.json()
                if (notifData.error || notifData.code) {
                    console.error("Error enviando notificaciones:", notifData.message)
                } else {
                    console.log(`4. Se enviaron ${notificaciones.length} notificaciones a los líderes.`)
                }
            }
        } else {
            console.log("4. No se encontraron líderes en este equipo para notificar.")
        }
    }
    
    console.log("¡Flujo de registro completado con éxito!")
}

emulateRegister()
