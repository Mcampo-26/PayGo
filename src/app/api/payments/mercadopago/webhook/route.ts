import { NextResponse } from 'next/server';
import Pusher from 'pusher';

// Configuramos Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type');

    if (type === 'payment' && id) {
      // 1. Buscás el pago en Mercado Pago (tu lógica de axios.get)
      // const payment = await axios.get(...)
      
      // Supongamos que ya tenés el 'userId' y el 'amount' del pago aprobado:
      const userId = "DNI_DEL_USUARIO"; // Esto lo sacás de external_reference
      const kwhAcreditados = 100; // Lo que calculás según el pago

      // 2. DISPARAR PUSHER (La magia para Vercel)
      await pusher.trigger(`user-${userId}`, 'payment-success', {
        amount: kwhAcreditados,
      });

      console.log(`✅ Evento enviado a Pusher para el usuario: ${userId}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    return NextResponse.json({ message: "No es un pago" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en Webhook:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}