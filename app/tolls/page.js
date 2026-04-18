"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/common/Navbar";
import { getTollPlazas, getUniqueValues, getTollStats } from "@/services/tollService";
import { capitalize } from "@/utils/formatters";
import {
  Landmark,
  MapPin,
  Building2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Map,
  Users,
  X,
  Download,
  FileSpreadsheet,
} from "lucide-react";
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
} from "recharts";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#22c55e", "#3b82f6", "#f59e0b", "#14b8a6"];

export default function TollsPage() {
  const [tolls, setTolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [csvLoaded, setCsvLoaded] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [concessionaireFilter, setConcessionaireFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // View
  const [viewMode, setViewMode] = useState("table"); // "table" | "analytics"
  const [sortField, setSortField] = useState("plaza_id");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getTollPlazas();
      setTolls(data);
      // Check if data came from CSV (more items or different IDs than mock)
      setCsvLoaded(data.length > 0 && data[0]?.plaza_id !== "TN-001");
      setIsLoading(false);
    }
    load();
  }, []);

  // Unique filter values
  const states = useMemo(() => getUniqueValues(tolls, "plaza_state"), [tolls]);
  const types = useMemo(() => getUniqueValues(tolls, "plaza_type"), [tolls]);
  const concessionaires = useMemo(() => getUniqueValues(tolls, "concessionaire"), [tolls]);
  const stats = useMemo(() => getTollStats(tolls), [tolls]);

  // Filtered data
  const filtered = useMemo(() => {
    let data = [...tolls];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (t) =>
          t.plaza_name?.toLowerCase().includes(q) ||
          t.plaza_id?.toLowerCase().includes(q) ||
          t.plaza_city?.toLowerCase().includes(q) ||
          t.concessionaire?.toLowerCase().includes(q)
      );
    }
    if (stateFilter !== "all") data = data.filter((t) => t.plaza_state === stateFilter);
    if (typeFilter !== "all") data = data.filter((t) => t.plaza_type === typeFilter);
    if (concessionaireFilter !== "all") data = data.filter((t) => t.concessionaire === concessionaireFilter);

    // Sort
    data.sort((a, b) => {
      const aVal = (a[sortField] || "").toLowerCase();
      const bVal = (b[sortField] || "").toLowerCase();
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return data;
  }, [tolls, searchQuery, stateFilter, typeFilter, concessionaireFilter, sortField, sortDir]);

  const hasActiveFilters = stateFilter !== "all" || typeFilter !== "all" || concessionaireFilter !== "all" || searchQuery;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStateFilter("all");
    setTypeFilter("all");
    setConcessionaireFilter("all");
  };

  // Chart data
  const stateChartData = useMemo(
    () =>
      Object.entries(stats.stateBreakdown)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    [stats]
  );

  const typeChartData = useMemo(
    () => Object.entries(stats.typeBreakdown).map(([name, value]) => ({ name, value })),
    [stats]
  );

  const concessionaireChartData = useMemo(
    () =>
      Object.entries(stats.concessionaireBreakdown)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    [stats]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="toll-chart-tooltip">
          <p style={{ fontWeight: 600 }}>{label || payload[0]?.name}</p>
          <p style={{ color: payload[0]?.color || "var(--text-secondary)" }}>
            Count: {payload[0]?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="page-layout">
          <div className="page-container">
            <div className="loading-container">
              <div className="loading-spinner w-8 h-8">
                <div className="spinner-ring"></div>
              </div>
              <p className="loading-text">Loading toll plaza data...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-layout">
        <div className="page-container">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <Landmark size={24} />
                Toll Plaza Dashboard
              </h1>
              <p className="page-subtitle">
                {filtered.length} of {tolls.length} toll plazas
                {csvLoaded && (
                  <span className="toll-csv-badge">
                    <FileSpreadsheet size={12} />
                    CSV Data
                  </span>
                )}
                {!csvLoaded && (
                  <span className="toll-mock-badge">
                    Mock Data — Place your CSV at <code>public/data/toll_plaza.csv</code>
                  </span>
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={`page-filter-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <Landmark size={14} />
                Table
              </button>
              <button
                className={`page-filter-btn ${viewMode === "analytics" ? "active" : ""}`}
                onClick={() => setViewMode("analytics")}
              >
                <BarChart3 size={14} />
                Analytics
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="toll-stats-row">
            <div className="toll-stat-card">
              <Landmark size={20} className="toll-stat-icon" style={{ color: "#6366f1" }} />
              <div>
                <span className="toll-stat-value" style={{ color: "#6366f1" }}>{stats.totalPlazas}</span>
                <span className="toll-stat-label">Total Plazas</span>
              </div>
            </div>
            <div className="toll-stat-card">
              <Map size={20} className="toll-stat-icon" style={{ color: "#8b5cf6" }} />
              <div>
                <span className="toll-stat-value" style={{ color: "#8b5cf6" }}>{stats.totalStates}</span>
                <span className="toll-stat-label">States</span>
              </div>
            </div>
            <div className="toll-stat-card">
              <MapPin size={20} className="toll-stat-icon" style={{ color: "#22c55e" }} />
              <div>
                <span className="toll-stat-value" style={{ color: "#22c55e" }}>{stats.totalCities}</span>
                <span className="toll-stat-label">Cities</span>
              </div>
            </div>
            <div className="toll-stat-card">
              <Building2 size={20} className="toll-stat-icon" style={{ color: "#f59e0b" }} />
              <div>
                <span className="toll-stat-value" style={{ color: "#f59e0b" }}>{stats.totalConcessionaires}</span>
                <span className="toll-stat-label">Concessionaires</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="toll-toolbar">
            <div className="toll-search-box">
              <Search size={14} className="toll-search-icon" />
              <input
                type="text"
                placeholder="Search by name, ID, city, or concessionaire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="toll-search-input"
              />
              {searchQuery && (
                <button className="toll-search-clear" onClick={() => setSearchQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              className={`toll-filter-toggle ${showFilters ? "active" : ""} ${hasActiveFilters ? "has-filters" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} />
              Filters
              {hasActiveFilters && <span className="toll-filter-dot"></span>}
            </button>
            {hasActiveFilters && (
              <button className="toll-clear-btn" onClick={clearFilters}>
                <X size={14} />
                Clear All
              </button>
            )}
          </div>

          {showFilters && (
            <div className="toll-filters-row">
              <div className="toll-filter-group">
                <label>State</label>
                <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                  <option value="all">All States ({states.length})</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="toll-filter-group">
                <label>Plaza Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">All Types ({types.length})</option>
                  {types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="toll-filter-group">
                <label>Concessionaire</label>
                <select value={concessionaireFilter} onChange={(e) => setConcessionaireFilter(e.target.value)}>
                  <option value="all">All ({concessionaires.length})</option>
                  {concessionaires.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {[
                      { key: "plaza_id", label: "Plaza ID" },
                      { key: "plaza_name", label: "Plaza Name" },
                      { key: "plaza_type", label: "Type" },
                      { key: "plaza_city", label: "City" },
                      { key: "plaza_state", label: "State" },
                      { key: "concessionaire", label: "Concessionaire" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        style={{ cursor: "pointer", userSelect: "none" }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {label}
                          {sortField === key && (
                            sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((toll, idx) => (
                    <tr key={toll.plaza_id + "-" + idx}>
                      <td>
                        <span className="toll-id-badge">{toll.plaza_id}</span>
                      </td>
                      <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {toll.plaza_name}
                      </td>
                      <td>
                        <span className={`badge toll-type-badge toll-type-${toll.plaza_type?.toLowerCase().replace(/\s+/g, "-")}`}>
                          {toll.plaza_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                          {toll.plaza_city}
                        </span>
                      </td>
                      <td>{toll.plaza_state}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Building2 size={12} style={{ color: "var(--text-muted)" }} />
                          {toll.concessionaire}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                        No toll plazas match your search or filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {viewMode === "analytics" && (
            <div className="chart-grid">
              {/* By State */}
              <div className="chart-card">
                <div className="chart-card-title">
                  <Map size={16} />
                  Toll Plazas by State
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stateChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stateChartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* By Type */}
              <div className="chart-card">
                <div className="chart-card-title">
                  <Landmark size={16} />
                  Distribution by Plaza Type
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {typeChartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="toll-chart-legend">
                  {typeChartData.map((item, i) => (
                    <div key={item.name} className="toll-legend-item">
                      <div className="toll-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                      {item.name} ({item.value})
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Concessionaires */}
              <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
                <div className="chart-card-title">
                  <Building2 size={16} />
                  Top Concessionaires
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={concessionaireChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "var(--text-muted)", fontSize: 11 }} width={150} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {concessionaireChartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
