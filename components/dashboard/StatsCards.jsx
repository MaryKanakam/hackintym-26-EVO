"use client";

import {
  AlertTriangle,
  MapPin,
  ZapOff,
  Calendar,
  ShieldAlert,
} from "lucide-react";

export default function StatsCards({ complaints, traffic, evStations, events, riskZones }) {
  const activeComplaints = complaints.filter((c) => c.status !== "resolved").length;
  const congestedZones = traffic.filter(
    (t) => t.congestion_level === "heavy" || t.congestion_level === "severe"
  ).length;
  const offlineEV = evStations.filter((s) => s.status === "offline").length;
  const liveEvents = events.filter((e) => {
    const now = new Date();
    return new Date(e.start_time) <= now && new Date(e.end_time) >= now;
  }).length;
  const highRisk = riskZones.filter((z) => z.risk_level === "high").length;

  const stats = [
    {
      label: "Active Complaints",
      value: activeComplaints,
      icon: AlertTriangle,
      color: "#ef4444",
      gradient: "from-red-500/20 to-red-600/5",
    },
    {
      label: "Congested Zones",
      value: congestedZones,
      icon: MapPin,
      color: "#f97316",
      gradient: "from-orange-500/20 to-orange-600/5",
    },
    {
      label: "EV Offline",
      value: offlineEV,
      icon: ZapOff,
      color: "#f59e0b",
      gradient: "from-amber-500/20 to-amber-600/5",
    },
    {
      label: "Live Events",
      value: liveEvents || events.length,
      icon: Calendar,
      color: "#8b5cf6",
      gradient: "from-violet-500/20 to-violet-600/5",
    },
    {
      label: "High Risk Areas",
      value: highRisk,
      icon: ShieldAlert,
      color: "#ef4444",
      gradient: "from-red-500/20 to-red-600/5",
    },
  ];

  return (
    <div className="stats-cards">
      {stats.map((stat) => (
        <div key={stat.label} className={`stat-card bg-gradient-to-br ${stat.gradient}`}>
          <div className="stat-icon" style={{ color: stat.color }}>
            <stat.icon size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </span>
            <span className="stat-label">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
