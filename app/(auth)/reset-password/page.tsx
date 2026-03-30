"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth-client"; 
import { Eye, EyeOff } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Token de recuperação não encontrado ou inválido.");
      return;
    }

    setLoading(true);
    
    const { error } = await resetPassword({
      newPassword: password,
      token,
    });

    setLoading(false);

    if (error) {
      // Mapeamento de erros para PT-BR
      switch (error.code) {
        case "INVALID_TOKEN":
          setErrorMessage("Este link de recuperação expirou ou já foi utilizado.");
          break;
        case "PASSWORD_TOO_SHORT":
          setErrorMessage("A senha deve ter pelo menos 8 caracteres.");
          break;
        default:
          setErrorMessage("Ocorreu um erro ao redefinir sua senha. Tente novamente.");
      }
    } else {
      // Sucesso - Redireciona (aqui você ainda pode usar um toast se preferir)
      router.push("/login?message=Senha alterada com sucesso");
    }
  };

  return (
    <form onSubmit={handleReset} className="flex flex-col gap-4 w-full max-w-sm">
      <h1 className="text-2xl font-bold">Nova Senha</h1>
      
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Digite a nova senha"
          className="p-2 pr-10 border rounded text-white bg-transparent w-full focus:ring-2 focus:ring-green-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Mensagem de Erro em Vermelho */}
      {errorMessage && (
        <p className="text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </p>
      )}

      <button
        disabled={loading}
        className="bg-green-600 text-white p-2 rounded disabled:bg-gray-600 transition-all active:scale-95 font-semibold"
      >
        {loading ? "Salvando..." : "Redefinir Senha"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-col items-center p-24">
      <Suspense fallback={<p>Carregando...</p>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}