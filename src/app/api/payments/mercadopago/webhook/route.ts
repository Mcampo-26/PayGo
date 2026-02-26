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
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type');

    // Solo procesamos si es una notificación de pago
    if (type === 'payment' && id) {
      
      // 1. CONSULTAR EL PAGO REAL A MERCADO PAGO
      // Usamos el ID que nos mandó el webhook para traer los detalles
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
        },
      });

      const paymentData = response.data;

      // 2. EXTRAER EL DNI
      // Recordá que en create-qr pusimos: external_reference: `${userId}|${Date.now()}`
      const externalReference = paymentData.external_reference || "";
      const userId = externalReference.split('|')[0]; // Esto saca el DNI (ej: 12345678)
      
      const amount = paymentData.transaction_amount;
      const kwhAcreditados = amount / 10; // Tu regla de negocio

      if (userId) {
        // 3. DISPARAR PUSHER AL CANAL CORRECTO
        await pusher.trigger(`user-${userId}`, 'payment-success', {
          amount: kwhAcreditados,
        });

        console.log(`✅ Pago procesado. Usuario: ${userId}, kWh: ${kwhAcreditados}`);
        return NextResponse.json({ status: 'ok' }, { status: 200 });
      }
    }

    return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error en Webhook:", error.response?.data || error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}