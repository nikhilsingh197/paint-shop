import { supabase } from "./supabase";
import { PaintingLead } from "../types";

// Update this constant if your Supabase table is named differently
export const TABLE_NAME = "painting_leads";

export async function fetchPaintingLeads(): Promise<PaintingLead[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Supabase fetch error for ${TABLE_NAME}:`, error.message);
      return [];
    }

    return (data as PaintingLead[]) || [];
  } catch (err) {
    console.error("Network or client error fetching leads:", err);
    return [];
  }
}

export async function createPaintingLead(lead: Omit<PaintingLead, "id" | "created_at">): Promise<PaintingLead | null> {
  try {
    const id = crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`;
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ id, ...lead }])
      .select()
      .single();

    if (error) {
      console.error(`Supabase insert error for ${TABLE_NAME}:`, error.message);
      return null;
    }

    return data as PaintingLead;
  } catch (err) {
    console.error("Network or client error creating lead:", err);
    return null;
  }
}

export async function assignContractorToLead(id: string, contractorString: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ 
        assigned_contractor: contractorString,
        status: "contractor_assigned" 
      })
      .eq("id", id);

    if (error) {
      console.error(`Supabase update error for ${TABLE_NAME}:`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Network or client error updating lead:", err);
    return false;
  }
}
