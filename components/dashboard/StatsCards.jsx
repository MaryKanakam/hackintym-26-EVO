"use client";

import {
  AlertTriangle,
  MapPin,
  ZapOff,
  Calendar,
  ShieldAlert,
} from "lucide-react";

import { useLanguage } from "@/utils/LanguageContext";

export default function StatsCards({ complaints, traffic, evStations, events, riskZones }) {
  const { t } = useLanguage();
  const activeComplaints = complaints.length;
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
      labelKey: "activeComplaints",
      value: activeComplaints,
      icon: AlertTriangle,
      color: "#dc2626",
      gradient: "from-red-600/20 to-red-900/5",
    },
    {
      labelKey: "congestedZones",
      value: congestedZones,
      icon: MapPin,
      color: "#f87171",
      gradient: "from-red-400/20 to-black/5",
    },
    {
      labelKey: "evOffline",
      value: offlineEV,
      icon: ZapOff,
      color: "#9ca3af",
      gradient: "from-gray-600/20 to-black/5",
    },
    {
      labelKey: "liveEvents",
      value: liveEvents || events.length,
      icon: Calendar,
      color: "#ef4444",
      gradient: "from-red-500/20 to-red-800/5",
    },
    {
      labelKey: "highRisk",
      value: highRisk,
      icon: ShieldAlert,
      color: "#991b1b",
      gradient: "from-red-900/20 to-black/5",
    },
  ];

  return (
    <div className="stats-cards">
      {stats.map((stat) => (
        <div key={stat.labelKey} className={`stat-card bg-gradient-to-br ${stat.gradient}`}>
          <div className="stat-icon" style={{ color: stat.color }}>
            <stat.icon size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </span>
            <span className="stat-label">{t(stat.labelKey)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
