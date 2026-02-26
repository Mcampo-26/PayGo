import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import axios from 'axios';

export async function POST(req: Request) {
  // 1. Inicializamos Pusher ADENTRO para asegurar que lea las variables de Vercel
  const pusher = new Pusher({
    appId: String(process.env.PUSHER_APP_ID).trim(),
    key: String(process.env.PUSHER_KEY).trim(),
    secret: String(process.env.PUSHER_SECRET).trim(),
    cluster: String(process.env.PUSHER_CLUSTER).trim(),
    useTLS: true,
  });

  console.log("--- 📥 NUEVA NOTIFICACIÓN DE MP RECIBIDA ---");

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type') || searchParams.get('topic');

    console.log(`🔍 Metadata -> ID: ${id}, Type: ${type}`);

    if (id && (type === 'payment' || !type || type === 'merchant_order')) {
      console.log("🚀 Buscando detalles en la API de Mercado Pago...");
      
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` },
      });

      const paymentData = response.data;
      console.log("📄 Estado del pago:", paymentData.status);

      const externalReference = paymentData.external_reference || "";
      const userId = externalReference.split('|')[0];

      if (userId && paymentData.status === 'approved') {
        const amountToDeliver = Number(paymentData.transaction_amount) / 10;
        
        console.log(`📡 Intentando Pusher: user-${userId} | kWh: ${amountToDeliver}`);

        // 2. Disparamos el evento
        await pusher.trigger(`user-${userId}`, 'payment-success', {
          amount: amountToDeliver,
        });

        console.log("✅ Pusher enviado con éxito.");
        return NextResponse.json({ status: 'ok' });
      } else {
        console.log(`ℹ️ Pago ${id} en estado: ${paymentData.status}. No se acredita aún.`);
        return NextResponse.json({ status: 'pending', detail: paymentData.status });
      }
    }

    return NextResponse.json({ message: "Evento recibido pero no es un pago final" });

  } catch (error: any) {
    // Si Axios da 404, es que MP mandó un ID de orden que no es pago, lo ignoramos
    if (error.response?.status === 404) {
      console.log("ℹ️ Notificación de orden recibida (ignorando hasta que sea pago).");
      return NextResponse.json({ message: "Merchant order ignored" });
    }

    // Capturamos el error 400 de Pusher o cualquier otro
    const errorMsg = error.response?.data || error.message;
    console.error("❌ ERROR FATAL EN WEBHOOK:", errorMsg);
    
    return NextResponse.json({ error: "Fail", details: errorMsg }, { status: 500 });
  }
}