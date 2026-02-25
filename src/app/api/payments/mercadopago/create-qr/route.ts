import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  console.log("--- 🆕 INICIANDO GENERACIÓN DE QR EN PRODUCCIÓN ---");
  
  try {
    const body = await req.json();
    const { amount, userId } = body;

    console.log(`📦 Datos recibidos: DNI: ${userId}, Monto: ${amount}`);

    // Definimos la URL de notificación. 
    // Prioriza la variable de entorno de Vercel, si no existe usa la fija.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pay-go-one.vercel.app';
    const notificationUrl = `${baseUrl}/api/payments/mercadopago/webhook`;

    const orderData = {
      external_reference: `${userId}|${Date.now()}`, 
      title: "Recarga de Energía Pay Go",
      description: `Carga de crédito para usuario DNI: ${userId}`,
      notification_url: notificationUrl,
      total_amount: amount,
      items: [
        {
          title: "Crédito de Energía",
          unit_price: amount,
          quantity: 1,
          unit_measure: "unit",
          total_amount: amount,
        },
      ],
      cash_out: { amount: 0 },
    };

    console.log("📨 Enviando a MP con URL de notificación:", notificationUrl);

    // Validación de credenciales antes de disparar
    if (!process.env.COLLECTOR_ID || !process.env.EXTERNAL_POS_ID || !process.env.MERCADOPAGO_API_KEY) {
      throw new Error("Faltan credenciales de Mercado Pago en las variables de entorno");
    }

    const response = await axios.put(
      `https://api.mercadopago.com/instore/orders/qr/seller/collectors/${process.env.COLLECTOR_ID}/pos/${process.env.EXTERNAL_POS_ID}/qrs`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ QR Generado con éxito para producción");

    return NextResponse.json({
      qr_data: response.data.qr_data,
      order_id: response.data.in_store_order_id
    });

  } catch (error: any) {
    const errorDetail = error.response?.data || error.message;
    console.error("❌ ERROR EN CREATE-QR:", JSON.stringify(errorDetail, null, 2));
    
    return NextResponse.json(
      { error: "Error al generar el QR", details: errorDetail },
      { status: 500 }
    );
  } finally {
    console.log("--- 🏁 FIN DE PROCESO ---");
  }
}