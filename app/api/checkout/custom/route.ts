import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, customerEmail, customerName } = await req.json();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    // 1. Criar o PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(product.price) * 100),
      currency: "brl",
      receipt_email: customerEmail,
      metadata: { productId: product.id, customerName },
    });

    // 2. Criar a ordem PENDING
    await prisma.order.create({
      data: {
        productId: product.id,
        amount: product.price,
        customerEmail,
        customerName: customerName || "Cliente",
        stripeSessionId: paymentIntent.id, // Usamos o ID do Intent para rastrear
        status: "PENDING",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}