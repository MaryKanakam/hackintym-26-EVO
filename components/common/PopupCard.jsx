"use client";

import { getSeverityBg, getStatusBg, getEVStatusBg, getCongestionBg, getCrowdBg, capitalize, formatDateTime, timeAgo } from "@/utils/formatters";

export function ComplaintPopup({ data }) {
  return (
    <div className="popup-card">
      <div className="popup-header">
        <h3 className="popup-title">{data.title}</h3>
        <span className={`popup-badge ${getSeverityBg(data.severity)}`}>
          {capitalize(data.severity)}
        </span>
      </div>
      <p className="popup-desc">{data.description}</p>
      <div className="popup-meta">
        <span className={`popup-badge ${getStatusBg(data.status)}`}>
          {capitalize(data.status)}
        </span>
        <span className="popup-category">{capitalize(data.category)}</span>
        <span className="popup-time">{timeAgo(data.created_at)}</span>
      </div>
    </div>
  );
}

export function TrafficPopup({ data }) {
  return (
    <div className="popup-card">
      <div className="popup-header">
        <h3 className="popup-title">{data.area_name}</h3>
        <span className={`popup-badge ${getCongestionBg(data.congestion_level)}`}>
          {capitalize(data.congestion_level)}
        </span>
      </div>
      <div className="popup-meta">
        <span className="popup-time">Updated {timeAgo(data.updated_at)}</span>
      </div>
    </div>
  );
}

export function EVPopup({ data }) {
  return (
    <div className="popup-card">
      <div className="popup-header">
        <h3 className="popup-title">{data.name}</h3>
        <span className={`popup-badge ${getEVStatusBg(data.status)}`}>
          {capitalize(data.status)}
        </span>
      </div>
      <div className="popup-slots">
        <div className="slots-bar">
          <div
            className="slots-fill"
            style={{ width: `${(data.available_slots / data.total_slots) * 100}%` }}
          ></div>
        </div>
        <span className="slots-text">
          {data.available_slots}/{data.total_slots} slots available
        </span>
      </div>
      <div className="popup-meta">
        <span className="popup-time">Updated {timeAgo(data.updated_at)}</span>
      </div>
    </div>
  );
}

export function EventPopup({ data }) {
  return (
    <div className="popup-card">
      <div className="popup-header">
        <h3 className="popup-title">{data.title}</h3>
        <span className={`popup-badge ${getCrowdBg(data.crowd_level)}`}>
          {capitalize(data.crowd_level)} crowd
        </span>
      </div>
      <p className="popup-desc">{data.description}</p>
      <div className="popup-meta">
        <span className="popup-venue">📍 {data.venue}</span>
        <span className="popup-time">
          {formatDateTime(data.start_time)}
        </span>
      </div>
    </div>
  );
}

export function RiskPopup({ data }) {
  return (
    <div className="popup-card">
      <div className="popup-header">
        <h3 className="popup-title">{data.zone_name}</h3>
        <span className={`popup-badge ${getSeverityBg(data.risk_level)}`}>
          Risk: {capitalize(data.risk_level)}
        </span>
      </div>
      <div className="popup-score">
        <div className="score-bar">
          <div
            className="score-fill"
            style={{
              width: `${data.risk_score}%`,
              background: data.risk_level === "high" ? "#ef4444" : data.risk_level === "medium" ? "#f59e0b" : "#22c55e",
            }}
          ></div>
        </div>
        <span className="score-text">Score: {data.risk_score}/100</span>
      </div>
    </div>
  );
}

export function TollPopup({ data }) {
  const typeClass = `toll-type-${data.plaza_type?.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="popup-card">
      <div className="popup-header">
        <h3 className="popup-title">{data.plaza_id}</h3>
        <span className={`popup-badge toll-type-badge ${typeClass}`}>
          {data.plaza_type}
        </span>
      </div>
      <div className="popup-desc" style={{ marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>{data.plaza_name}</span>
      </div>
      <div className="popup-meta">
        <span className="popup-venue" style={{ fontSize: 11 }}>{data.plaza_city}, {data.plaza_state}</span>
      </div>
      <div className="popup-meta" style={{ marginTop: 4 }}>
        <span className="popup-venue" style={{ fontSize: 11, color: "var(--text-muted)" }}>{data.concessionaire}</span>
      </div>
    </div>
  );
}
