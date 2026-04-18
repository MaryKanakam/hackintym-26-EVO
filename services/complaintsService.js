import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { mockComplaints } from "@/data/mockComplaints";

export async function getComplaints(filters = {}) {
  if (!isSupabaseConfigured) {
    let data = [...mockComplaints];
    if (filters.category) data = data.filter((c) => c.category === filters.category);
    if (filters.severity) data = data.filter((c) => c.severity === filters.severity);
    if (filters.status) data = data.filter((c) => c.status === filters.status);
    return data;
  }

  let query = supabase.from("complaints").select("*");
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.severity) query = query.eq("severity", filters.severity);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export function subscribeToComplaints(callback) {
  if (!isSupabaseConfigured) return () => {};

  const subscription = supabase
    .channel("complaints-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
}
