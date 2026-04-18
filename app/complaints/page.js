"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import { getComplaints } from "@/services/complaintsService";
import { getSeverityBg, getStatusBg, capitalize, formatDate, timeAgo } from "@/utils/formatters";
import { AlertTriangle } from "lucide-react";

const categories = ["all", "pothole", "garbage", "waterlogging", "streetlight", "signal failure", "road accident", "crowd issue"];
const severities = ["all", "low", "medium", "high"];
const statuses = ["all", "reported", "reviewing", "in progress", "resolved"];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const data = await getComplaints();
      setComplaints(data);
    }
    load();
  }, []);

  const filtered = complaints.filter((c) => {
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    if (severityFilter !== "all" && c.severity !== severityFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <div className="page-layout">
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <AlertTriangle size={24} />
                Civic Complaints
              </h1>
              <p className="page-subtitle">{filtered.length} complaints found</p>
            </div>
            <div className="page-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`page-filter-btn ${categoryFilter === cat ? "active" : ""}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === "all" ? "All" : capitalize(cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="page-filters" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>Severity:</span>
            {severities.map((sev) => (
              <button
                key={sev}
                className={`page-filter-btn ${severityFilter === sev ? "active" : ""}`}
                onClick={() => setSeverityFilter(sev)}
              >
                {sev === "all" ? "All" : capitalize(sev)}
              </button>
            ))}
            <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center", marginLeft: 12 }}>Status:</span>
            {statuses.map((st) => (
              <button
                key={st}
                className={`page-filter-btn ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === "all" ? "All" : capitalize(st)}
              </button>
            ))}
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{c.title}</td>
                    <td>{capitalize(c.category)}</td>
                    <td>
                      <span className={`badge ${getSeverityBg(c.severity)}`}>
                        {capitalize(c.severity)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBg(c.status)}`}>
                        {capitalize(c.status)}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{timeAgo(c.created_at)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No complaints match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
