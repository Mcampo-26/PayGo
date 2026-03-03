import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function POST(req: Request) {
  console.log("---------------------------------------------------------");
  console.log("🚀 [BACKEND] RECIBIENDO SOLICITUD DE PAGO CON TARJETA");
  
  try {
    await dbConnect();
    const body = await req.json();
    
    // Extraemos los datos que envía el Brick de MP
    const { token, transaction_amount, userId, payment_method_id, payer } = body;

    console.log("📦 DATOS RECIBIDOS DEL FRONTEND:");
    console.log("   - User ID (DNI):", userId);
    console.log("   - Monto:", transaction_amount);
    console.log("   - Payment Method:", payment_method_id);
    console.log("   - Token de Tarjeta:", token ? "GENERADO (OK)" : "FALTANTE (ERROR)");
    console.log("   - Email Payer:", payer?.email);

    // Configuración de la URL de notificación
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const notificationUrl = `${baseUrl}/api/payments/mercadopago/webhook`;

    console.log("📡 ENVIANDO PETICIÓN A MERCADO PAGO...");
    console.log("   - URL Notificación:", notificationUrl);

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
        'X-Idempotency-Key': `card_${Date.now()}_${userId}`, // Clave única para evitar duplicados
      },
      body: JSON.stringify({
        token,
        payment_method_id,
        transaction_amount: Number(transaction_amount),
        installments: 1,
        description: `Recarga PayGo - Usuario: ${userId}`,
        notification_url: notificationUrl,
        payer: { 
          email: payer?.email || 'test_user@test.com' 
        },
        external_reference: userId.toString(),
      })
    });

    const data = await mpResponse.json();

    // LOG DE LA RESPUESTA CRUDA DE MERCADO PAGO
    console.log("---------------------------------------------------------");
    console.log("📥 [RESPUESTA CRUDA DE MERCADO PAGO]:");
    console.log(JSON.stringify(data, null, 2));
    console.log("---------------------------------------------------------");

    if (!mpResponse.ok) {
      console.error("❌ MERCADO PAGO RECHAZÓ LA PETICIÓN:");
      console.error("   - Status HTTP:", mpResponse.status);
      console.error("   - Error Code:", data.error || data.message);
      return NextResponse.json({ 
        error: "Error en la API de Mercado Pago", 
        details: data 
      }, { status: mpResponse.status });
    }

    console.log("✅ PAGO PROCESADO EXITOSAMENTE");
    console.log("   - ID de Pago:", data.id);
    console.log("   - Estado Final:", data.status);
    console.log("   - Detalle del Estado:", data.status_detail);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("💥 ERROR CRÍTICO EN EL SERVIDOR:");
    console.error("   - Mensaje:", error.message);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message }, 
      { status: 500 }
    );
  } finally {
    console.log("🏁 [FIN DEL PROCESO DE TARJETA]");
    console.log("---------------------------------------------------------");
  }
}