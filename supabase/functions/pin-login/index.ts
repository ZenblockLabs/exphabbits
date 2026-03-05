import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id, pin } = await req.json()

    if (!user_id || !pin || typeof pin !== 'string' || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return new Response(JSON.stringify({ error: 'Invalid PIN format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check lockout status first
    const { data: pinRow } = await supabaseAdmin
      .from('user_pins')
      .select('failed_attempts, locked_until')
      .eq('user_id', user_id)
      .maybeSingle()

    if (pinRow?.locked_until && new Date(pinRow.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(pinRow.locked_until).getTime() - Date.now()) / 60000)
      return new Response(JSON.stringify({ 
        error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
        locked: true,
        locked_until: pinRow.locked_until,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the PIN (handles attempt tracking in DB function)
    const { data: isValid, error: verifyError } = await supabaseAdmin.rpc('verify_pin', {
      p_pin: pin,
      p_user_id: user_id,
    })

    if (verifyError || !isValid) {
      // Check updated attempts
      const { data: updated } = await supabaseAdmin
        .from('user_pins')
        .select('failed_attempts, locked_until')
        .eq('user_id', user_id)
        .maybeSingle()

      const attemptsLeft = updated ? 5 - updated.failed_attempts : 0
      
      if (updated?.locked_until) {
        return new Response(JSON.stringify({ 
          error: 'Too many failed attempts. Account locked for 15 minutes.',
          locked: true,
          locked_until: updated.locked_until,
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ 
        error: `Invalid PIN. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
        attempts_left: attemptsLeft,
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate session
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id)

    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    })

    if (linkError || !linkData) {
      return new Response(JSON.stringify({ error: 'Failed to generate session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { hashed_token } = linkData.properties

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      type: 'magiclink',
      token_hash: hashed_token,
    })

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ session: sessionData.session }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
