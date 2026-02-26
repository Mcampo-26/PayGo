// src/app/api/payments/create-qr/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  console.log("--- 🆕 INICIANDO GENERACIÓN DE QR (PRODUCCIÓN) ---");
  
  try {
    const body = await req.json();
    const { amount, userId } = body;

    // Log para verificar que el frontend manda datos correctos
    console.log(`📦 Datos recibidos: UserID: ${userId}, Monto: ${amount}`);

    // En producción usamos la URL de Vercel. 
    // Asegúrate de que esta variable sea https://pay-go-one.vercel.app en tu panel de Vercel
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    console.log(`🌐 Usando BASE_URL: ${baseUrl}`);

    if (!baseUrl) {
      console.error("⚠️ ALERTA: NEXT_PUBLIC_BASE_URL no está definida. Mercado Pago no sabrá a dónde avisar.");
    }

    const orderData = {
      // Usamos el userId y el tiempo para que la referencia sea única
      external_reference: `${userId}|${Date.now()}`, 
      title: "Recarga de Energía Pay Go",
      description: `Carga de crédito para usuario: ${userId}`,
      // IMPORTANTE: Esta es la URL que Mercado Pago llamará cuando el usuario pague
      notification_url: `${baseUrl}/api/payments/mercadopago/webhook`,
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

    console.log("📨 Enviando orden a Mercado Pago con URL de notificación:", orderData.notification_url);

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