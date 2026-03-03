import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    console.log("🔍 [API] Consultando saldo para DNI:", userId);

    if (!userId) {
      return NextResponse.json({ error: 'Falta el userId (DNI)' }, { status: 400 });
    }

    await dbConnect();

    // Buscamos el usuario en MongoDB
    const user = await User.findOne({ dni: userId });

    if (!user) {
      console.log("⚠️ [API] Usuario no encontrado, devolviendo saldo 0");
      return NextResponse.json({ balance: 0, status: 'DISCONNECTED' });
    }

    console.log("✅ [API] Saldo encontrado:", user.balance);

    return NextResponse.json({ 
      balance: user.balance,
      status: user.balance > 0 ? 'CONNECTED' : 'DISCONNECTED'
    });

  } catch (error: any) {
    console.error("💥 [API ERROR] get-balance:", error.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}