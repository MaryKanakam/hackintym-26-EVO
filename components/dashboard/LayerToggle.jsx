"use client";

import { useState } from "react";
import {
  MapPin,
  AlertTriangle,
  Zap,
  Calendar,
  Shield,
  ChevronDown,
  ChevronUp,
  Filter,
  Landmark,
} from "lucide-react";

const layers = [
  { id: "traffic", label: "Traffic Hotspots", icon: MapPin, color: "#dc2626" },
  { id: "complaints", label: "Civic Complaints", icon: AlertTriangle, color: "#ef4444" },
  { id: "ev", label: "EV Stations", icon: Zap, color: "#4ade80" }, // Light green for EV status
  { id: "events", label: "City Events", icon: Calendar, color: "#f87171" },
  { id: "tolls", label: "Toll Plazas", icon: Landmark, color: "#ffffff" },
  { id: "risk", label: "Risk Zones", icon: Shield, color: "#991b1b" },
];

export default function LayerToggle({ activeLayers, onToggleLayer, layerCounts = {} }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="layer-toggle-panel">
      <button
        className="panel-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="panel-header-left">
          <Filter size={16} />
          <span>Map Layers</span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="layer-list">
          {layers.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              className={`layer-item ${activeLayers.has(id) ? "layer-active" : ""}`}
              onClick={() => onToggleLayer(id)}
            >
              <div className="layer-item-left">
                <div
                  className="layer-dot"
                  style={{
                    background: activeLayers.has(id) ? color : "#4b5563",
                    boxShadow: activeLayers.has(id) ? `0 0 8px ${color}60` : "none",
                  }}
                ></div>
                <Icon size={14} style={{ color: activeLayers.has(id) ? color : "#9ca3af" }} />
                <span>{label}</span>
              </div>
              {layerCounts[id] !== undefined && (
                <span className="layer-count">{layerCounts[id]}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
