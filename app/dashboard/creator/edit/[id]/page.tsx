"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Camera, Tag, FileText, DollarSign, ChevronLeft, Loader2, Save } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados do Formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);

  // 1. Carregar dados atuais do produto
  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch("/api/creator/products"); // Reutilizando o GET que filtra por user
      const products = await res.json();
      const product = products.find((p: any) => p.id === productId);

      if (product) {
        setNome(product.name);
        setDescricao(product.description || "");
        setPreco(product.price.toString());
        setImagePreview(product.image);
      } else {
        router.push("/dashboard/creator");
      }
    } catch (error) {
      console.error("Erro ao carregar produto", error);
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = imagePreview;

      // Se houver novo arquivo, faz upload para o MinIO
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload/products", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // Envia o PATCH para a API
      const res = await fetch("/api/creator/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          name: nome,
          description: descricao,
          price: parseFloat(preco),
          image: imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      router.push("/dashboard/creator");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      
      {/* Lado Esquerdo - Formulário */}
      <div className="flex-1 flex flex-col p-8 lg:p-20 border-r border-white/5">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-12 transition-colors w-fit"
        >
          <ChevronLeft size={20} /> Voltar para lista
        </button>

        <div className="max-w-xl w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Editar Produto</h1>
            <p className="text-gray-400">Altere as informações necessárias da sua oferta.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Nome do produto</label>
              <input 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onFocus={() => setActiveField("nome")}
                className="w-full bg-[#111111] border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Descrição</label>
              <textarea 
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                onFocus={() => setActiveField("desc")}
                className="w-full bg-[#111111] border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Preço (R$)</label>
                <input 
                  type="number" step="0.01"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  onFocus={() => setActiveField("preco")}
                  className="w-full bg-[#111111] border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Nova Imagem</label>
                <label className="relative flex items-center justify-center h-[58px] bg-[#111111] border border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500 transition-all overflow-hidden">
                   <Camera size={20} className="text-gray-500" />
                   <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                   {selectedFile && <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 uppercase">Novo arquivo selecionado</div>}
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-emerald-500 text-[#0a0a0a] font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-all flex justify-center items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar Alterações</>}
            </button>
          </form>
        </div>
      </div>

      {/* Lado Direito - Previsualização Dinâmica */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0d0d0d] items-center justify-center">
        <div className="relative z-20 w-full max-w-sm space-y-6">
          <p className="text-center text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Preview em Tempo Real</p>
          
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${activeField === 'nome' ? 'bg-emerald-500/10 border-emerald-500 scale-105' : 'bg-white/5 border-white/5 opacity-40'}`}>
            <h3 className="text-white font-bold text-xl">{nome || "Nome do Produto"}</h3>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 ${activeField === 'desc' ? 'bg-emerald-500/10 border-emerald-500 scale-105' : 'bg-white/5 border-white/5 opacity-40'}`}>
            <p className="text-gray-400 text-sm italic">{descricao || "Sua descrição aparecerá aqui..."}</p>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 ${activeField === 'preco' ? 'bg-emerald-500/10 border-emerald-500 scale-105' : 'bg-white/5 border-white/5 opacity-40'}`}>
            <p className="text-3xl font-black text-white">
              {preco ? `R$ ${parseFloat(preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00"}
            </p>
          </div>

          {imagePreview && (
            <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/10">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}