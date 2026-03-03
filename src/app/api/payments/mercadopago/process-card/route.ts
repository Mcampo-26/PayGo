import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function POST(req: Request) {
  const requestId = `req_${Date.now()}`;
  console.log(`[${requestId}] 🚀 INICIANDO PROCESAMIENTO DE TARJETA`);
  
  try {
    await dbConnect();
    const body = await req.json();
    
    const { token, transaction_amount, userId, payment_method_id, payer } = body;

    // 1. LOG DE ENTRADA (Ver qué manda el frontend/Brick)
    console.log(`[${requestId}] 📦 DATOS RECIBIDOS:`, {
      userId,
      amount: transaction_amount,
      method: payment_method_id,
      hasToken: !!token,
      payerEmail: payer?.email,
      hasIdentification: !!payer?.identification
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const notificationUrl = `${baseUrl}/api/payments/mercadopago/webhook`;
    const uniqueReference = `${userId}|${Date.now()}`;

    const mpPayload = {
      token,
      payment_method_id,
      transaction_amount: Number(transaction_amount),
      installments: 1,
      description: `Recarga PayGo - Usuario: ${userId}`,
      notification_url: notificationUrl,
      external_reference: uniqueReference,
      binary_mode: true,
      payer: { 
        email: payer?.email || 'test_user_123@test.com',
        identification: payer?.identification 
      },
    };

    // 2. LOG PRE-VUELO (Ver qué le vamos a disparar a MP)
    console.log(`[${requestId}] 📡 ENVIANDO A MERCADO PAGO:`, JSON.stringify(mpPayload, null, 2));

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
        'X-Idempotency-Key': uniqueReference,
      },
      body: JSON.stringify(mpPayload)
    });

    const data = await mpResponse.json();

    // 3. LOG DE RESPUESTA (Ver qué nos dice MP)
    if (!mpResponse.ok) {
      console.error(`[${requestId}] ❌ MERCADO PAGO RECHAZÓ EL PAGO:`, {
        status: mpResponse.status,
        errorData: data
      });
      return NextResponse.json({ error: "MP_ERROR", details: data }, { status: mpResponse.status });
    }

    console.log(`[${requestId}] ✅ PAGO EXITOSO:`, {
      paymentId: data.id,
      status: data.status,
      statusDetail: data.status_detail
    });

    return NextResponse.json(data);

  } catch (error: any) {
    console.error(`[${requestId}] 💥 ERROR CRÍTICO EN SERVIDOR:`, error.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  } finally {
    console.log(`[${requestId}] 🏁 FIN DEL PROCESO`);
  }
}