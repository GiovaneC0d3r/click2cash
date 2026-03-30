"use client"
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  ShoppingBag, 
  LogOut,
  Rocket
} from "lucide-react";
import React from "react";
import Image from "next/image";
import {redirect} from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="group w-16 hover:w-64 transition-all duration-300 ease-in-out border-r border-emerald-900/30 bg-[#111111] overflow-hidden flex flex-col p-3 shrink-0 shadow-2xl">
        
        {/* Logo / Topo */}
        <div className="flex items-center gap-4 mb-10 px-1">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] shrink-0">
            <Image
                src="/assets/logo.png"
                alt="Click2Cash Logo"
                width={24} // Reduzi um pouco mais para garantir o "respiro" centralizado
                height={24}
                className="object-contain"
            />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold text-xl tracking-tight whitespace-nowrap text-emerald-500">
            Click2<span className="text-white">Cash</span>
          </span>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1">
          <ul className="flex flex-col gap-3"> {/* Aumentei o gap para respiro visual */}
            <SidebarItem label="Dashboard" icon={<LayoutDashboard size={20} />} />
            <SidebarItem 
              label="Vender na Click2Cash" 
              icon={<ShoppingBag size={20} />}
              route= "/dashboard/creator" 
              highlight 

            />
            <SidebarItem label="Meu Perfil" icon={<User size={20} />} />
            <SidebarItem label="Configurações" icon={<Settings size={20} />} />
          </ul>
        </nav>

        {/* Rodapé da Sidebar / Logout */}
        <div className="mt-auto border-t border-emerald-900/10 pt-4">
          <SidebarItem label="Sair" icon={<LogOut size={20} />} isExit />
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#0a0a0a] to-[#0a0a0a] p-8">
        {children}
      </main>
    </div>
  );
}

interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  isExit?: boolean;
  route?: string; // Futuramente, para navegação com Next.js Link
}

function SidebarItem({ label, icon, highlight, isExit, route }: SidebarItemProps) {
  return (
    <li className={`
      flex items-center gap-4 cursor-pointer p-2 rounded-xl transition-all duration-200 group/item
      ${highlight 
        ? 'text-emerald-400 font-bold' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }
      ${isExit ? 'hover:text-red-400 hover:bg-red-400/5' : ''}
    `}
    onClick={()=> redirect(route || "/")} // Redireciona para a rota especificada ou para a raiz
    >
      {/* AJUSTE DE PROPORÇÃO:
        1. h-10 w-10 garante um quadrado perfeito.
        2. flex items-center justify-center força o ícone Lucide ao centro exato.
        3. shrink-0 impede que o container amasse o ícone na transição da sidebar.
      */}
      <div className={`
        w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 shrink-0
        ${highlight ? 'bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-transparent group-hover/item:bg-white/5'}
        ${isExit ? 'group-hover/item:bg-red-500/10 text-red-400' : ''}
      `}>
        {/* Envolvendo o ícone em um span com h-fit garante que a altura da linha do ícone não o empurre para baixo */}
        <span className="flex items-center justify-center h-fit w-fit transition-transform duration-200 group-hover/item:scale-110">
          {icon}
        </span>
      </div>
      
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm tracking-wide">
        {label}
      </span>
    </li>
  );
}