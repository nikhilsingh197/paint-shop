import React from "react";
import {
  PaintBucket,
  ShieldCheck,
  Award,
  RotateCcw,
  Sparkles,
  Settings,
  Truck,
  Building2,
  FolderKanban
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: "store" | "projects" | "history" | "loyalty" | "chat" | "services" | "admin" | "delivery") => void;
  isAdmin: boolean;
  isDelivery: boolean;
  loyaltyCoins: number;
  onOpenConsultantChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  isDelivery,
  loyaltyCoins,
  onOpenConsultantChat,
}) => {
  const navItems = [
    { id: "store", label: "Paints & Tools", icon: PaintBucket, type: "main" },
    { id: "services", label: "Painting Services", icon: ShieldCheck, type: "main" },
    { id: "history", label: "Past Orders", icon: RotateCcw, type: "main" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 shrink-0 shadow-sm z-50">
      <div className="p-6 border-b border-slate-100 flex flex-col justify-center">
        <h2 className="font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-700 to-emerald-500 text-2xl leading-none tracking-tighter">
          Nikhil Paints<br/>
          <span className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">& Hardware</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <div className="text-[10px] font-black text-slate-400 uppercase px-3 py-2 tracking-widest mb-1">
          Menu
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm font-bold ${
                isActive 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}

        <div className="my-4 border-t border-slate-100"></div>

        <button
          onClick={onOpenConsultantChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
        >
          <Sparkles className="w-4 h-4" />
          Expert Advice
        </button>

        {(isAdmin || isDelivery) && (
          <>
            <div className="my-4 border-t border-slate-100"></div>
            <div className="text-[10px] font-black text-slate-400 uppercase px-3 py-2 tracking-widest mb-1">
              Staff Portal
            </div>
            
            {isAdmin && (
              <button
                onClick={() => onTabChange("admin")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm font-bold ${
                  activeTab === "admin"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}

            {isDelivery && (
              <button
                onClick={() => onTabChange("delivery")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm font-bold ${
                  activeTab === "delivery"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-cyan-600 bg-cyan-50 hover:bg-cyan-100"
                }`}
              >
                <Truck className="w-4 h-4" />
                Delivery Portal
              </button>
            )}
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-4 text-center border border-emerald-100/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl"></div>
          <Building2 className="w-6 h-6 text-emerald-600 mx-auto mb-2 relative z-10" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide relative z-10">Moon City Store</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold relative z-10">Dimna Mango Road</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-black relative z-10">Open until 9 PM</p>
        </div>
      </div>
    </aside>
  );
};
