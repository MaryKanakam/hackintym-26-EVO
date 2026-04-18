"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MapPin,
  Zap,
  Calendar,
  TrendingUp,
  Eye,
} from "lucide-react";
import { capitalize } from "@/utils/formatters";

export default function InsightPanel({ complaints, traffic, evStations, events, riskZones }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute insights
  const mostAffectedZone = riskZones.length > 0
    ? riskZones.reduce((a, b) => (a.risk_score > b.risk_score ? a : b))
    : null;

  const activeComplaints = complaints.filter((c) => c.status !== "resolved");

  const topCongestion = traffic.length > 0
    ? traffic.reduce((a, b) => {
        const levels = { low: 1, moderate: 2, heavy: 3, severe: 4 };
        return (levels[a.congestion_level] || 0) > (levels[b.congestion_level] || 0) ? a : b;
      })
    : null;

  const highCrowdEvents = events.filter((e) => e.crowd_level === "high");

  // Category breakdown
  const categoryCounts = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  if (isCollapsed) {
    return (
      <button
        className="insight-collapsed-btn"
        onClick={() => setIsCollapsed(false)}
      >
        <ChevronLeft size={16} />
        <Eye size={16} />
      </button>
    );
  }

  return (
    <div className="insight-panel">
      <div className="insight-header">
        <h3 className="insight-title">
          <Eye size={16} />
          City Insights
        </h3>
        <button onClick={() => setIsCollapsed(true)} className="insight-collapse-btn">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="insight-list">
        {mostAffectedZone && (
          <div className="insight-item insight-danger">
            <div className="insight-item-icon">
              <AlertTriangle size={14} />
            </div>
            <div>
              <span className="insight-item-label">Most Affected Zone</span>
              <span className="insight-item-value">{mostAffectedZone.zone_name}</span>
              <span className="insight-item-sub">Risk Score: {mostAffectedZone.risk_score}/100</span>
            </div>
          </div>
        )}

        <div className="insight-item insight-warning">
          <div className="insight-item-icon">
            <AlertTriangle size={14} />
          </div>
          <div>
            <span className="insight-item-label">Active Complaints</span>
            <span className="insight-item-value">{activeComplaints.length} unresolved</span>
            {topCategory && (
              <span className="insight-item-sub">
                Top: {capitalize(topCategory[0])} ({topCategory[1]})
              </span>
            )}
          </div>
        </div>

        {topCongestion && (
          <div className="insight-item insight-orange">
            <div className="insight-item-icon">
              <MapPin size={14} />
            </div>
            <div>
              <span className="insight-item-label">Highest Traffic</span>
              <span className="insight-item-value">{topCongestion.area_name}</span>
              <span className="insight-item-sub">
                {capitalize(topCongestion.congestion_level)} congestion
              </span>
            </div>
          </div>
        )}

        {highCrowdEvents.length > 0 && (
          <div className="insight-item insight-purple">
            <div className="insight-item-icon">
              <Calendar size={14} />
            </div>
            <div>
              <span className="insight-item-label">High Crowd Events</span>
              <span className="insight-item-value">{highCrowdEvents.length} events</span>
              <span className="insight-item-sub">{highCrowdEvents[0]?.title}</span>
            </div>
          </div>
        )}

        <div className="insight-item insight-green">
          <div className="insight-item-icon">
            <Zap size={14} />
          </div>
          <div>
            <span className="insight-item-label">EV Network</span>
            <span className="insight-item-value">
              {evStations.filter((s) => s.status === "available").length}/{evStations.length} online
            </span>
            <span className="insight-item-sub">
              {evStations.reduce((sum, s) => sum + s.available_slots, 0)} slots free
            </span>
          </div>
        </div>

        <div className="insight-item insight-blue">
          <div className="insight-item-icon">
            <TrendingUp size={14} />
          </div>
          <div>
            <span className="insight-item-label">Attention Zone</span>
            <span className="insight-item-value">
              {mostAffectedZone?.zone_name || "Monitoring..."}
            </span>
            <span className="insight-item-sub">Recommended focus area</span>
          </div>
        </div>
      </div>
    </div>
  );
}
