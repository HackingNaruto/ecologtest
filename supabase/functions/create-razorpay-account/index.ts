import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("create-razorpay-account started")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { scraperId, businessName, email } = await req.json()

    if (!scraperId || !businessName || !email) {
      throw new Error("Missing required fields")
    }

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured")
    }

    // 1. Create Linked Account in Razorpay Route
    const auth = btoa(`${keyId}:${keySecret}`)
    const rzpResponse = await fetch('https://api.razorpay.com/v2/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        email: email,
        business_name: businessName,
        type: 'route'
      })
    })

    const rzpData = await rzpResponse.json()
    if (!rzpResponse.ok) {
      throw new Error(rzpData.error?.description || "Failed to create Razorpay account")
    }

    const razorpayAccountId = rzpData.id

    // 2. Update Supabase Database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Need service role to bypass RLS if needed
    )

    const { error: dbError } = await supabaseClient
      .from('scrapers')
      .update({ razorpay_account_id: razorpayAccountId })
      .eq('user_id', scraperId)

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ success: true, account_id: razorpayAccountId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
