"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import { getEVStations } from "@/services/evService";
import { getEVStatusBg, capitalize } from "@/utils/formatters";
import { Zap, MapPin } from "lucide-react";

export default function EVStationsPage() {
  const [stations, setStations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const data = await getEVStations();
      setStations(data);
    }
    load();
  }, []);

  const filtered = stations.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const totalSlots = stations.reduce((sum, s) => sum + s.total_slots, 0);
  const availableSlots = stations.reduce((sum, s) => sum + s.available_slots, 0);
  const onlineCount = stations.filter((s) => s.status !== "offline").length;

  return (
    <>
      <Navbar />
      <div className="page-layout">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <Zap size={24} />
                EV Charging Stations
              </h1>
              <p className="page-subtitle">
                {onlineCount}/{stations.length} online · {availableSlots}/{totalSlots} slots available
              </p>
            </div>
            <div className="page-filters">
              {["all", "available", "busy", "offline"].map((st) => (
                <button
                  key={st}
                  className={`page-filter-btn ${statusFilter === st ? "active" : ""}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === "all" ? "All Stations" : capitalize(st)}
                </button>
              ))}
            </div>
          </div>

          <div className="data-cards-grid">
            {filtered.map((station) => {
              const percentage = station.total_slots > 0
                ? (station.available_slots / station.total_slots) * 100
                : 0;
              const fillColor =
                station.status === "offline" ? "#ef4444" :
                station.status === "busy" ? "#f59e0b" : "#22c55e";

              return (
                <div key={station.id} className="data-card">
                  <div className="data-card-header">
                    <div className="data-card-title">{station.name}</div>
                    <span className={`badge ${getEVStatusBg(station.status)}`}>
                      {capitalize(station.status)}
                    </span>
                  </div>

                  <div className="ev-card-slots">
                    <div className="ev-slots-bar">
                      <div
                        className="ev-slots-fill"
                        style={{ width: `${percentage}%`, background: fillColor }}
                      ></div>
                    </div>
                    <div className="ev-slots-text">
                      <Zap size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                      {station.available_slots} of {station.total_slots} slots available
                    </div>
                  </div>

                  <div className="data-card-meta">
                    <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} />
                      {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                No stations match your filter
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
