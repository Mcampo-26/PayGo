// src/app/api/payments/create-qr/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  console.log("--- 🆕 INICIANDO GENERACIÓN DE QR ---");
  
  try {
    const body = await req.json();
    const { amount, userId } = body;

    // Log para verificar que el frontend manda datos correctos
    console.log(`📦 Datos recibidos: UserID: ${userId}, Monto: ${amount}`);

    // Verificación de la URL de Ngrok
    const ngrokUrl = process.env.NGROK_URL;
    console.log(`🌐 Usando NGROK_URL: ${ngrokUrl}`);

    if (!ngrokUrl) {
      console.error("⚠️ ALERTA: NGROK_URL no está definida en el .env");
    }

    const orderData = {
      external_reference: `${userId}|${Date.now()}`, 
      title: "Recarga de Energía Pay Go",
      description: `Carga de crédito para usuario: ${userId}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mercadopago/webhook`,
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

    console.log("📨 Enviando orden a Mercado Pago con URL:", orderData.notification_url);

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

    console.log("✅ MP Respondió con éxito. ID de orden:", response.data.in_store_order_id);

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
    console.log("--- 🏁 FIN DE PROCESO CREATE-QR ---");
  }
}