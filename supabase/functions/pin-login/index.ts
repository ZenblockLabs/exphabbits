import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }
const MAX_FAILED_ATTEMPTS = 5

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id, pin } = await req.json()

    if (!user_id || !pin || typeof pin !== 'string' || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PIN_FORMAT', error: 'Invalid PIN format' }), {
        status: 400,
        headers: jsonHeaders,
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
      return new Response(
        JSON.stringify({
          success: false,
          code: 'PIN_LOCKED',
          error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
          locked: true,
          locked_until: pinRow.locked_until,
        }),
        {
          status: 200,
          headers: jsonHeaders,
        }
      )
    }

    // Verify the PIN (attempt tracking happens in DB function)
    const { data: isValid, error: verifyError } = await supabaseAdmin.rpc('verify_pin', {
      p_pin: pin,
      p_user_id: user_id,
    })

    if (verifyError) {
      return new Response(JSON.stringify({ success: false, code: 'VERIFY_FAILED', error: 'Failed to verify PIN' }), {
        status: 500,
        headers: jsonHeaders,
      })
    }

    if (!isValid) {
      const { data: updated } = await supabaseAdmin
        .from('user_pins')
        .select('failed_attempts, locked_until')
        .eq('user_id', user_id)
        .maybeSingle()

      if (updated?.locked_until) {
        return new Response(
          JSON.stringify({
            success: false,
            code: 'PIN_LOCKED',
            error: 'Too many failed attempts. Account locked for 15 minutes.',
            locked: true,
            locked_until: updated.locked_until,
          }),
          {
            status: 200,
            headers: jsonHeaders,
          }
        )
      }

      const failedAttempts = updated?.failed_attempts ?? 0
      const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts)

      return new Response(
        JSON.stringify({
          success: false,
          code: 'INVALID_PIN',
          error: `Invalid PIN. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
          attempts_left: attemptsLeft,
          locked: false,
        }),
        {
          status: 200,
          headers: jsonHeaders,
        }
      )
    }

    // Generate session
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id)

    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ success: false, code: 'USER_NOT_FOUND', error: 'User not found' }), {
        status: 200,
        headers: jsonHeaders,
      })
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    })

    if (linkError || !linkData) {
      return new Response(JSON.stringify({ success: false, code: 'SESSION_LINK_FAILED', error: 'Failed to generate session' }), {
        status: 500,
        headers: jsonHeaders,
      })
    }

    const { hashed_token } = linkData.properties

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      type: 'magiclink',
      token_hash: hashed_token,
    })

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ success: false, code: 'SESSION_CREATE_FAILED', error: 'Failed to create session' }), {
        status: 500,
        headers: jsonHeaders,
      })
    }

    return new Response(JSON.stringify({ success: true, session: sessionData.session }), {
      status: 200,
      headers: jsonHeaders,
    })
  } catch {
    return new Response(JSON.stringify({ success: false, code: 'INTERNAL_ERROR', error: 'Internal server error' }), {
      status: 500,
      headers: jsonHeaders,
    })
  }
})
