const supabaseUrl = 'https://fhugnuhatzcepvhnacsm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as'

const baseHeaders = {
    'apikey': supabaseKey,
    'Content-Type': 'application/json'
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function emulateFullFlow() {
    const ts = Date.now()
    const leaderEmail = 'cgiron@superxtra.com'
    const leaderPassword = 'Kris3289'
    
    console.log("==========================================")
    console.log(" PASO 1: LOGIN DEL LÍDER EXISTENTE")
    console.log("==========================================")
    const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ email: leaderEmail, password: leaderPassword })
    })
    const loginData = await loginRes.json()
    const leaderToken = loginData.access_token
    const leaderId = loginData.user.id
    
    // Obtener equipo del líder
    const leaderUserRes = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${leaderId}&select=equipo_id`, {
        headers: { ...baseHeaders, 'Authorization': `Bearer ${leaderToken}` }
    })
    const leaderUserData = await leaderUserRes.json()
    const leaderEquipoId = leaderUserData[0]?.equipo_id
    console.log(`Líder ${leaderEmail} (ID: ${leaderId}) ingresó con éxito.`)
    console.log(`Equipo del Líder: ${leaderEquipoId}`)
    
    
    console.log("\n==========================================")
    console.log(" PASO 2: REGISTRO DE NUEVO DISCÍPULO")
    console.log("==========================================")
    const discipleEmail = `disciple_${ts}@example.com`
    const disciplePassword = `Pass1234`
    
    const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ email: discipleEmail, password: disciplePassword })
    })
    const signupData = await signupRes.json()
    const discipleToken = signupData.session?.access_token || signupData.access_token
    const discipleId = signupData.user?.id || signupData.id
    console.log(`Discípulo creado en Auth con ID: ${discipleId}`)
    
    const discipleHeaders = { ...baseHeaders, 'Authorization': `Bearer ${discipleToken}` }
    
    const usuarioInsert = {
        id: discipleId,
        email: discipleEmail,
        nombre_completo: `Discípulo Total ${ts}`,
        username: `disciple_${ts}`,
        cedula: `8-888-${Math.floor(Math.random()*1000)}`,
        equipo_lider_id: leaderEquipoId, // Se asigna al equipo del líder
        red_asignada_id: "3dfa8ee7-ef2b-4e02-a368-4c0f920670ff",
        nivel: 1,
        plan_felipe: true,
        capacitacion: "Ninguna",
        ministerio: "Ninguno",
        pendiente_aprobacion: true,
        whatsapp: "60000000",
        direccion: "Direccion"
    }
    
    const userRes = await fetch(`${supabaseUrl}/rest/v1/usuarios`, {
        method: 'POST',
        headers: { ...discipleHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(usuarioInsert)
    })
    const userData = await userRes.json()
    console.log("Perfil insertado en public.usuarios (pendiente_aprobacion=true)")
    
    // Notificar al líder
    await fetch(`${supabaseUrl}/rest/v1/notificaciones`, {
        method: 'POST',
        headers: discipleHeaders,
        body: JSON.stringify({
            usuario_id: leaderId,
            mensaje: `El usuario Discípulo Total ${ts} se ha registrado en tu célula y requiere aprobación.`
        })
    })
    console.log("Notificación enviada al líder.")
    
    await sleep(1000)
    
    console.log("\n==========================================")
    console.log(" PASO 3: APROBACIÓN POR PARTE DEL LÍDER")
    console.log("==========================================")
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${discipleId}`, {
        method: 'PATCH',
        headers: { ...baseHeaders, 'Authorization': `Bearer ${leaderToken}`, 'Prefer': 'return=representation' },
        body: JSON.stringify({ pendiente_aprobacion: false })
    })
    const patchData = await patchRes.json()
    console.log(`Líder actualizó perfil del discípulo. pendiente_aprobacion = ${patchData[0].pendiente_aprobacion}`)
    
    
    await sleep(1000)
    
    console.log("\n==========================================")
    console.log(" PASO 4: APERTURA DE CÉLULA (DISCÍPULO)")
    console.log("==========================================")
    // Se asume que el discípulo usará el equipo de su líder para la apertura (así está en el app si aún no tiene equipo)
    const celulaId = crypto.randomUUID()
    const newCelula = {
        id: celulaId,
        lider_id: discipleId,
        equipo_id: leaderEquipoId,
        zona: "Zona Central",
        direccion: "Casa del Discípulo",
        categoria: "General",
        fecha_apertura: new Date().toISOString()
    }
    const celulaRes = await fetch(`${supabaseUrl}/rest/v1/celulas`, {
        method: 'POST',
        headers: { ...discipleHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(newCelula)
    })
    const celulaData = await celulaRes.json()
    console.log(`Célula creada exitosamente! ID: ${celulaData[0].id}`)
    
    await sleep(1000)
    
    console.log("\n==========================================")
    console.log(" PASO 5: ENVÍO DE INFORME (CELUGRAMA)")
    console.log("==========================================")
    const informe = {
        lider_id: discipleId,
        lider_celula_id: discipleId,
        nombre_celula: "Zona Central",
        lugar: "Casa del Discípulo",
        estado: "enviado",
        fecha_reunion: new Date().toISOString(),
        nuevos_convertidos: 2,
        visitas: 1,
        asistencia_total: 5,
        ofrenda: 15.5,
        uso_bosquejo: true,
        tema_tratado: "La Fe"
    }
    const informeRes = await fetch(`${supabaseUrl}/rest/v1/informes_celula`, {
        method: 'POST',
        headers: { ...discipleHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(informe)
    })
    const informeData = await informeRes.json()
    const informeId = informeData[0].id
    console.log(`Celugrama enviado con éxito! ID: ${informeId}`)
    
    console.log("Enviando Asistencia...");
    // Create an asistente first
    const asistente = {
        lider_id: discipleId,
        nombre: "Juan Perez (Test Asistente)",
        cedula: "8-888-8888",
        telefono: "6666-6666",
        sexo: "M"
    };
    const asistenteRes = await (await fetch(`${supabaseUrl}/rest/v1/asistentes_celula`, {
        method: 'POST',
        headers: { ...discipleHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(asistente)
    })).json();
    
    const asistenteId = asistenteRes[0].id;
        
    const asistencia = {
        informe_id: informeId,
        asistente_id: asistenteId,
        asistio: true,
        created_at: new Date().toISOString()
    };
    await fetch(`${supabaseUrl}/rest/v1/asistencia_reunion`, {
        method: 'POST',
        headers: { ...discipleHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(asistencia)
    });
    console.log("Registro de asistencia enviado con éxito!");
    
    console.log("\n==========================================")
    console.log(" EMULACIÓN FINALIZADA CORRECTAMENTE ")
    console.log("==========================================")
    
    // Devolver los IDs creados para buscarlos en SQL (Dashboard)
    console.log(`\nVALORES PARA EL DASHBOARD:`)
    console.log(`Discípulo Email: ${discipleEmail}`)
    console.log(`Célula ID: ${celulaId}`)
    console.log(`Informe ID: ${informeId}`)
}

emulateFullFlow()
