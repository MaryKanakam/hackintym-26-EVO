import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { mockEVStations } from "@/data/mockEVStations";

export async function getEVStations(filters = {}) {
  if (!isSupabaseConfigured) {
    let data = [...mockEVStations];
    if (filters.status) data = data.filter((s) => s.status === filters.status);
    return data;
  }

  let query = supabase.from("ev_stations").select("*");
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export function subscribeToEVStations(callback) {
  if (!isSupabaseConfigured) return () => {};

  const subscription = supabase
    .channel("ev-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "ev_stations" }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
}
