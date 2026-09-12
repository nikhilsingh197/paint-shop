import React, { useState, useEffect } from "react";
import { PaintingLead } from "../types";
import { fetchPaintingLeads, createPaintingLead } from "../lib/paintingLeadsApi";
import {
  ShieldCheck,
  Plus,
  PhoneCall,
  UserCheck,
  MapPin,
  CalendarCheck
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

interface PaintingServicesProps {
  isAdmin?: boolean;
}

export const PaintingServices: React.FC<PaintingServicesProps> = ({
  isAdmin = false,
}) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<PaintingLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyType, setPropertyType] = useState("Residential");
  const [serviceType, setServiceType] = useState("Full House Painting");
  const [address, setAddress] = useState("Sakchi, Jamshedpur");
  const [preferredDate, setPreferredDate] = useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    const data = await fetchPaintingLeads();
    setLeads(data);
    setIsLoading(false);
  };

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !preferredDate) return;
    
    if (!user) {
      alert("Please log in to submit a request.");
      return;
    }

    setIsSubmitting(true);
    const newLead = await createPaintingLead({
      user_id: user.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      property_type: propertyType,
      service_type: serviceType,
      address: address.trim(),
      preferred_date: preferredDate,
      status: "Pending"
    });

    if (newLead) {
      setLeads([newLead, ...leads]);
      setFullName("");
      setPhone("");
      setAddress("");
      setPreferredDate("");
      setShowNewQuoteModal(false);
    } else {
      alert("Failed to submit request. Please ensure the database table is correctly configured.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              Professional Painting Services
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Request a quote. Our experts will visit your site within 24 hours.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <button
              onClick={() => setShowNewQuoteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Free Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* Quote Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-slate-600">Loading your requests...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No active painting requests.</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {lead.service_type} - {lead.property_type}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {lead.address}
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    Customer: {lead.full_name} | Date: {lead.preferred_date}
                  </div>
                </div>
                <div>
                  {lead.assigned_contractor ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      24 Hour Site Visit Arranged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                      Pending Admin Assignment
                    </span>
                  )}
                </div>
              </div>
              
              {lead.assigned_contractor && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Contractor</div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      {lead.assigned_contractor.split("-")[0]}
                    </div>
                  </div>
                  <div>
                    <a href={`tel:${lead.assigned_contractor.split("-")[1]?.trim()}`} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors">
                      <PhoneCall className="w-4 h-4" />
                      Call {lead.assigned_contractor.split("-")[1]?.trim() || 'Painter'}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Quote Modal (Customer) */}
      {showNewQuoteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-black text-lg text-slate-900 mb-2">Request Painting Quote</h3>
            <form onSubmit={handleRequestQuote} className="space-y-4 text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kishor Kumar Singh"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 7004734407"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Full House Painting">Full House Painting</option>
                    <option value="Exterior Only">Exterior Only</option>
                    <option value="Waterproofing">Waterproofing</option>
                    <option value="Room Painting">Room Painting</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Location / Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewQuoteModal(false)}
                  className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
