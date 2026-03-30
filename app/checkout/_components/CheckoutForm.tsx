"use client";

import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

export default function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thanks`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "Erro no pagamento");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      
      {errorMessage && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{errorMessage}</div>}

      <button
        disabled={!stripe || loading}
        className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all flex justify-center items-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : <>Pagar R$ {amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</>}
      </button>
      
      <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] uppercase font-bold">
        <Lock size={12} /> Pagamento Processado pelo Stripe
      </div>
    </form>
  );
}