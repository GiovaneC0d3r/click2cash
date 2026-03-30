import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não encontrada no .env");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia" as any, // Versão estável
  appInfo: {
    name: "Click2Cash",
    version: "1.0.0",
  },
});