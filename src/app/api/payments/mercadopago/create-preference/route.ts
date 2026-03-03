import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  console.log("--- 🆕 INICIANDO GENERACIÓN DE PREFERENCIA (CHECKOUT PRO) ---");

  try {
    const body = await req.json();
    const { amount, userId } = body;

    console.log(`📦 Datos recibidos: UserID: ${userId}, Monto: ${amount}`);

    // Mismo método de limpieza de URL que en tu archivo QR
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const notificationUrl = `${baseUrl}/api/payments/mercadopago/webhook`;

    const preferenceData = {
      items: [
        {
          id: "energia-paygo",
          title: "Recarga de Energía Pay Go",
          description: `Carga de crédito para usuario: ${userId}`,
          quantity: 1,
          currency_id: "ARS", // O la moneda de tu país
          unit_price: Number(amount),
        }
      ],
      // Referencia externa idéntica para facilitar el tracking en el Webhook
      external_reference: `${userId}|${Date.now()}`,
      notification_url: notificationUrl,
      back_urls: {
        success: `${baseUrl}/dashboard?status=success`,
        failure: `${baseUrl}/dashboard?status=failure`,
        pending: `${baseUrl}/dashboard?status=pending`,
      },
      auto_return: "approved",
      binary_mode: true, // No acepta pagos pendientes, solo aprobado o rechazado
    };

    console.log("📨 URL de notificación enviada a MP:", preferenceData.notification_url);

    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preferenceData,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ MP Generó Preferencia con éxito:", response.data.id);

    return NextResponse.json({
      id: response.data.id,
      init_point: response.data.init_point // Esta es la URL a la que redirigimos al usuario
    });

  } catch (error: any) {
    const errorDetail = error.response?.data || error.message;
    console.error("❌ ERROR EN CREATE-PREFERENCE:", JSON.stringify(errorDetail, null, 2));

    return NextResponse.json(
      { error: "Error al generar la preferencia", details: errorDetail },
      { status: 500 }
    );
  } finally {
    console.log("--- 🏁 FIN DE PROCESO CREATE-PREFERENCE ---");
  }
}