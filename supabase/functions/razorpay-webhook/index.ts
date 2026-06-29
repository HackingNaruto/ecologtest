import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Use a secure crypto library for HMAC verification in Deno (Web Crypto API)

console.log("razorpay-webhook started")

async function verifySignature(bodyText: string, signature: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  // Note: Deno doesn't have an easy hex hmac verifier out of the box like Node crypto.
  // Instead of importing external deps, we implement a quick check using HMAC SHA-256
  // Or we can rely on standard Web Crypto API:
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', hmacKey, encoder.encode(bodyText));
  const hexSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return hexSignature === signature;
}

serve(async (req) => {
  try {
    const signature = req.headers.get('x-razorpay-signature')
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      return new Response('Missing signature or secret', { status: 400 })
    }

    const bodyText = await req.text()
    
    const isValid = await verifySignature(bodyText, signature, webhookSecret)
    if (!isValid) {
      return new Response('Invalid signature', { status: 400 })
    }

    const payload = JSON.parse(bodyText)
    
    // Process successful payment
    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity
      const orderId = paymentEntity.order_id
      const paymentId = paymentEntity.id
      const amountPaise = paymentEntity.amount
      
      // We stored lotId in notes (from the frontend or order creation, but let's assume we can fetch it via order metadata if needed. Wait, in create order we didn't pass notes at the root level, only in transfers. Let's adjust order creation to pass notes at root too, or extract from transfers.
      // Assuming we get lot_id somehow or we pass it in notes at order level.
      const lotId = paymentEntity.notes?.lot_id
      
      if (lotId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Mark Lot as Sold
        await supabaseClient
          .from('scrap_lots')
          .update({ 
            status: 'sold',
            base_price: amountPaise / 100 // Final settled price
          })
          .eq('id', lotId)
          
        // 2. Log Transaction
        const amount = amountPaise / 100
        const platformFee = amount * 0.05
        const scraperAmount = amount - platformFee
        
        await supabaseClient
          .from('transactions')
          .insert({
            amount: amount,
            payment_status: 'paid',
            payment_method: 'razorpay',
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            platform_fee: platformFee,
            scraper_amount: scraperAmount,
            // Need to set scraper_id and recycler_id, could fetch from scrap_lot
          })
      }
    }

    return new Response('ok', { status: 200 })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
})
