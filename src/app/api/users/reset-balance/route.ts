import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { dni } = await req.json();

    if (!dni) return NextResponse.json({ error: "DNI requerido" }, { status: 400 });

    await dbConnect();

    // Ponemos el balance en 0 en la base de datos
    const updatedUser = await User.findOneAndUpdate(
      { dni: dni },
      { $set: { balance: 0 } },
      { new: true }
    );

    return NextResponse.json({ message: "Balance reseteado", balance: 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}