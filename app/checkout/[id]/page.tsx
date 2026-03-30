"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../_components/CheckoutForm";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CustomCheckoutPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Busca produto e gera Client Secret
  const startCheckout = async () => {
    const res = await fetch("/api/checkout/custom", {
      method: "POST",
      body: JSON.stringify({ productId: params.id, customerEmail: email, customerName: name }),
    });
    const data = await res.json();
    setClientSecret(data.clientSecret);
  };

  useEffect(() => {
    fetch(`/api/products/public/${params.id}`).then(res => res.json()).then(setProduct);
  }, [params.id]);

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col lg:flex-row font-sans">
      {/* Esquerda: Review do Produto */}
      <div className="flex-1 p-8 lg:p-20 bg-[#0d0d0d] border-r border-white/5">
        <div className="max-w-md mx-auto">
          <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 border border-white/10">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-400">{product.description}</p>
        </div>
      </div>

      {/* Direita: Checkout */}
      <div className="flex-1 p-8 lg:p-20">
        <div className="max-w-md mx-auto bg-[#111111] p-8 rounded-3xl border border-white/5">
          {!clientSecret ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-6">Dados de Acesso</h2>
              <input 
                placeholder="Seu Nome" 
                className="w-full bg-[#1a1a1a] p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500"
                onChange={(e) => setName(e.target.value)} 
              />
              <input 
                placeholder="Seu E-mail" 
                className="w-full bg-[#1a1a1a] p-4 rounded-xl border border-white/5 outline-none focus:border-emerald-500"
                onChange={(e) => setEmail(e.target.value)} 
              />
              <button 
                onClick={startCheckout}
                className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl mt-4"
              >
                Ir para o Pagamento
              </button>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#10b981' } } }}>
              <CheckoutForm amount={Number(product.price)} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}