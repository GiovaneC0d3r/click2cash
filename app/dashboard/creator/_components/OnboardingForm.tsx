"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Tag, FileText, DollarSign, ChevronLeft, Loader2 } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function OnboardingForm({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [activeField, setActiveField] = useState<"nome" | "desc" | "preco" | "imagem" | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setActiveField("imagem");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      // 1. Upload para o MinIO
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload/products", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Falha no upload");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // 2. Criar Produto
      const productRes = await fetch("/api/creator/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          description: descricao,
          price: parseFloat(preco),
          image: imageUrl,
        }),
      });

      if (!productRes.ok) throw new Error("Erro ao salvar produto");

      // AQUI ELE AVISA A PÁGINA PAI PARA RECARREGAR A LISTA
      onComplete(); 
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col p-8 lg:p-20 relative z-10 border-r border-white/5">
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl font-bold text-white leading-tight">Vamos criar seu primeiro produto?</h1>
              <p className="text-gray-400 text-lg">Te ajudaremos a construir seu império digital com rapidez.</p>
              <button onClick={() => setStep(2)} className="bg-emerald-500 text-[#0a0a0a] font-bold py-4 px-12 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">
                Começar a criar
              </button>
            </div>
          ) : (
            <form className="space-y-5 animate-in fade-in zoom-in-95" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Nome do produto</label>
                <input required value={nome} onChange={(e) => setNome(e.target.value)} onFocus={() => setActiveField("nome")} className="w-full bg-[#111111] border border-gray-800 rounded-lg p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Descrição</label>
                <textarea required value={descricao} onChange={(e) => setDescricao(e.target.value)} onFocus={() => setActiveField("desc")} className="w-full bg-[#111111] border border-gray-800 rounded-lg p-4 h-24 resize-none focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <input required type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} onFocus={() => setActiveField("preco")} placeholder="Preço" className="bg-[#111111] border border-gray-800 rounded-lg p-4 outline-none focus:ring-2 focus:ring-emerald-500" />
                <label className="relative flex items-center justify-center bg-[#111111] border border-dashed border-gray-700 rounded-lg cursor-pointer">
                  {imagePreview ? <Image src={imagePreview} alt="Preview" fill className="object-cover opacity-50" /> : <Camera className="text-gray-500" />}
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} className="px-4 text-gray-500 hover:text-white transition-colors">Voltar</button>
                <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 text-[#0a0a0a] font-bold py-4 rounded-xl flex justify-center items-center">
                  {loading ? <Loader2 className="animate-spin" /> : "Criar produto"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* LADO DIREITO (Preview) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0d0d0d] items-center justify-center p-12">
        {step === 2 && (
          <div className="z-20 w-full max-w-sm space-y-5 animate-in slide-in-from-right-12">
            <div className={`p-6 rounded-2xl border transition-all ${activeField === 'nome' ? 'bg-emerald-500/10 border-emerald-500 scale-105' : 'bg-white/5 border-white/5 opacity-30'}`}>
              <p className="text-white font-bold">{nome || "Nome do Produto"}</p>
            </div>
            <div className={`p-6 rounded-2xl border transition-all ${activeField === 'desc' ? 'bg-emerald-500/10 border-emerald-500 scale-105' : 'bg-white/5 border-white/5 opacity-30'}`}>
              <p className="text-sm italic">{descricao || "Descrição do produto..."}</p>
            </div>
            <div className={`p-6 rounded-2xl border transition-all ${activeField === 'preco' || activeField === 'imagem' ? 'bg-emerald-500/10 border-emerald-500 scale-105' : 'bg-white/5 border-white/5 opacity-30'}`}>
               <p className="text-white font-black text-2xl">{preco ? `R$ ${parseFloat(preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00"}</p>
               {imagePreview && <div className="mt-4 h-20 relative rounded-lg overflow-hidden"><Image src={imagePreview} alt="Preview" fill className="object-cover" /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}