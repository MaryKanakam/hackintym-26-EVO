import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { mockRiskZones } from "@/data/mockRiskZones";

export async function getRiskZones() {
  if (!isSupabaseConfigured) {
    return [...mockRiskZones];
  }

  const { data, error } = await supabase
    .from("risk_zones")
    .select("*")
    .order("risk_score", { ascending: false });

  if (error) throw error;
  return data;
}

export function calculateRiskScore(zone, complaints, traffic, events) {
  let score = 0;

  // Complaint density factor
  const nearbyComplaints = complaints.filter((c) => {
    const dist = Math.sqrt(
      Math.pow(c.latitude - zone.latitude, 2) + Math.pow(c.longitude - zone.longitude, 2)
    );
    return dist < 0.02; // roughly 2km
  });
  score += nearbyComplaints.length * 10;

  // Traffic congestion factor
  const nearbyTraffic = traffic.filter((t) => {
    const dist = Math.sqrt(
      Math.pow(t.latitude - zone.latitude, 2) + Math.pow(t.longitude - zone.longitude, 2)
    );
    return dist < 0.02;
  });
  nearbyTraffic.forEach((t) => {
    const levels = { low: 5, moderate: 10, heavy: 20, severe: 30 };
    score += levels[t.congestion_level] || 0;
  });

  // Event crowd factor
  const nearbyEvents = events.filter((e) => {
    const dist = Math.sqrt(
      Math.pow(e.latitude - zone.latitude, 2) + Math.pow(e.longitude - zone.longitude, 2)
    );
    return dist < 0.02;
  });
  nearbyEvents.forEach((e) => {
    const levels = { low: 5, medium: 10, high: 20 };
    score += levels[e.crowd_level] || 0;
  });

  return Math.min(score, 100);
}

export function getRiskLevel(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
