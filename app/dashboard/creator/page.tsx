"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Plus, Edit3, Trash2, Loader2, Copy, Check, 
  Wallet, TrendingUp, ArrowUpCircle 
} from "lucide-react";

import OnboardingForm from "./_components/OnboardingForm";
import DeleteModal from "./_components/DeleteModal";

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalSales: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados do Modal de Deleção
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Busca produtos e métricas simultaneamente
      const [prodRes, metricsRes] = await Promise.all([
        fetch("/api/creator/products"),
        fetch("/api/creator/metrics")
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/checkout/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openDeleteModal = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/creator/products?id=${productToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert("Erro ao excluir.");
    } finally {
      setDeleteLoading(false);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (products.length === 0) return <OnboardingForm onComplete={fetchData} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        
        {/* SEÇÃO DE SALDO E MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Saldo Disponível</p>
              <h3 className="text-2xl font-black text-white">
                R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <button className="ml-auto p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all" title="Sacar">
              <ArrowUpCircle size={24} />
            </button>
          </div>

          <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Vendas Totais</p>
              <h3 className="text-2xl font-black text-white">{metrics.totalSales}</h3>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-white">Seus Produtos</h1>
          <button 
            onClick={() => setProducts([])} 
            className="flex items-center gap-2 bg-emerald-500 text-[#0a0a0a] font-bold py-3 px-6 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Plus size={20} /> Novo Produto
          </button>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group bg-[#111111] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
              <div className="relative h-48 w-full">
                <Image src={product.image || "/assets/placeholder.png"} alt={product.name} fill className="object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                   <button 
                    onClick={() => copyToClipboard(product.id)}
                    className="p-2 bg-black/60 backdrop-blur-md text-white rounded-lg hover:bg-emerald-500 transition-all"
                    title="Copiar Link de Venda"
                   >
                     {copiedId === product.id ? <Check size={16} /> : <Copy size={16} />}
                   </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-[#0a0a0a]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-emerald-400 font-bold text-xs">
                  R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-white font-bold truncate">{product.name}</h3>
                <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => router.push(`/dashboard/creator/edit/${product.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs transition-all font-semibold"
                  >
                    <Edit3 size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => openDeleteModal(product.id, product.name)}
                    className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        productName={productToDelete?.name || ""}
      />
    </div>
  );
}