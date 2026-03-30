import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, customerEmail, customerName } = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    // 1. Criar Checkout Session no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: product.name,
              images: product.image ? [product.image] : [],
            },
            unit_amount: Math.round(Number(product.price) * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${product.id}`,
      metadata: {
        productId: product.id,
        customerEmail,
      },
    });

    // 2. Criar Ordem PENDENTE no Banco
    await prisma.order.create({
      data: {
        productId: product.id,
        amount: product.price,
        customerEmail,
        customerName: customerName || "Cliente",
        stripeSessionId: session.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}