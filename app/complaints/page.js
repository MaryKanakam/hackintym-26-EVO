"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import { getComplaints } from "@/services/complaintsService";
import { getSeverityBg, capitalize, timeAgo } from "@/utils/formatters";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";

const severities = ["all", "low", "medium", "high"];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("all");
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const data = await getComplaints();
      setComplaints(data);
    }
    load();
  }, []);

  const filtered = complaints.filter((c) => {
    if (severityFilter !== "all" && (c.severity || "").toLowerCase() !== severityFilter.toLowerCase()) return false;
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
                {t("civicIssues")}
              </h1>
              <p className="page-subtitle">{filtered.length} {t("complaintsFound")}</p>
            </div>
          </div>

          <div className="page-filters" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>{t("severity")}:</span>
            {severities.map((sev) => (
              <button
                key={sev}
                className={`page-filter-btn ${severityFilter === sev ? "active" : ""}`}
                onClick={() => setSeverityFilter(sev)}
              >
                {t(sev)}
              </button>
            ))}
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("title")}</th>
                  <th>{t("severity")}</th>
                  <th>{t("summary")}</th>
                  <th>{t("reported")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500, minWidth: "180px" }}>{c.title}</td>
                    <td>
                      <span className={`badge ${getSeverityBg(c.severity)}`}>
                        {t(c.severity?.toLowerCase()) || c.severity}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "12px", maxWidth: "400px" }}>
                      {c.summary}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "12px", whiteSpace: "nowrap" }}>
                      {timeAgo(c.created_at)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No data found
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
