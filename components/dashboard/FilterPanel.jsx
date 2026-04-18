"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";

const categories = [
  "all",
  "pothole",
  "garbage",
  "waterlogging",
  "streetlight",
  "signal failure",
  "road accident",
  "crowd issue",
];

const severities = ["all", "low", "medium", "high"];
const timeRanges = ["all", "today", "this week", "this month"];

export default function FilterPanel({ filters, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value === "all" ? null : value });
  };

  const handleReset = () => {
    onFilterChange({ category: null, severity: null, timeRange: null });
  };

  const hasActiveFilters = filters.category || filters.severity || filters.timeRange;

  return (
    <div className="filter-panel">
      <button
        className="panel-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="panel-header-left">
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {hasActiveFilters && <span className="filter-active-dot"></span>}
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={filters.category || "all"}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Severity</label>
            <select
              className="filter-select"
              value={filters.severity || "all"}
              onChange={(e) => handleChange("severity", e.target.value)}
            >
              {severities.map((sev) => (
                <option key={sev} value={sev}>
                  {sev === "all" ? "All Severities" : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Time Range</label>
            <select
              className="filter-select"
              value={filters.timeRange || "all"}
              onChange={(e) => handleChange("timeRange", e.target.value)}
            >
              {timeRanges.map((tr) => (
                <option key={tr} value={tr}>
                  {tr === "all" ? "All Time" : tr.charAt(0).toUpperCase() + tr.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="filter-reset-btn" onClick={handleReset}>
              <X size={14} />
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
