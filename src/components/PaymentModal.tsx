import React, { useState } from 'react';
import { CartItem, DeliveryAddress, OrderRecord } from '../types';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote, 
  CheckCircle2, 
  Lock, 
  QrCode, 
  Clock, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface PaymentModalProps {
  orderData: {
    items: CartItem[];
    address: DeliveryAddress;
    deliverySlot: string;
    subtotal: number;
    tintingCharges: number;
    deliveryFee: number;
    loyaltyDiscount: number;
    tax: number;
    total: number;
  };
  onClose: () => void;
  onPaymentSuccess: (order: OrderRecord) => void;
}

type PaymentMethodType = 'upi_app' | 'upi_qr' | 'card' | 'netbanking' | 'cod';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  orderData,
  onClose,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi_app');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');
  const [upiId, setUpiId] = useState('9431188421@okhdfcbank');
  
  // Card details
  const [cardData, setCardData] = useState({
    cardNumber: '4532 •••• •••• 8829',
    cardHolder: 'VIKASH SHARMA',
    expiry: '08/29',
    cvv: '392'
  });

  const [selectedBank, setSelectedBank] = useState('sbi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestCardFill = () => {
    setCardData({
      cardNumber: '4111 2222 3333 4444',
      cardHolder: 'VIKASH SHARMA',
      expiry: '12/28',
      cvv: '821'
    });
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const orderId = `NK-${Math.floor(10000 + Math.random() * 90000)}`;
      const now = new Date();
      const dateStr = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const newOrder: OrderRecord = {
        id: orderId,
        date: dateStr,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tintingCharges: orderData.tintingCharges,
        deliveryFee: orderData.deliveryFee,
        loyaltyDiscount: orderData.loyaltyDiscount,
        tax: orderData.tax,
        total: orderData.total,
        deliverySlot: orderData.deliverySlot,
        address: orderData.address,
        paymentMethod: selectedMethod === 'upi_app' ? `UPI (${selectedUpiApp.toUpperCase()})` :
                       selectedMethod === 'upi_qr' ? 'UPI Dynamic QR' :
                       selectedMethod === 'card' ? `Card ending in ${cardData.cardNumber.slice(-4)}` :
                       selectedMethod === 'netbanking' ? `NetBanking (${selectedBank.toUpperCase()})` : 'Cash on Delivery',
        paymentStatus: selectedMethod === 'cod' ? 'Cash On Delivery' : 'Paid',
        status: 'Order Placed',
        estimatedDeliveryTime: '35 mins from now',
        trackingStepIndex: 0,
        batchFormulaId: `NP-TINT-AUTO-${Math.floor(1000 + Math.random() * 9000)}-SAKCHI`,
        riderInfo: {
          name: 'Rajesh Kumar Mahto',
          phone: '+91 98351 77312',
          vehicleNumber: 'JH-05-BQ-4412 (Honda Activa Delivery Hub)',
          rating: 4.95,
          currentLatOffset: 0.015,
          currentLngOffset: 0.012
        }
      };

      onPaymentSuccess(newOrder);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
        id="integrated-payment-modal"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  Nikhil Paints Secure Payment Gateway
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-xs">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Amount to Pay: <strong className="text-slate-900 text-sm font-black">₹{orderData.total}</strong> (All Taxes Incl.)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Left column method picker, Right column input fields */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden flex-1">
          
          {/* Method Selector Tabs (5 cols) */}
          <div className="md:col-span-5 p-3 bg-slate-50 border-r border-slate-200 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
              Payment Method
            </div>

            <button
              onClick={() => setSelectedMethod('upi_app')}
              className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-2.5 transition-all cursor-pointer ${
                selectedMethod === 'upi_app'
                  ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600 text-slate-900 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">UPI (GPay / PhonePe)</div>
                <div className="text-[10px] text-slate-400">Instant zero fee</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('upi_qr')}
              className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-2.5 transition-all cursor-pointer ${
                selectedMethod === 'upi_qr'
                  ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600 text-slate-900 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">Scan UPI QR Code</div>
                <div className="text-[10px] text-slate-400">Any UPI scanner</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('card')}
              className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-2.5 transition-all cursor-pointer ${
                selectedMethod === 'card'
                  ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600 text-slate-900 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">Credit / Debit Card</div>
                <div className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('netbanking')}
              className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-2.5 transition-all cursor-pointer ${
                selectedMethod === 'netbanking'
                  ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600 text-slate-900 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">Net Banking</div>
                <div className="text-[10px] text-slate-400">All major Indian banks</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('cod')}
              className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-2.5 transition-all cursor-pointer ${
                selectedMethod === 'cod'
                  ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600 text-slate-900 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">Cash on Delivery</div>
                <div className="text-[10px] text-slate-400">Pay delivery rider</div>
              </div>
            </button>
          </div>

          {/* Payment Detail Form View (7 cols) */}
          <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Option 1: UPI App */}
              {selectedMethod === 'upi_app' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    Select Your Fast UPI Application:
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedUpiApp('gpay')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedUpiApp === 'gpay'
                          ? 'border-blue-500 bg-blue-50 font-bold text-blue-900 ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-black">Google Pay</div>
                      <div className="text-[9px] text-slate-500">Fast Intent</div>
                    </button>

                    <button
                      onClick={() => setSelectedUpiApp('phonepe')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedUpiApp === 'phonepe'
                          ? 'border-purple-500 bg-purple-50 font-bold text-purple-900 ring-1 ring-purple-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-black">PhonePe</div>
                      <div className="text-[9px] text-slate-500">Auto approve</div>
                    </button>

                    <button
                      onClick={() => setSelectedUpiApp('paytm')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedUpiApp === 'paytm'
                          ? 'border-sky-500 bg-sky-50 font-bold text-sky-900 ring-1 ring-sky-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-black">Paytm UPI</div>
                      <div className="text-[9px] text-slate-500">Direct Pay</div>
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Or Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okaxis"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant payment notification sent to Nikhil Paints POS machine.</span>
                  </div>
                </div>
              )}

              {/* Option 2: QR Code */}
              {selectedMethod === 'upi_qr' && (
                <div className="text-center py-2 space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Scan with Google Pay, PhonePe, Paytm, or BHIM
                  </div>
                  
                  {/* Dynamic QR Box */}
                  <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border-2 border-slate-900 shadow-sm flex flex-col items-center justify-center relative">
                    <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded-lg text-white font-mono text-[8px] flex items-center justify-center">
                      <div className="col-span-6 text-center">
                        <QrCode className="w-24 h-24 mx-auto text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dynamic QR expires in 04:59 mins</span>
                  </div>
                </div>
              )}

              {/* Option 3: Card */}
              {selectedMethod === 'card' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Enter Card Details</span>
                    <button
                      type="button"
                      onClick={handleTestCardFill}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      Fill Demo Test Card
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Card Number</label>
                    <input
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardData.cardHolder}
                      onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs uppercase text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Option 4: Net Banking */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Select Your Bank (Jamshedpur Branch Gateway):
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'sbi', name: 'State Bank of India (SBI)' },
                      { id: 'hdfc', name: 'HDFC Bank' },
                      { id: 'icici', name: 'ICICI Bank' },
                      { id: 'axis', name: 'Axis Bank' }
                    ].map(bank => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedBank === bank.id
                            ? 'border-blue-600 bg-blue-50 font-bold text-blue-900 ring-1 ring-blue-600'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Option 5: COD */}
              {selectedMethod === 'cod' && (
                <div className="space-y-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <span>Pay at Doorstep in Jamshedpur</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    You can pay in cash or scan the delivery partner's UPI QR code upon arrival. Please keep exact change of <strong>₹{orderData.total}</strong> ready.
                  </p>
                </div>
              )}
            </div>

            {/* Pay Button Action */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={handleExecutePayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                id="submit-payment-btn"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with Nikhil Paints Banking Portal...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {selectedMethod === 'cod' ? `Confirm Order (₹${orderData.total})` : `Pay ₹${orderData.total} & Start Tinting`}
                    </span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-slate-400 text-center mt-2">
                Protected by RBI Digital Security Guidelines • Instant Tax Invoice Generation
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
