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
    // 1. Obtener ID y Tipo (desde URL o Body)
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    
    const id = searchParams.get('data.id') || searchParams.get('id') || body?.data?.id;
    const type = searchParams.get('type') || searchParams.get('topic') || body?.type;

    console.log(`🔔 Webhook recibido: ID ${id}, Tipo ${type}`);

    // Solo procesamos si es un evento de pago
    if (id && (type === 'payment' || type === 'payment.created' || type === 'payment.updated')) {
      
      // 2. Consultar el estado real del pago en la API de Mercado Pago
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` },
      });

      const paymentData = response.data;

      // 3. Solo procesamos si el pago está aprobado
      if (paymentData.status === 'approved') {
        const dni = paymentData.external_reference; // DNI del usuario
        const amountPaid = Number(paymentData.transaction_amount);
        const paymentId = String(id);
        
        // 🔋 LÓGICA DE CONVERSIÓN: $1000 = 100 kWh
        const kwhToAdd = amountPaid / 10; 

        await dbConnect();

        /**
         * 🛡️ CANDADO DE SEGURIDAD (IDEMPOTENCIA)
         * Buscamos al usuario por DNI, pero SOLAMENTE si el paymentId no está en su lista de procesados.
         * Si el ID ya existe, modifiedCount será 0 y no se cargará saldo dos veces.
         */
        const result = await User.updateOne(
          { 
            dni: String(dni),
            processedPayments: { $ne: paymentId } // "Si este ID NO está en el array"
          },
          { 
            $inc: { balance: kwhToAdd },
            $push: { processedPayments: paymentId } // Guardamos el ID para quemarlo
          }
        );

        if (result.modifiedCount > 0) {
          // Si entramos acá, es la PRIMERA VEZ que procesamos este pago con éxito
          const updatedUser = await User.findOne({ dni: String(dni) });
          
          console.log(`✅ PAGO ÚNICO PROCESADO: DNI ${dni} recibió ${kwhToAdd} kWh. ID: ${paymentId}`);

          // 4. AVISAR AL FRONTEND VÍA PUSHER
          await pusher.trigger(`user-${dni}`, 'payment-success', {
            amount: kwhToAdd,
            newTotal: updatedUser?.balance || 0
          });

          return NextResponse.json({ status: 'ok' });
        } else {
          // Si modifiedCount es 0, puede ser porque el DNI no existe o el pago ya se procesó
          console.log(`⚠️ Aviso duplicado o usuario inexistente omitido. ID Pago: ${paymentId}`);
          return NextResponse.json({ status: 'already_processed_or_not_found' });
        }
      }
    }

    // Si el pago no está aprobado aún (ej: pending), respondemos 200 para que MP no reintente con error
    return NextResponse.json({ message: "Waiting for approval" }, { status: 200 });

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO WEBHOOK:", error.response?.data || error.message);
    // Respondemos 200 siempre para evitar que Mercado Pago se quede reintentando infinitamente
    return NextResponse.json({ error: "Fail handled" }, { status: 200 });
  }
}