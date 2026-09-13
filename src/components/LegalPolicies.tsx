import React from "react";
import { ArrowLeft, Shield, FileText, AlertCircle } from "lucide-react";

interface LegalPoliciesProps {
  onBack: () => void;
}

export const LegalPolicies: React.FC<LegalPoliciesProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Legal & Policies</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        
        {/* Privacy Policy */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Privacy Policy</h2>
          </div>
          <div className="space-y-6 text-slate-600 leading-relaxed text-sm sm:text-base">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">1. Information We Collect</h3>
              <p className="mb-2">To provide lightning-fast deliveries and seamless service, we collect the following information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-slate-700">Personal Details:</strong> Name, phone number, and email address.</li>
                <li><strong className="text-slate-700">Location Data:</strong> Exact GPS location and typed delivery addresses to fulfill our 35-minute delivery promise.</li>
                <li><strong className="text-slate-700">Business Data:</strong> GSTIN and Company Name (only if you request a B2B GST invoice).</li>
                <li><strong className="text-slate-700">App Activity:</strong> Order history, custom shade selections, and saved projects.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">2. How We Use Your Information</h3>
              <p>We use this data strictly to operate our quick-commerce platform. This includes processing payments, generating computerized shade formulas, routing delivery partners, and crediting Nikhil Rang Club loyalty coins.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">3. Data Sharing</h3>
              <p>We do not sell your data. We only share necessary details (Name, Phone Number, Delivery Drop Location) with our assigned delivery partners to ensure your order reaches you safely.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">4. Data Security</h3>
              <p>Your data is securely stored using industry-standard encryption. Access to your order history and business details is protected via secure authentication.</p>
            </div>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Terms of Service</h2>
          </div>
          <div className="space-y-6 text-slate-600 leading-relaxed text-sm sm:text-base">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">1. Acceptance of Terms</h3>
              <p>By accessing the Nikhil Paints & Hardware application, you agree to abide by these Terms of Service. Our store is located in Jamshedpur, Jharkhand, and operates under local jurisdiction.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">2. Delivery Promise & Operations</h3>
              <p className="mb-2">Our "35-Minute Delivery" promise applies to standard operational zones within Jamshedpur. Actual delivery times may vary due to severe weather, traffic conditions, or high order volumes.</p>
              <p>We reserve the right to temporarily close the online storefront (halting new checkouts) during off-hours or extreme operational loads.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">3. Custom Paint Tinting</h3>
              <p>Paints ordered via our "Color First" workflow or Shade Picker are machine-tinted specifically to your selected shade code using Asian Paints, Berger, or Birla Opus dispensing systems. Once the tinting process begins, the order cannot be modified.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">4. B2B GST Invoicing</h3>
              <p>If you require a B2B invoice, it is your responsibility to provide the correct Company Name and 15-digit GSTIN at checkout. Invoices generated with user-provided incorrect GST details cannot be revised after the month-end filing.</p>
            </div>
          </div>
        </section>

        {/* Refund & Cancellation */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Refund & Cancellation Policy</h2>
          </div>
          <div className="space-y-6 text-slate-600 leading-relaxed text-sm sm:text-base">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">1. Order Cancellation</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-slate-700">Standard Items (Hardware, Brushes, Putty, Untinted Base Paint):</strong> You may cancel your order for a full refund within 5 minutes of placement, provided it has not yet been dispatched by our delivery partner.</li>
                <li><strong className="text-slate-700">Custom Tinted Paints:</strong> Orders containing custom-mixed shades cannot be cancelled once the "Paints Getting Ready" or "Tinted" status is updated in the app, as the product is customized permanently.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">2. Return Eligibility</h3>
              <p className="mb-2">We accept returns within 3 days of delivery under the following conditions:</p>
              <ul className="list-disc pl-5 space-y-2 mb-2">
                <li>Items are unused, unopened, and in their original packaging with seals intact.</li>
                <li>The product delivered is damaged, leaked during transit, or incorrect (e.g., wrong brand or base).</li>
              </ul>
              <p><strong className="text-slate-700">Non-Returnable Items:</strong> Custom tinted emulsions/enamels, opened hardware tools, and partially used waterproofing chemicals are strictly non-returnable.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">3. Refund Process</h3>
              <p>Once a returned item is received and inspected at our Mango hub, refunds will be initiated to the original payment method. Please allow 5-7 business days for the amount to reflect in your bank account.</p>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
};
