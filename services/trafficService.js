import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { mockTrafficHotspots } from "@/data/mockTraffic";

export async function getTrafficHotspots() {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabase
      .from("traffic_hotspots")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("[Traffic Service] Falling back to mock data:", err.message);
    return [...mockTrafficHotspots];
  }
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
