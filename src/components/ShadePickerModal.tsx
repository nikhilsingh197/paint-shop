import React, { useState, useEffect } from "react";
import { ShadeItem, ProductItem } from "../types";
import { PRODUCTS_CATALOG } from "../data/paintDatabase";
import { supabase } from "../supabaseClient";
import {
  Search,
  Sparkles,
  Sun,
  Moon,
  Lamp,
  Check,
  CheckCircle2,
  Palette,
  Eye,
  Info,
} from "lucide-react";

interface ShadePickerModalProps {
  isOpen: boolean;
  product?: ProductItem;
  currentShade?: ShadeItem;
  currentSelectedShade?: ShadeItem;
  onSelectShade: (shade: ShadeItem) => void;
  onClose: () => void;
  isDirectAddToCart?: boolean;
}

const FAMILY_MAPPING: Record<string, string[]> = {
  "Whites & Off-Whites": ["whites", "Whites", "off whites"],
  "Yellows & Golds": ["yellows", "Yellows"],
  "Reds & Oranges": ["reds", "Reds", "oranges", "Oranges", "pinks"],
  "Blues & Teals": ["blues", "Blues", "Blue-Greens"],
  "Greens & Olives": ["greens", "Greens", "Yellow-Greens"],
  "Purples & Violets": ["purples", "Purples"],
  "Greys & Browns": ["greys", "browns", "Neutrals: Browns & Greys", "General"],
};

const COLOR_FAMILIES = ["All", ...Object.keys(FAMILY_MAPPING)];

type RoomViewType = "livingRoom" | "bedroom" | "accentWall" | "exterior";
type LightingType = "daylight" | "warm" | "cool";
type PackSize = 1 | 4 | 10 | 20;

const transformShade = (dbShade: any): ShadeItem =>
  ({
    code: dbShade.shade_code || "Unknown",
    name: dbShade.shade_name || "Unknown Shade",
    hex: dbShade.hex_code || "#CCCCCC",
    brand: dbShade.brand_name || "Unknown Brand",
    family: dbShade.color_family || "General",
    tinting_charge: Number(dbShade.tinting_charge) || 0,
  }) as ShadeItem;

const PAGE_SIZE = 60;

