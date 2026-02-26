import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  console.log("--- 💳 INICIANDO GENERACIÓN DE PAGO DÉBITO ---");
  
  try {
    const body = await req.json();
    const { amount, dni } = body; // Usamos dni como userId

    console.log(`📦 Datos recibidos: DNI: ${dni}, Monto: ${amount}`);

    // Usamos la URL de NGROK que tenés en el .env
    const baseUrl = process.env.NGR || process.env.NEXT_PUBLIC_BASE_URL;
    
    console.log(`🌐 Usando BASE_URL para Webhook: ${baseUrl}`);

    // Configuración de la Preferencia (Checkout Pro)
    const preferenceData = {
      items: [
        {
          title: "Recarga de Energía Pay Go",
          unit_price: Number(amount),
          quantity: 1,
          currency_id: "ARS",
        },
      ],
      payer: {
        email: "test_user_654321@testuser.com", // Email de prueba
        identification: {
          type: "DNI",
          number: dni.toString()
        }
      },
      external_reference: dni.toString(),
      // Aquí es donde Mercado Pago enviará el aviso
      notification_url: `${baseUrl}/api/payments/mercadopago/webhook`,
      back_urls: {
        success: `${baseUrl}/dashboard`,
        failure: `${baseUrl}/dashboard`,
        pending: `${baseUrl}/dashboard`,
      },
      auto_return: "approved",
      binary_mode: true, // Solo acepta pagos aprobados o rechazados (ideal para débito)
    };

    console.log("📨 Enviando preferencia a Mercado Pago...");

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

    console.log("✅ MP Respondió con éxito. ID:", response.data.id);

    // Retornamos el init_point para que el frontend abra la ventana de pago
    return NextResponse.json({
      init_point: response.data.init_point
    });

  } catch (error: any) {
    const errorDetail = error.response?.data || error.message;
    console.error("❌ ERROR EN CREATE-DEBIT:", JSON.stringify(errorDetail, null, 2));
    
    return NextResponse.json(
      { error: "Error al generar el pago", details: errorDetail },
      { status: 500 }
    );
  } finally {
    console.log("--- 🏁 FIN DE PROCESO CREATE-DEBIT ---");
  }
}