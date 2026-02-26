import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, dni } = await req.json();
    
    // 1. Forzamos limpieza de URL y Token
  
    const cleanBaseUrl =  process.env.NEXT_PUBLIC_BASE_URL// Quitamos barra final si existe
    const token = process.env.MERCADOPAGO_API_KEY?.trim(); // Limpiamos espacios

    console.log("------------------------------------------");
    console.log("📡 ENVIANDO A MP CON:");
    console.log("Base URL:", cleanBaseUrl);
    console.log("Token OK?:", !!token);
    console.log("------------------------------------------");

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
             },
      body: JSON.stringify({
        items: [{
          title: "Carga de Energía PayGo",
          quantity: 1,
          unit_price: Number(amount),
          currency_id: "ARS",
        }],
        payer: {
          email: "test_user_654321@testuser.com",
          identification: { type: "DNI", number: dni.toString() }
        },
        external_reference: dni.toString(),
        back_urls: {
          success: cleanBaseUrl,
          failure: cleanBaseUrl,
        },
        // PRUEBA DE ORO: Si sigue fallando, comentá la línea de abajo
        notification_url: `${cleanBaseUrl}/api/payments/mercadopago/webhook`,
        auto_return: "approved",
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ ERROR CRUDO RECIBIDO:");
      console.log(errorText); // <--- ESTO ES LO QUE NECESITO QUE ME PASES

      return NextResponse.json({ 
        error: "MP_REJECTED", 
        detail: errorText.substring(0, 500) 
      }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ init_point: data.init_point });

  } catch (error: any) {
    console.error("❌ ERROR FATAL:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}