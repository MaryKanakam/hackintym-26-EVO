"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import { getComplaints } from "@/services/complaintsService";
import { getTrafficHotspots } from "@/services/trafficService";
import { getEVStations } from "@/services/evService";
import { getCityEvents } from "@/services/eventsService";
import { getRiskZones } from "@/services/riskService";
import { capitalize } from "@/utils/formatters";
import { BarChart3, TrendingUp, AlertTriangle, Zap, MapPin } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#f59e0b", "#22c55e"];

export default function InsightsPage() {
  const [complaints, setComplaints] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [evStations, setEVStations] = useState([]);
  const [events, setEvents] = useState([]);
  const [riskZones, setRiskZones] = useState([]);

  useEffect(() => {
    async function load() {
      const [c, t, e, ev, r] = await Promise.all([
        getComplaints(),
        getTrafficHotspots(),
        getEVStations(),
        getCityEvents(),
        getRiskZones(),
      ]);
      setComplaints(c);
      setTraffic(t);
      setEVStations(e);
      setEvents(ev);
      setRiskZones(r);
    }
    load();
  }, []);

  // Complaints by category
  const complaintsByCategory = Object.entries(
    complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name: capitalize(name), count }));

  // Complaints by status
  const complaintsByStatus = Object.entries(
    complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: capitalize(name), value }));

  // EV station utilization
  const evUtilization = [
    { name: "Available", value: evStations.filter((s) => s.status === "available").length },
    { name: "Busy", value: evStations.filter((s) => s.status === "busy").length },
    { name: "Offline", value: evStations.filter((s) => s.status === "offline").length },
  ];
  const evPieColors = ["#22c55e", "#f59e0b", "#ef4444"];

  // Traffic congestion distribution
  const trafficByLevel = Object.entries(
    traffic.reduce((acc, t) => {
      acc[t.congestion_level] = (acc[t.congestion_level] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name: capitalize(name), count }));

  // Risk zones radar
  const riskRadar = riskZones.map((z) => ({
    zone: z.zone_name,
    score: z.risk_score,
  }));

  // Summary stats
  const activeComplaints = complaints.filter((c) => c.status !== "resolved").length;
  const congestedCount = traffic.filter((t) => t.congestion_level === "heavy" || t.congestion_level === "severe").length;
  const totalEVSlots = evStations.reduce((s, e) => s + e.total_slots, 0);
  const freeEVSlots = evStations.reduce((s, e) => s + e.available_slots, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          padding: "8px 12px",
          color: "var(--text-primary)",
          fontSize: 12,
        }}>
          <p style={{ fontWeight: 600 }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color || "var(--text-secondary)" }}>
              {p.name || p.dataKey}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Navbar />
      <div className="page-layout">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <BarChart3 size={24} />
                City Insights
              </h1>
              <p className="page-subtitle">Analytics and summaries from city data</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-value" style={{ color: "#ef4444" }}>{activeComplaints}</div>
              <div className="summary-label">Active Complaints</div>
            </div>
            <div className="summary-card">
              <div className="summary-value" style={{ color: "#f97316" }}>{congestedCount}</div>
              <div className="summary-label">Congested Zones</div>
            </div>
            <div className="summary-card">
              <div className="summary-value" style={{ color: "#22c55e" }}>{freeEVSlots}/{totalEVSlots}</div>
              <div className="summary-label">EV Slots Free</div>
            </div>
            <div className="summary-card">
              <div className="summary-value" style={{ color: "#8b5cf6" }}>{events.length}</div>
              <div className="summary-label">City Events</div>
            </div>
          </div>

          {/* Charts */}
          <div className="chart-grid">
            {/* Complaints by Category */}
            <div className="chart-card">
              <div className="chart-card-title">
                <AlertTriangle size={16} />
                Complaints by Category
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={complaintsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {complaintsByCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* EV Utilization */}
            <div className="chart-card">
              <div className="chart-card-title">
                <Zap size={16} />
                EV Station Utilization
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={evUtilization}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {evUtilization.map((_, i) => (
                      <Cell key={i} fill={evPieColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: -8 }}>
                {evUtilization.map((item, i) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: evPieColors[i] }}></div>
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Distribution */}
            <div className="chart-card">
              <div className="chart-card-title">
                <MapPin size={16} />
                Traffic Congestion Levels
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trafficByLevel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "var(--text-muted)", fontSize: 11 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {trafficByLevel.map((entry, i) => {
                      const colors = { Low: "#22c55e", Moderate: "#f59e0b", Heavy: "#f97316", Severe: "#ef4444" };
                      return <Cell key={i} fill={colors[entry.name] || "#6366f1"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Zones Radar */}
            <div className="chart-card">
              <div className="chart-card-title">
                <TrendingUp size={16} />
                Risk Score by Zone
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={riskRadar}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="zone" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Findings */}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>
              📊 Key Takeaways
            </h2>
            <div className="data-cards-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="data-card">
                <div className="data-card-title" style={{ fontSize: 13 }}>Most Reported Issue</div>
                <div className="data-card-desc">
                  {complaintsByCategory.length > 0
                    ? `${complaintsByCategory.sort((a, b) => b.count - a.count)[0]?.name} with ${complaintsByCategory[0]?.count} complaints`
                    : "Loading..."}
                </div>
              </div>
              <div className="data-card">
                <div className="data-card-title" style={{ fontSize: 13 }}>Highest Risk Zone</div>
                <div className="data-card-desc">
                  {riskZones.length > 0
                    ? `${riskZones.sort((a, b) => b.risk_score - a.risk_score)[0]?.zone_name} (Score: ${riskZones[0]?.risk_score}/100)`
                    : "Loading..."}
                </div>
              </div>
              <div className="data-card">
                <div className="data-card-title" style={{ fontSize: 13 }}>EV Network Health</div>
                <div className="data-card-desc">
                  {evStations.length > 0
                    ? `${Math.round(((evStations.length - evStations.filter(s => s.status === "offline").length) / evStations.length) * 100)}% stations operational`
                    : "Loading..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
