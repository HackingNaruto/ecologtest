import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("create-razorpay-order started")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, scraperId, lotId } = await req.json()

    if (!amount || !scraperId || !lotId) {
      throw new Error("Missing required fields")
    }

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured")
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get Scraper's Razorpay Account ID
    const { data: scraper, error: scraperError } = await supabaseClient
      .from('scrapers')
      .select('razorpay_account_id')
      .eq('user_id', scraperId)
      .single()

    if (scraperError || !scraper?.razorpay_account_id) {
      throw new Error("Scraper does not have a linked Razorpay account")
    }

    // 2. Calculate Split (5% Platform, 95% Scraper)
    // Razorpay accepts amounts in paise (multiply by 100)
    const amountInPaise = Math.round(amount * 100)
    const platformFeePaise = Math.round(amountInPaise * 0.05)
    const scraperTransferPaise = amountInPaise - platformFeePaise

    // 3. Create Razorpay Order with Transfers
    const auth = btoa(`${keyId}:${keySecret}`)
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${lotId.substring(0,8)}`,
        notes: {
          lot_id: lotId
        },
        transfers: [
          {
            account: scraper.razorpay_account_id,
            amount: scraperTransferPaise,
            currency: 'INR',
            notes: {
              lot_id: lotId
            },
            on_hold: 0
          }
        ]
      })
    })

    const rzpData = await rzpResponse.json()
    if (!rzpResponse.ok) {
      throw new Error(rzpData.error?.description || "Failed to create Razorpay order")
    }

    return new Response(
      JSON.stringify({ 
        orderId: rzpData.id,
        amountInPaise,
        scraperAccountId: scraper.razorpay_account_id
      }),
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
