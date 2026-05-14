import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { mockEvents } from "@/data/mockEvents";

export async function getCityEvents() {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabase
      .from("city_events")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("[Events Service] Falling back to mock data:", err.message);
    return [...mockEvents];
  }
}

export function subscribeToEvents(callback) {
  if (!isSupabaseConfigured) return () => {};

  const subscription = supabase
    .channel("events-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "city_events" }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
}
