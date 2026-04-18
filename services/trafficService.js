import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { mockTrafficHotspots } from "@/data/mockTraffic";

export async function getTrafficHotspots() {
  if (!isSupabaseConfigured) {
    return [...mockTrafficHotspots];
  }

  const { data, error } = await supabase
    .from("traffic_hotspots")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export function subscribeToTraffic(callback) {
  if (!isSupabaseConfigured) return () => {};

  const subscription = supabase
    .channel("traffic-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "traffic_hotspots" }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
}
