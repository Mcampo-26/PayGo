import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import axios from 'axios';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  const pusher = new Pusher({
    appId: String(process.env.PUSHER_APP_ID).trim(),
    key: String(process.env.PUSHER_KEY).trim(),
    secret: String(process.env.PUSHER_SECRET).trim(),
    cluster: String(process.env.PUSHER_CLUSTER).trim(),
    useTLS: true,
  });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type') || searchParams.get('topic');

    // 1. Ignoramos notificaciones que no sean pagos
    if (type === 'merchant_order') return NextResponse.json({ message: "Ignored" });
    if (!id) return NextResponse.json({ error: "No ID" }, { status: 400 });

    console.log(`--- 📥 PROCESANDO PAGO: ${id} ---`);

    // 2. Consultar detalles a Mercado Pago
    const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` },
    });

    const paymentData = response.data;
    const userId = paymentData.external_reference?.split('|')[0];

    // 3. Procesar solo si está aprobado y existe el usuario
    if (userId && paymentData.status === 'approved') {
      const amountPaid = Number(paymentData.transaction_amount);
      const kwhToAdd = amountPaid / 10;

      await dbConnect();

      // FILTRO ANTI-DUPLICADO: Solo actualiza si el pago no se procesó antes
      const updateResult = await User.updateOne(
        { 
          dni: String(userId), 
          lastProcessedPayment: { $ne: id } 
        },
        { 
          $inc: { balance: kwhToAdd },
          $set: { lastProcessedPayment: id } 
        }
      );

      if (updateResult.modifiedCount > 0) {
        console.log(`✅ ACREDITADO: ${kwhToAdd} kWh a User ${userId}`);

        // NOTIFICACIÓN PUSHER (Con el error de tipo corregido)
        try {
          await pusher.trigger(`user-${userId}`, 'payment-success', {
            amount: kwhToAdd,
          });
          console.log("📡 Pusher enviado con éxito.");
        } catch (pErr: any) {
          console.error("❌ Error en Pusher:", pErr.message || pErr);
        }
      } else {
        console.log(`⚠️ REPETIDO: El pago ${id} ya fue procesado.`);
      }

      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'pending' });

  } catch (error: any) {
    console.error("❌ ERROR WEBHOOK:", error.message);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}