"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import { getCityEvents } from "@/services/eventsService";
import { getCrowdBg, capitalize, formatDateTime, formatDate, formatTime } from "@/utils/formatters";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

import { useLanguage } from "@/utils/LanguageContext";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [crowdFilter, setCrowdFilter] = useState("all");
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const data = await getCityEvents();
      setEvents(data);
    }
    load();
  }, []);

  const filtered = events.filter((e) => {
    if (crowdFilter !== "all" && e.crowd_level !== crowdFilter) return false;
    return true;
  });

  const now = new Date();
  const ongoing = filtered.filter(
    (e) => new Date(e.start_time) <= now && new Date(e.end_time) >= now
  );
  const upcoming = filtered.filter((e) => new Date(e.start_time) > now);
  const past = filtered.filter((e) => new Date(e.end_time) < now);

  const renderSection = (title, items, emptyText) => (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        {title}
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>{emptyText}</p>
      ) : (
        <div className="data-cards-grid">
          {items.map((event) => (
            <div key={event.id} className="data-card">
              <div className="data-card-header">
                <div className="data-card-title">{event.title}</div>
                <span className={`badge ${getCrowdBg(event.crowd_level)}`}>
                  <Users size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                  {t(event.crowd_level)}
                </span>
              </div>
              <div className="data-card-desc">{event.description}</div>
              <div className="data-card-meta">
                <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={11} />
                  {event.venue}
                </span>
              </div>
              <div className="data-card-meta">
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} />
                  {formatDate(event.start_time)} · {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="page-layout">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <Calendar size={24} />
                {t("eventsHeader")}
              </h1>
              <p className="page-subtitle">{filtered.length} {t("events")} total</p>
            </div>
            <div className="page-filters">
              {["all", "low", "medium", "high"].map((level) => (
                <button
                  key={level}
                  className={`page-filter-btn ${crowdFilter === level ? "active" : ""}`}
                  onClick={() => setCrowdFilter(level)}
                >
                  {level === "all" ? t("all") : `${t(level)} ${t("congestion")}`}
                </button>
              ))}
            </div>
          </div>

          {renderSection(`🔴 ${t("happeningNow")}`, ongoing, t("noEvents"))}
          {renderSection(`🟡 ${t("upcoming")}`, upcoming, t("noEvents"))}
          {renderSection(`✅ ${t("all")}`, past, t("noEvents"))}
        </div>
      </div>
    </>
  );
}
