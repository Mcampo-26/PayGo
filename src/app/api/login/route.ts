import dbConnect from '@/lib/mongodb';
import Meter from '@/models/Meter';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await dbConnect();
  const { clientId } = await req.json();

  // Buscamos si el medidor existe para ese DNI
  const meter = await Meter.findOne({ clientId });

  if (!meter) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true, meter });
}