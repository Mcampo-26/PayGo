import dbConnect from '@/lib/mongodb';
import Meter from '@/models/Meter';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { dni } = await request.json();

    // Buscamos el medidor que tenga ese clientId (que es el DNI en nuestro seed)
    const meter = await Meter.findOne({ clientId: dni });

    if (!meter) {
      return NextResponse.json(
        { error: 'Usuario no encontrado. Verificá el DNI.' },
        { status: 404 }
      );
    }

    // Si lo encuentra, devolvemos los datos reales
    return NextResponse.json({
      success: true,
      user: {
        dni: meter.clientId,
        balance: meter.balance,
        status: meter.status,
        serial: meter.serialNumber
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}