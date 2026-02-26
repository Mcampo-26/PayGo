import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import axios from 'axios'; // 👈 No te olvides de importar axios

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  console.log("--- 📥 NUEVA NOTIFICACIÓN DE MP RECIBIDA ---");
  
  try {
    const { searchParams } = new URL(req.url);
    
    // Intentamos sacar el ID de todos los lugares posibles que usa MP
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type') || searchParams.get('topic'); // Algunos usan 'topic'

    console.log(`🔍 Metadata -> ID: ${id}, Type: ${type}`);

    // Si el type es null pero tenemos un ID, igual vamos a intentar buscarlo como pago
    if (id && (type === 'payment' || !type)) {
      console.log("🚀 Buscando detalles del pago ID:", id);
      
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` },
      });

      const paymentData = response.data;
      console.log("📄 Estado del pago:", paymentData.status);

      const externalReference = paymentData.external_reference || "";
      const userId = externalReference.split('|')[0];
      
      if (userId && paymentData.status === 'approved') {
        const amountToDeliver = Number(paymentData.transaction_amount) / 10;
        
        console.log(`📡 Gritando a Pusher: user-${userId} | kWh: ${amountToDeliver}`);
        
        await pusher.trigger(`user-${userId}`, 'payment-success', {
          amount: amountToDeliver,
        });

        console.log("✅ Pusher enviado con éxito.");
        return NextResponse.json({ status: 'ok' });
      }
    }

    return NextResponse.json({ message: "Evento recibido pero no procesado" });
  } catch (error: any) {
    // Si da 404 es porque el ID no era de un pago (era una orden), lo ignoramos sin explotar
    if (error.response?.status === 404) {
        console.log("ℹ️ El ID no era un pago final, esperando notificación de pago...");
        return NextResponse.json({ message: "Order ignored" });
    }
    console.error("❌ ERROR FATAL EN WEBHOOK:", error.response?.data || error.message);
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}