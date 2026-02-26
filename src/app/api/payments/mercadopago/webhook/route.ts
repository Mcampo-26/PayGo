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
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type');

    console.log(`🔍 Metadata -> ID: ${id}, Type: ${type}`);

    if (type === 'payment' && id) {
      console.log("🚀 Buscando detalles en la API de Mercado Pago...");
      
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` },
      });

      const paymentData = response.data;
      console.log("📄 Estado del pago:", paymentData.status);
      console.log("🔗 External Reference:", paymentData.external_reference);

      const userId = paymentData.external_reference?.split('|')[0];
      
      if (userId && paymentData.status === 'approved') {
        console.log(`📡 Intentando gritar a Pusher canal: user-${userId}`);
        
        await pusher.trigger(`user-${userId}`, 'payment-success', {
          amount: paymentData.transaction_amount / 10,
        });

        console.log("✅ Pusher enviado con éxito.");
        return NextResponse.json({ status: 'ok' });
      } else {
        console.log("⚠️ El pago no está aprobado o no tiene userId.");
      }
    }

    return NextResponse.json({ message: "Evento no procesable" });
  } catch (error: any) {
    console.error("❌ ERROR FATAL EN WEBHOOK:", error.response?.data || error.message);
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}