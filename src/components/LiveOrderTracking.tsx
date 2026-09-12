import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  X,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  PaintBucket,
  Droplet,
  Box,
  UserCheck,
  Truck,
  RefreshCcw,
} from "lucide-react";

// The exact same steps from your Admin Dashboard, in chronological order
const TRACKING_STEPS = [
  {
    id: "paid",
    label: "Order Confirmed",
    desc: "We have received your order.",
    icon: Clock,
    color: "text-rose-500",
    bg: "bg-rose-100",
    border: "border-rose-500",
  },
  {
    id: "getting_ready",
    label: "Preparing Paints",
    desc: "Gathering base paints and hardware.",
    icon: PaintBucket,
    color: "text-amber-500",
    bg: "bg-amber-100",
    border: "border-amber-500",
  },
  {
    id: "tinted",
    label: "Colors Tinted",
    desc: "Computerized mixing completed.",
    icon: Droplet,
    color: "text-purple-500",
    bg: "bg-purple-100",
    border: "border-purple-500",
  },
  {
    id: "packed",
    label: "Order Packed",
    desc: "Securely boxed and ready.",
    icon: Box,
    color: "text-indigo-500",
    bg: "bg-indigo-100",
    border: "border-indigo-500",
  },
  {
    id: "assigned",
    label: "Rider Assigned",
    desc: "Delivery partner is picking it up.",
    icon: UserCheck,
    color: "text-cyan-500",
    bg: "bg-cyan-100",
    border: "border-cyan-500",
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    desc: "En route to your location in Jamshedpur!",
    icon: Truck,
    color: "text-blue-500",
    bg: "bg-blue-100",
    border: "border-blue-500",
  },
  {
    id: "delivered",
    label: "Delivered",
    desc: "Enjoy your fresh paints!",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-100",
    border: "border-emerald-500",
  },
];

interface LiveOrderTrackingProps {
  order: any;
  onClose: () => void;
  onReorder?: (order: any) => void;
}

export const LiveOrderTracking: React.FC<LiveOrderTrackingProps> = ({
  order,
  onClose,
}) => {
  // Store the live status in state, initialized with the prop
  const [currentStatus, setCurrentStatus] = useState(order.status || "paid");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 🔥 THE MAGIC: Listen to Supabase for changes to THIS specific order in real-time
    const channel = supabase
      .channel(`live-tracking-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`, // Only listen to this order's ID
        },
        (payload) => {
          setIsUpdating(true);
          // Small delay for UI effect
          setTimeout(() => {
            setCurrentStatus(payload.new.status);
            setIsUpdating(false);
          }, 800);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  // Find where we currently are in the timeline
  const currentStepIndex = TRACKING_STEPS.findIndex(
    (step) => step.id === currentStatus,
  );
  const displayId = order.id?.split("-")[0].toUpperCase() || "UNKNOWN";
  const address = order.delivery_address || {};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Main Tracking Modal */}
      <div className="bg-slate-50 w-full max-w-md rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Order #{displayId}
              {isUpdating && (
                <RefreshCcw className="w-4 h-4 text-emerald-500 animate-spin" />
              )}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Live Tracking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Top Info Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="bg-rose-50 p-2.5 rounded-xl text-rose-500 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Delivering To
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  {address.fullName || "Customer"}
                </div>
                <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                  {address.streetAddress}, {address.area}, Jamshedpur
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Pipeline */}
          <div className="relative pl-4 sm:pl-6 pb-4">
            {/* The vertical gray line running behind the icons */}
            <div className="absolute left-[31px] sm:left-[39px] top-6 bottom-6 w-0.5 bg-slate-200 rounded-full"></div>

            {/* The animated colored progress line */}
            <div
              className="absolute left-[31px] sm:left-[39px] top-6 w-0.5 bg-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{
                height:
                  currentStepIndex >= 0
                    ? `calc(${currentStepIndex * (100 / (TRACKING_STEPS.length - 1))}% - 10px)`
                    : "0%",
              }}
            ></div>

            <div className="space-y-8 relative">
              {TRACKING_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                const StepIcon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-5 sm:gap-6 ${isPending ? "opacity-50 grayscale" : "opacity-100"} transition-all duration-500`}
                  >
                    {/* Status Icon */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-500
                      ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                      ${isActive ? `${step.bg} ${step.border} ${step.color} shadow-lg shadow-${step.color.split("-")[1]}-500/30 scale-110 ring-4 ring-white` : ""}
                      ${isPending ? "bg-white border-slate-200 text-slate-400" : ""}
                    `}
                    >
                      <StepIcon
                        className={`w-5 h-5 ${isActive && "animate-pulse"}`}
                      />

                      {/* Active ping effect */}
                      {isActive && (
                        <span
                          className={`absolute inset-0 rounded-2xl border-2 ${step.border} animate-ping opacity-25`}
                        ></span>
                      )}
                    </div>

                    {/* Status Text */}
                    <div className="pt-1.5 flex-1">
                      <h4
                        className={`text-base font-extrabold tracking-tight transition-colors duration-300
                        ${isCompleted ? "text-slate-900" : ""}
                        ${isActive ? step.color : ""}
                        ${isPending ? "text-slate-400" : ""}
                      `}
                      >
                        {step.label}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 leading-snug max-w-[200px]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="bg-white border-t border-slate-100 p-5">
          <p className="text-center text-[11px] font-bold text-slate-400">
            Need help with this order?{" "}
            <a
              href="tel:07004734407"
              className="text-indigo-600 hover:underline"
            >
              Call Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
