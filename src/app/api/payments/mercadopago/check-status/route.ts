// src/app/api/payments/mercadopago/check/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const oldBalance = searchParams.get('currentBalance'); // El saldo que el frontend tiene "congelado"

    if (!userId || oldBalance === null) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    await dbConnect();

    // Buscamos al usuario en la DB para ver su saldo real actual
    const user = await User.findById(userId).select('balance');

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Comparamos: Si el balance en DB es mayor al que el frontend recordaba... ¡PAGÓ!
    const hasPaid = user.balance > Number(oldBalance);

    return NextResponse.json({
      success: true,
      paid: hasPaid,
      newBalance: user.balance
    });

  } catch (error) {
    console.error('❌ Error en Check Status:', error);
    return NextResponse.json({ success: false, paid: false }, { status: 500 });
  }
}