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
  onSelectShade: (shade: any) => void;
  onClose: () => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 flex items-center justify-center text-white">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  7,000+ Computerized Shade Selector
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                {product ? (
                  <>
                    Selected for:{" "}
                    <strong className="text-slate-800">{product.name}</strong>
                  </>
                ) : (
                  "Select a color to find compatible paints."
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Search & Shade Swatches */}
          <div className="lg:col-span-7 p-4 border-r border-slate-200 flex flex-col overflow-hidden">
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter shade code (e.g. 0427, L152, 7230)..."
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {COLOR_FAMILIES.map((family) => (
                  <button
                    key={family}
                    onClick={() => setActiveFamily(family)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeFamily === family
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {family}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredShades.map((shade) => {
                  const isSelected = selectedShade?.code === shade.code;
                  return (
                    <button
                      key={shade.code}
                      onClick={() => setSelectedShade(shade)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? "border-slate-900 bg-amber-50/50 ring-2 ring-slate-900 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div
                        className="w-full h-14 rounded-lg border border-black/10 relative overflow-hidden shadow-inner flex items-center justify-center transition-transform group-hover:scale-98"
                        style={{ backgroundColor: shade.hex }}
                      >
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-900">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-black px-1 rounded-sm bg-black/40 text-white backdrop-blur-xs uppercase">
                          {shade.brand.split(" ")[0]}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">
                            {shade.code}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-700 truncate">
                          {shade.name}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">
                          {shade.family}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasMore && filteredShades.length > 0 && !isLoading && (
                <div className="flex justify-center mt-6 mb-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2"
                  >
                    {isLoadingMore && (
                      <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {isLoadingMore ? "Loading more..." : "Load More Shades"}
                  </button>
                </div>
              )}
            </div>

            <form
              onSubmit={handleApplyCustomCode}
              className="pt-3 border-t border-slate-200 flex gap-2"
            >
              <input
                type="text"
                value={customCodeInput}
                onChange={(e) => setCustomCodeInput(e.target.value)}
                placeholder="Or enter contractor shade code directly..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Tint Code
              </button>
            </form>
          </div>

          {/* Right Column: Visualizer */}
          <div className="lg:col-span-5 p-4 bg-slate-50/70 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span>Real-Time Room Wall Preview</span>
                  </div>
                </div>

                <div className="relative w-full h-48 rounded-xl border border-slate-300 overflow-hidden shadow-inner flex flex-col justify-between p-3 transition-colors duration-300">
                  <div
                    className="absolute inset-0 transition-colors duration-300"
                    style={{ backgroundColor: selectedShade.hex }}
                  />
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="bg-white/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-black text-slate-900 shadow-xs border border-white/40">
                      {selectedShade.code} • {selectedShade.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Shade Details Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg border border-black/10 shadow-xs"
                      style={{ backgroundColor: selectedShade.hex }}
                    />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        {selectedShade.code} — {selectedShade.name}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    HEX {selectedShade.hex.toUpperCase()}
                  </span>
                </div>

                {/* Conditional Rendering based on Workflow */}
                {product ? (
                  <>
                    {/* WORKFLOW 1: PRODUCT FIRST - Show Pack Sizes */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Select Pack Size:
                      </div>
                      <div className="flex items-center gap-2">
                        {([1, 4, 10, 20] as PackSize[]).map((size) => (
                          <button
                            key={size}
                            onClick={() => setPackSize(size)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border cursor-pointer ${
                              packSize === size
                                ? "bg-amber-50 border-amber-300 text-amber-800 shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {size} Litre
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 mt-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">
                          Tinting Charge ({packSize}L Pack):
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          {totalTintCharge > 0 ? (
                            <>₹{totalTintCharge.toFixed(2)}</>
                          ) : (
                            <span className="text-emerald-700">
                              FREE (No tinting)
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectShade({
                            ...selectedShade,
                            selectedPackSize: packSize,
                            calculatedTintingCharge: totalTintCharge,
                          });
                          onClose();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Confirm & Add to Cart</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* WORKFLOW 2: COLOR FIRST - Browse Paints */}
                    <div className="pt-3 border-t border-slate-200 mt-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">
                          Base Tinting Rate:
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          ₹{baseTintCharge.toFixed(2)}{" "}
                          <span className="text-[10px] text-slate-500 font-normal">
                            / Litre
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectShade(selectedShade);
                          onClose();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                        <span>Find Paints for {selectedShade.code}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
