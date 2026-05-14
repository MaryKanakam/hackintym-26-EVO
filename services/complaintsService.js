import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { mockComplaints } from "@/data/mockComplaints";

export async function getComplaints(filters = {}) {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured");
    }

    let query = supabase.from("city_issues").select("*");
    if (filters.category) query = query.eq("issue_type", filters.category);
    if (filters.severity) query = query.eq("severity", filters.severity);
    if (filters.status) query = query.eq("status", filters.status);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("[Complaints Service] Falling back to mock data:", err.message);
    // Map mock data keys to the new Supabase-style keys for consistency
    let data = mockComplaints.map(c => ({
      ...c,
      issue_type: c.category, // map mock category to issue_type
      summary: c.description, // map mock description to summary
    }));
    
    if (filters.category) data = data.filter((c) => c.issue_type === filters.category);
    if (filters.severity) data = data.filter((c) => c.severity === filters.severity);
    return data;
  }
}

export function subscribeToComplaints(callback) {
  if (!isSupabaseConfigured) return () => {};

  const subscription = supabase
    .channel("complaints-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "city_issues" }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
}
