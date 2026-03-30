"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client"; 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (error) {
      setStatus({ type: 'error', msg: error.message || "Erro ao solicitar reset." });
    } else {
      setStatus({ type: 'success', msg: "Link enviado! Verifique seu e-mail." });
    }
  };

  return (
    <main className="flex flex-col items-center p-24 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-bold">Recuperar Senha</h1>
        
        <input
          type="email"
          placeholder="Seu e-mail"
          className="p-2 border rounded "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Enviando..." : "Enviar link"}
        </button>

        {status && (
          <p className={`text-sm ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {status.msg}
          </p>
        )}
      </form>
    </main>
  );
}