import React, { useState } from "react";
import { PaintingProject, ProductItem, ShadeItem } from "../types";
import { PRODUCTS_CATALOG } from "../data/paintDatabase";
import {
  FolderKanban,
  Plus,
  Calculator,
  CheckCircle2,
  UserCheck,
  Sparkles,
} from "lucide-react";

interface ProjectDashboardProps {
  projects: PaintingProject[];
  onCreateProject: (project: PaintingProject) => void;
  onQuickOrderPaint: (product: ProductItem, shade?: ShadeItem) => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  onCreateProject,
  onQuickOrderPaint,
}) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Paint Area Calculator Inputs
  const [roomLength, setRoomLength] = useState<number>(14);
  const [roomWidth, setRoomWidth] = useState<number>(12);
  const [roomHeight, setRoomHeight] = useState<number>(10);
  const [doorsCount, setDoorsCount] = useState<number>(2);
  const [windowsCount, setWindowsCount] = useState<number>(2);
  const [coatsNumber, setCoatsNumber] = useState<number>(2);

  const grossWallArea = 2 * (roomLength + roomWidth) * roomHeight;
  const openingsDeduction = doorsCount * 21 + windowsCount * 16;
  const netWallArea = Math.max(50, grossWallArea - openingsDeduction);

  const paintLitersNeeded = Math.ceil((netWallArea * coatsNumber) / 140);
  const primerLitersNeeded = Math.ceil(netWallArea / 130);
  const puttyKgNeeded = Math.ceil(netWallArea / 16);

  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectLocation, setNewProjectLocation] =
    useState("Sakchi, Jamshedpur");
  const [newProjectBudget, setNewProjectBudget] = useState(35000);
  const [newProjectContractor, setNewProjectContractor] =
    useState("Manish Mistri");

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const newProj: PaintingProject = {
      id: `proj-${Date.now()}`,
      name: newProjectTitle.trim(),
      status: "In Progress",
      location: newProjectLocation,
      startDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      targetCompletionDate: "30 Sep 2026",
      budget: Number(newProjectBudget) || 30000,
      spent: 0,
      notes: "New painting project tracked with Nikhil Paints shade recipes.",
      contractorName: newProjectContractor,
      rooms: [
        {
          roomName: "Main Living Room",
          wallAreaSqFt: netWallArea,
          selectedShade: undefined, // No dummy data! Let the user select their own.
          paintProduct: "Asian Paints Royale Glitz",
          litersRequired: paintLitersNeeded,
          litersOrdered: 0,
          coatsDone: 0,
          coatsTarget: 2,
        },
      ],
    };

    onCreateProject(newProj);
    setNewProjectTitle("");
    setShowNewProjectModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Personalized Project & Paint Tracker
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track wall areas, assigned painters, and compute accurate paint
            liters without wastage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>
              {showCalculator ? "Hide Calculator" : "Wall Paint Calculator"}
            </span>
          </button>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Painting Project</span>
          </button>
        </div>
      </div>

      {showCalculator && (
        <div className="p-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white rounded-3xl shadow-xl space-y-4 animate-in fade-in zoom-in-98 duration-150">
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                const royale =
                  PRODUCTS_CATALOG.find((p) => p.id === "ap-royale-glitz") ||
                  PRODUCTS_CATALOG[0];
                onQuickOrderPaint(royale, undefined); // No dummy shade!
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add {paintLitersNeeded}L Paint to Cart</span>
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => {
          const budgetPercent = Math.min(
            100,
            Math.round((project.spent / project.budget) * 100),
          );

          return (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-sm transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {project.name}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {project.rooms.map((room, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">
                        {room.roomName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {room.wallAreaSqFt} sq.ft
                      </span>
                    </div>

                    {room.selectedShade ? (
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: room.selectedShade.hex }}
                        />
                        <span className="text-[10px] font-bold text-indigo-900 truncate">
                          {room.selectedShade.code} • {room.selectedShade.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] italic text-slate-400">
                        No shade selected yet.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <form
              onSubmit={handleCreateNewProject}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
