import React from "react";
import { X, Printer, CheckCircle } from "lucide-react";

interface InvoiceModalProps {
  order: any;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // Reverse calculate 18% GST from the total
  const totalAmount = order.total_amount || order.total || 0;
  const baseAmount = (totalAmount / 1.18).toFixed(2);
  const gstAmount = (totalAmount - Number(baseAmount)).toFixed(2);
  const cgst = (Number(gstAmount) / 2).toFixed(2);
  const sgst = (Number(gstAmount) / 2).toFixed(2);

  const address = order.delivery_address || {};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Modal Header - Hidden during printing */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl print:hidden">
          <h3 className="font-bold text-slate-800">Order Invoice</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 cursor-pointer">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div className="p-8 overflow-y-auto flex-1 print:overflow-visible print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">TAX INVOICE</h1>
              <p className="text-slate-500 font-bold mt-1">Nikhil Paints & Hardware</p>
              <p className="text-sm text-slate-500 mt-2">Near Jaipur Marble, Moon City</p>
              <p className="text-sm text-slate-500">Dimna Mango Road, Jamshedpur - 831012</p>
              <p className="text-sm font-bold text-slate-700 mt-1">GSTIN: 20ABCDE1234F1Z5</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Invoice / Order No.</p>
              <p className="text-xl font-black text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Date: {new Date(order.created_at || order.timestamp).toLocaleDateString('en-IN')}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold mt-4">
                <CheckCircle className="w-3.5 h-3.5" /> PAID
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To / Delivered To</p>
              <p className="font-bold text-slate-900">{address.fullName || order.customer_name}</p>
              <p className="text-sm text-slate-600 mt-1">{address.phone}</p>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                {address.area || order.area}, {address.streetAddress || ""}<br />
                Jamshedpur, Jharkhand
              </p>
            </div>

            {/* GST Details Box (Only shows if customer entered GST) */}
            {order.gst_details?.hasGst && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2">Buyer GST Details</p>
                <p className="font-black text-indigo-900">{order.gst_details.companyName}</p>
                <p className="text-sm font-bold text-indigo-700 mt-1">GSTIN: {order.gst_details.gstin}</p>
                <p className="text-xs text-indigo-600 mt-2 font-medium">Input Tax Credit Eligible</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-left mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-3 font-bold">Item Description</th>
                <th className="py-3 font-bold text-center">Qty</th>
                <th className="py-3 font-bold text-right">Price</th>
                <th className="py-3 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item: any, idx: number) => (
                <tr key={idx} className="text-sm">
                  <td className="py-4">
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500">{item.pack?.size} {item.selectedShade ? `| Shade: ${item.selectedShade.code}` : ''}</p>
                  </td>
                  <td className="py-4 text-center font-medium text-slate-700">{item.quantity}</td>
                  <td className="py-4 text-right font-medium text-slate-700">₹{item.pack?.price}</td>
                  <td className="py-4 text-right font-bold text-slate-900">₹{item.pack?.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & GST Breakdown */}
          <div className="flex justify-end border-t-2 border-slate-200 pt-6">
            <div className="w-full sm:w-1/2 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Taxable Amount</span>
                <span>₹{baseAmount}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>CGST (9%)</span>
                <span>₹{cgst}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs border-b border-slate-200 pb-3">
                <span>SGST (9%)</span>
                <span>₹{sgst}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 pt-1">
                <span>Grand Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add this to your index.css to format printing properly */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:visible, .print\\:visible * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .fixed { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};