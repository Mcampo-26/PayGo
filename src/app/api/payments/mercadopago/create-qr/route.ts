import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  console.log("--- 🆕 INICIANDO GENERACIÓN DE QR ---");
  
  try {
    const body = await req.json();
    const { amount, userId } = body;

    console.log(`📦 Datos recibidos: UserID: ${userId}, Monto: ${amount}`);

    // Limpiamos la URL para evitar errores de barras dobles o faltantes
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  
    
    // IMPORTANTE: Aseguramos la barra "/" antes de "api"
    const notificationUrl = `${baseUrl}/api/payments/mercadopago/webhook`;

    const orderData = {
      external_reference: `${userId}|${Date.now()}`, 
      title: "Recarga de Energía Pay Go",
      description: `Carga de crédito para usuario: ${userId}`,
      notification_url: notificationUrl,
      total_amount: Number(amount),
      items: [
        {
          title: "Crédito de Energía",
          unit_price: Number(amount),
          quantity: 1,
          unit_measure: "unit",
          total_amount: Number(amount),
        },
      ],
      cash_out: { amount: 0 },
    };

    console.log("📨 URL de notificación enviada a MP:", orderData.notification_url);

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