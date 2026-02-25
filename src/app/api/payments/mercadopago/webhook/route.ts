import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Función auxiliar para extraer el DNI del external_reference (Igual a tu código de Ventas)
const getDniFromReference = (reference: string = "") => {
  return reference.includes("|") ? reference.split("|")[0] : reference;
};

export async function POST(req: Request) {
  console.log("--- 📥 WEBHOOK RECIBIDO ---");
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type') || searchParams.get('topic');
    
    // Solo procesamos si el tipo es 'payment'. 
    // Si es merchant_order, MP enviará luego otra notificación tipo payment.
    if (type !== 'payment' || !id) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    console.log(`🔍 Procesando Pago ID: ${id}`);

    // 1. Consultar datos del pago a Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_API_KEY}` }
    });

    if (!mpResponse.ok) return NextResponse.json({ status: 'error_mp' }, { status: 200 });
    
    const paymentData = await mpResponse.json();
    const { status, transaction_amount, external_reference } = paymentData;

    // 2. Solo actuar si está aprobado y tiene la referencia del usuario
    if (status === 'approved' && external_reference) {
      const userIdDni = getDniFromReference(external_reference);
      const kwh = transaction_amount / 200;

      await dbConnect();

      console.log(`⚡ Intentando acreditar ${kwh} kWh al DNI: "${userIdDni}"`);

      /** * CAMBIO CRÍTICO DE BÚSQUEDA:
       * Usamos una expresión regular para que la búsqueda sea insensible a espacios 
       * o errores de formato string.
       */
      const updatedUser = await User.findOneAndUpdate(
        { dni: { $regex: new RegExp(`^${userIdDni.trim()}$`, "i") } }, 
        { $inc: { balance: kwh } },
        { returnDocument: 'after' } // Equivalente al 'new: true' pero actualizado
      );

      if (updatedUser) {
        console.log(`✅ DB Actualizada. Nuevo balance: ${updatedUser.balance}`);
        
        // 3. Emitir por Socket (usando el objeto global)
        const io = (global as any).io;
        if (io) {
          console.log(`📢 Emitiendo socket a sala: ${userIdDni}`);
          io.to(userIdDni).emit('paymentSuccess', { 
            amount: kwh,
            newBalance: updatedUser.balance 
          });
        } else {
          console.error("❌ Socket.io no inicializado en global");
        }
      } else {
        // Si no lo encuentra por DNI, intentamos por _id por si acaso
        console.warn(`⚠️ No encontrado por DNI "${userIdDni}". Reintentando por _id...`);
        const userById = await User.findByIdAndUpdate(
          userIdDni,
          { $inc: { balance: kwh } },
          { returnDocument: 'after' }
        );
        
        if (!userById) {
          console.error(`❌ ERROR: El usuario con DNI o ID "${userIdDni}" no existe en la base de datos.`);
        } else {
          console.log(`✅ Encontrado por _id. Balance actualizado.`);
        }
      }
    } else {
      console.log(`ℹ️ Pago ${id} en estado: ${status}. No se acredita.`);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error: any) {
    console.error("❌ ERROR WEBHOOK:", error.message);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  } finally {
    console.log("--- 🏁 FIN ---");
  }
}