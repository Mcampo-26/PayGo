import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import axios from 'axios';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  // 1. Inicialización de Pusher con limpieza de strings
  const pusher = new Pusher({
    appId: "2120337",
    key: "abf1a0a3861e4784150d",
    secret: "f2191d7963af812edb03",
    cluster: "sa1",
    useTLS: true,
  });

  console.log("--- 📥 NUEVA NOTIFICACIÓN DE MP RECIBIDA ---");

  try {
    const { searchParams } = new URL(req.url);
    // Priorizamos data.id que es lo que manda el QR nuevo
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type') || searchParams.get('topic');

    console.log(`🔍 Metadata recibida -> ID: ${id}, Type: ${type}`);

    // Solo procesamos si el tipo es pago o no viene tipo (pasa en algunos eventos de MP)
    if (id && (type === 'payment' || !type || type === 'payment.created')) {
      console.log(`🚀 Consultando detalles del pago ${id} en Mercado Pago...`);
      
      
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` },
      });

      const paymentData = response.data;
      console.log("📄 Estado del pago:", paymentData.status);

      // Extraemos el DNI del external_reference (ej: "12345678|17123456")
      const externalReference = paymentData.external_reference || "";
      const userId = externalReference.split('|')[0]; 

      if (userId && paymentData.status === 'approved') {
        const amountPaid = Number(paymentData.transaction_amount);
        const kwhToAdd = amountPaid / 10;
        console.log("📄 Estado real en MP:", paymentData.status);
        console.log("📄 External Reference recibida:", paymentData.external_reference);
  
        const userId = paymentData.external_reference?.split('|')[0];
        console.log("🆔 UserID extraído:", userId);
  
        if (userId && paymentData.status === 'approved') {
            console.log("🟢 CONDICIÓN CUMPLIDA: Iniciando acreditación...");
            // ... resto del código de DB y Pusher
        } else {
            console.log("🔴 CONDICIÓN NO CUMPLIDA:");
            if (!userId) console.log("- Falta userId");
            if (paymentData.status !== 'approved') console.log("- El estado no es approved, es:", paymentData.status);
        }
        console.log(`📡 Intentando acreditar: User-${userId} | kWh: ${kwhToAdd}`);


        // --- 2. ACTUALIZACIÓN EN BASE DE DATOS ---
        try {
          await dbConnect();
          
          // Filtro de seguridad: Solo actualiza si este ID de pago NO fue el último procesado
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
            console.log(`🗄️ Resultado DB: Saldo incrementado con éxito.`);
          } else {
            console.log(`ℹ️ DB: El pago ${id} ya había sido procesado anteriormente o el usuario no existe.`);
          }
        } catch (dbErr) {
          console.error("❌ Error actualizando MongoDB:", dbErr);
          // Continuamos para intentar notificar por Pusher de todos modos
        }

        // --- 3. NOTIFICACIÓN EN TIEMPO REAL (Pusher) ---
        try {
          console.log("📡 Disparando Pusher...");
          // Debug de seguridad para detectar el error 401
          console.log(`🔑 Debug Pusher -> AppID: ${process.env.PUSHER_APP_ID?.slice(0,3)}... | Cluster: ${process.env.PUSHER_CLUSTER}`);

          await pusher.trigger(`user-${userId}`, 'payment-success', {
            amount: kwhToAdd,
          });
          
          console.log("✅ Pusher enviado con éxito.");
        } catch (pusherError: any) {
          console.error("❌ ERROR ESPECÍFICO DE PUSHER (401 = Credenciales/Cluster incorrectos):");
          console.error("Status:", pusherError.status);
          console.error("Mensaje:", pusherError.message);
        }

        console.log("✅ Proceso completado satisfactoriamente.");
        return NextResponse.json({ status: 'ok' });

      } else {
        console.log(`ℹ️ Pago ${id} no aprobado o sin UserID. Estado: ${paymentData.status}`);
        return NextResponse.json({ status: 'ignored' });
      }
    }

    // Caso para merchant_order u otros eventos
    return NextResponse.json({ message: "Notificación recibida pero no procesable como pago aprobado" });

  } catch (error: any) {
    // Manejo de errores de Axios (cuando MP manda IDs que no son de pagos)
    if (error.response?.status === 404) {
      console.log("ℹ️ El ID recibido no se encontró como pago. Ignorando...");
      return NextResponse.json({ message: "Not a payment" });
    }

    console.error("❌ ERROR GENERAL EN WEBHOOK:", error.message);
    // Respondemos 200 siempre para evitar que Mercado Pago reintente infinitamente
    return NextResponse.json({ error: "Fail but acknowledged" }, { status: 200 }); 
  }
}