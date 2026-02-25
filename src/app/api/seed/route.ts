import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Meter from '@/models/Meter';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  
  try {
    // Limpiamos colecciones para la prueba
    await User.deleteMany({});
    await Meter.deleteMany({});

    // 1. Creamos el Usuario con su DNI
    const newUser = await User.create({
      dni: "12345678",
      name: "Mauricio Admin",
      email: "admin@paygo.com"
    });

    // 2. Creamos el Medidor vinculado a ese Usuario (usando su _id)
    const newMeter = await Meter.create({
      owner: newUser._id,
      clientId: newUser.dni, // Usamos el DNI como clientId para el login
      serialNumber: "PG-2026-PRO",
      balance: 5000,
      status: 'CONNECTED'
    });

    return NextResponse.json({ 
      message: "¡Relación Usuario-Medidor creada!",
      user: newUser,
      meter: newMeter 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}