export const ShadePickerModal: React.FC<ShadePickerModalProps> = ({
  isOpen,
  product,
  currentShade,
  currentSelectedShade,
  onSelectShade,
  onClose,
  isDirectAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFamily, setActiveFamily] = useState("All");

  const [filteredShades, setFilteredShades] = useState<ShadeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [selectedShade, setSelectedShade] = useState<ShadeItem>(
    currentSelectedShade ||
      currentShade ||
      ({
        code: "",
        name: "Loading...",
        hex: "#ffffff",
        brand: "",
        family: "",
        tinting_charge: 0,
      } as any),
  );

  const [roomView, setRoomView] = useState<RoomViewType>("livingRoom");
  const [lighting, setLighting] = useState<LightingType>("daylight");
  const [customCodeInput, setCustomCodeInput] = useState("");
  const [packSize, setPackSize] = useState<PackSize>(1);

  useEffect(() => {
    if (isOpen) {
      if (currentSelectedShade) {
        setSelectedShade(currentSelectedShade);
      } else if (currentShade) {
        setSelectedShade(currentShade);
      }
    }
  }, [isOpen, currentSelectedShade, currentShade]);

  const fetchShades = async (isLoadMore = false, currentPage = 0) => {
    if (isLoadMore) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase.from("shades").select("*").range(from, to);

      if (searchQuery.trim()) {
        query = query.or(
          `shade_code.ilike.%${searchQuery.trim()}%,shade_name.ilike.%${searchQuery.trim()}%`,
        );
      }

      if (activeFamily !== "All") {
        const dbFamilies = FAMILY_MAPPING[activeFamily];
        if (dbFamilies) query = query.in("color_family", dbFamilies);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const mappedData = data.map(transformShade);

        if (isLoadMore) {
          setFilteredShades((prev) => [...prev, ...mappedData]);
        } else {
          setFilteredShades(mappedData);
          setSelectedShade((prev) =>
            prev.code === "" && mappedData.length > 0 ? mappedData[0] : prev,
          );
        }

        setHasMore(data.length === PAGE_SIZE);
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error("Error fetching shades:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const debounceTimer = setTimeout(() => {
      fetchShades(false, 0);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeFamily, isOpen]);

  const handleLoadMore = () => fetchShades(true, page);

  const handleApplyCustomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCodeInput.trim()) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("shades")
      .select("*")
      .ilike("shade_code", customCodeInput.trim())
      .limit(1);

    if (data && data.length > 0) {
      const transformed = transformShade(data[0]);
      setSelectedShade(transformed);
      setSearchQuery(customCodeInput.trim());
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  // Real calculations
  const baseTintCharge = (selectedShade as any).tinting_charge || 0;
  const totalTintCharge = baseTintCharge * packSize;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white flex items-center justify-center transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Body */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-slate-50">
          {/* Left Column: Search & Shade Swatches */}
          <div className="flex-1 lg:col-span-7 p-3 sm:p-5 lg:pr-3 flex flex-col overflow-hidden">
            <div className="space-y-3 mb-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by shade code (e.g. L152, 7230) or name..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {COLOR_FAMILIES.map((family) => (
                  <button
                    key={family}
                    onClick={() => setActiveFamily(family)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeFamily === family
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {family}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-40 np-hide-scroll">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredShades.map((shade) => {
                  const isSelected = selectedShade?.code === shade.code;
                  return (
                    <button
                      key={shade.code}
                      onClick={() => setSelectedShade(shade)}
                      className={`p-2.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 shadow-md transform scale-[0.98]"
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex gap-3 mb-2.5">
                        <div
                          className="w-10 h-10 rounded-xl border border-black/10 shadow-inner flex-shrink-0 relative overflow-hidden"
                          style={{ backgroundColor: shade.hex }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent mix-blend-overlay"></div>
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <h4 className="font-extrabold text-[11px] text-slate-900 leading-tight truncate">
                            {shade.name}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 font-mono mt-0.5 block">
                            {shade.code}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-bold text-indigo-600/70 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded">
                          {shade.family}
                        </span>
                        {(shade as any).tinting_charge > 0 && (
                          <span className="text-[10px] font-black text-amber-600">
                            +₹{(shade as any).tinting_charge}/L
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isLoading && filteredShades.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-600">Loading shades...</p>
                </div>
              )}
              
              {!isLoading && filteredShades.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                  <Palette className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-sm font-bold text-slate-600">No shades found.</p>
                  <p className="text-xs text-slate-400 mt-1">Try a different search term or family.</p>
                </div>
              )}

              {hasMore && filteredShades.length > 0 && (
                <div className="mt-6 flex justify-center pb-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2"
                  >
                    {isLoadingMore && (
                      <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {isLoadingMore ? "Loading more..." : "Load More Shades"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visualizer */}
          <div className="lg:col-span-5 flex flex-col shrink-0 border-t border-slate-200 lg:border-t-0 bg-white z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:shadow-none overflow-y-auto max-h-[55vh] lg:max-h-full">
            <div className="flex flex-col h-full lg:p-5 lg:pl-2">
              <div className="bg-white lg:rounded-3xl lg:border border-slate-200 lg:shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden h-full">
              {/* Preview Area */}
              <div className="relative w-full h-64 shrink-0 bg-slate-100">
                <div
                  className="absolute inset-0 transition-colors duration-500 ease-in-out"
                  style={{ backgroundColor: selectedShade.hex }}
                />
                {/* Clean solid color representation (No dusty textures) */}
                
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/50">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedShade.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-slate-500 font-mono">{selectedShade.code}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">HEX {selectedShade.hex}</span>
                    </div>
                  </div>
                </div>
              </div>

              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Pop-up */}
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[500px] z-[100] pointer-events-none animate-in slide-in-from-bottom-5">
          <div className="bg-white/95 backdrop-blur-xl p-4 rounded-[22px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200 pointer-events-auto">
            {product && isDirectAddToCart ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Pack Size</h4>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {([1, 4, 10, 20] as PackSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setPackSize(size)}
                        className={`py-2 rounded-xl text-xs font-black transition-all border-2 cursor-pointer ${
                          packSize === size
                            ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm"
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {size}L
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500">Tinting Charge ({packSize}L): <span className="text-slate-900">{totalTintCharge > 0 ? `₹${totalTintCharge.toFixed(2)}` : 'FREE'}</span></span>
                    <span className="text-sm font-black text-slate-900 mt-0.5">Total: <span className="text-indigo-600">₹{(((product.packs?.find(p => p.volumeLiters === packSize) || product.packs?.[0])?.price || 0) + totalTintCharge).toFixed(2)}</span></span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectShade({
                        ...selectedShade,
                        selectedPackSize: packSize,
                        calculatedTintingCharge: totalTintCharge,
                      } as any);
                      onClose();
                    }}
                    className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Selected Shade</h4>
                  <div className="text-sm font-black text-slate-900 truncate">{selectedShade.name} <span className="text-slate-500 text-xs font-mono font-bold">({selectedShade.code})</span></div>
                  <div className="text-[10px] font-bold text-slate-500 mt-0.5">Tinting Rate: ₹{baseTintCharge.toFixed(2)}/L</div>
                </div>
                <button
                  onClick={() => {
                    onSelectShade(selectedShade);
                    onClose();
                  }}
                  className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                  <span>{product ? 'Apply Shade' : 'Select'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
