import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // LOG PARA DEBUG (Veja no seu terminal se o evento está chegando)
  console.log("Evento recebido do Stripe:", event.type);

  // CASO 1: Checkout Padrão (Session)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    await updateOrderStatus(session.id);
  }

  // CASO 2: Checkout Custom (PaymentIntent) - ESSENCIAL PARA O NOVO FLUXO
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    await updateOrderStatus(paymentIntent.id);
  }

  return new Response(null, { status: 200 });
}

// Função auxiliar para evitar repetição de código
async function updateOrderStatus(stripeId: string) {
  try {
    const order = await prisma.order.update({
      where: { stripeSessionId: stripeId },
      data: { status: "PAID" },
    });
    console.log(`✅ Ordem ${order.id} marcada como PAGA.`);
  } catch (error) {
    console.error(`❌ Erro ao atualizar ordem com ID Stripe ${stripeId}:`, error);
  }
}