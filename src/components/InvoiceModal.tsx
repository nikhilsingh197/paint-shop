import React from "react";
import { X, Printer } from "lucide-react";

interface InvoiceModalProps {
  order: any;
  onClose: () => void;
}

// --- BULLETPROOF DATA HELPERS ---
const getSafeId = (order: any) => {
  const id = order?.id || order?.order_id || order?.orderId;
  if (!id) return "PENDING";
  const str = String(id);
  return str.includes("-") ? str.split("-")[0].toUpperCase() : str.slice(0, 8).toUpperCase();
};

const getSafeDate = (order: any) => {
  const rawDate = order?.created_at || order?.timestamp || order?.date;
  if (!rawDate) return new Date().toLocaleDateString('en-IN');
  try {
    return new Date(rawDate).toLocaleDateString('en-IN');
  } catch {
    return new Date().toLocaleDateString('en-IN');
  }
};

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const totalAmount = order.total_amount || order.total || 0;
  const baseAmount = (totalAmount / 1.18).toFixed(2);
  const gstAmount = (totalAmount - Number(baseAmount)).toFixed(2);
  const cgst = (Number(gstAmount) / 2).toFixed(2);
  const sgst = (Number(gstAmount) / 2).toFixed(2);

  const address = order.delivery_address || {};
  const orderDate = getSafeDate(order);
  const invoiceNo = `INV-${getSafeId(order)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:rounded-none">
        
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl print:hidden">
          <h3 className="font-bold text-slate-800">Preview Invoice</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors cursor-pointer">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div id="printable-invoice" className="p-8 sm:p-10 overflow-y-auto print:overflow-visible text-slate-900 bg-white">
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">Tax Invoice</h1>
            <p className="text-xs font-bold text-slate-500 mt-1">ORIGINAL FOR RECIPIENT</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Billed By:</p>
              <h2 className="text-lg font-black text-slate-900">Nikhil Paints & Hardware</h2>
              <p className="mt-1 text-slate-700">Near Jaipur Marble, Moon City</p>
              <p className="text-slate-700">Dimna Mango Road, Jamshedpur - 831012</p>
              <p className="mt-2 font-bold text-slate-800">GSTIN: <span className="font-medium">20ABCDE1234F1Z5</span></p>
              <p className="font-bold text-slate-800">Phone: <span className="font-medium">+91 70047 34407</span></p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="mb-4">
                <table className="w-full text-right text-slate-800">
                  <tbody>
                    <tr>
                      <td className="pr-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Invoice No:</td>
                      <td className="font-black text-base">{invoiceNo}</td>
                    </tr>
                    <tr>
                      <td className="pr-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Date:</td>
                      <td className="font-bold">{orderDate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="text-left border border-slate-300 p-4 rounded-lg bg-slate-50 w-full max-w-[300px]">
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Billed To:</p>
                <p className="font-black text-slate-900">{address.fullName || order.customer_name || "Customer"}</p>
                <p className="text-slate-700 mt-0.5">{address.phone}</p>
                <p className="text-xs leading-relaxed mt-1 text-slate-600">
                  {address.area || order.area}, {address.streetAddress || ""}<br />
                  Jamshedpur, Jharkhand
                </p>
                {order.gst_details?.hasGst && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="font-black text-slate-900 text-xs">{order.gst_details.companyName}</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">GSTIN: <span className="font-medium">{order.gst_details.gstin}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y-2 border-slate-800 text-[10px] text-slate-600 uppercase tracking-wider">
                <th className="p-3 text-left font-bold w-10">#</th>
                <th className="p-3 text-left font-bold">Item Description</th>
                <th className="p-3 text-center font-bold">HSN/SAC</th>
                <th className="p-3 text-center font-bold">Qty</th>
                <th className="p-3 text-right font-bold">Base Rate</th>
                <th className="p-3 text-right font-bold">Taxable Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b-2 border-slate-800">
              {order.items?.map((item: any, idx: number) => {
                const itemTotal = (item.pack.price + (item.tintingCharge || 0)) * item.quantity;
                const itemBase = (itemTotal / 1.18).toFixed(2);
                const rate = (Number(itemBase) / item.quantity).toFixed(2);
                
                return (
                  <tr key={idx} className="text-sm text-slate-800">
                    <td className="p-3 text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-black">{item.productName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.pack?.size} {item.selectedShade ? `| Tinted Shade: ${item.selectedShade.code}` : ''}</p>
                    </td>
                    {/* --- DYNAMIC HSN CODE ADDED HERE --- */}
                    <td className="p-3 text-center text-slate-500 text-xs">
                      {item.hsn_code || item.product?.hsn_code || "3208"}
                    </td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right">₹{rate}</td>
                    <td className="p-3 text-right font-black">₹{itemBase}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-start mt-8">
            <div className="w-1/2 pr-8 text-[10px] text-slate-500 space-y-1.5">
              <p className="font-bold text-slate-800 uppercase tracking-wider mb-2">Terms & Conditions:</p>
              <p>1. Goods once sold will not be taken back or exchanged.</p>
              <p>2. Subject to Jamshedpur jurisdiction only.</p>
              <p>3. Tinted paints are custom-made and cannot be cancelled.</p>
              <p>4. E.&.O.E. This is a computer-generated invoice.</p>
              
              <div className="mt-6 pt-4">
                <p className="font-bold text-slate-800 uppercase tracking-wider mb-1">Bank Details:</p>
                <p>Bank: HDFC Bank</p>
                <p>A/C No: 50200012345678</p>
                <p>IFSC: HDFC0001234</p>
              </div>
            </div>

            <div className="w-1/2 md:w-[40%]">
              <div className="space-y-2 text-sm border border-slate-300 rounded-lg p-5 bg-slate-50">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Total Taxable Value:</span>
                  <span>₹{baseAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Add: CGST @ 9%:</span>
                  <span>₹{cgst}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-b border-slate-300 pb-3">
                  <span>Add: SGST @ 9%:</span>
                  <span>₹{sgst}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2">
                  <span>Invoice Total:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
              
              <div className="mt-14 text-center border-t-2 border-slate-800 pt-2 w-56 ml-auto">
                <p className="text-xs font-black text-slate-900 uppercase">For Nikhil Paints & Hardware</p>
                <p className="text-[10px] text-slate-500 mt-1">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { 
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; background: white;
          }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
};