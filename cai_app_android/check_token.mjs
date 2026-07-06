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
    
    // 1. Sign Up
    const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password })
    })
    const signupData = await signupRes.json()
    
    const sessionToken = signupData.session?.access_token || signupData.access_token
    
    if (sessionToken) {
        const parts = sessionToken.split('.')
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
        console.log("JWT Payload:", payload)
    }
}

emulateRegister()
