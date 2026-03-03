import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_API_KEY}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: `Carga de Saldo PayGo - Usuario: ${userId}`,
            unit_price: Number(amount),
            quantity: 1,
            currency_id: 'ARS',
          }
        ],
        external_reference: userId.toString(),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mercadopago/webhook`,
      }),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) return NextResponse.json({ error: data.message }, { status: 400 });

    // Devolvemos el init_point que es la URL a la que el usuario debe ir
    return NextResponse.json({ init_point: data.init_point });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}