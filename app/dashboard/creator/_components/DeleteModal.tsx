"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  productName: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, loading, productName }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Escuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Card do Modal */}
      <div className="relative bg-[#111111] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4 mx-auto">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-2">
          Excluir Produto?
        </h3>
        
        <p className="text-gray-400 text-center mb-8">
          Você está prestes a excluir <span className="text-white font-semibold">"{productName}"</span>. 
          Esta ação é irreversível e removerá todos os dados do banco e do MinIO.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sim, Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}