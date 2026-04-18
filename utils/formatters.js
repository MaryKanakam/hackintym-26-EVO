// Date/time formatting
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateString) {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Severity styling
export function getSeverityColor(severity) {
  const colors = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#ef4444",
  };
  return colors[severity] || "#6b7280";
}

export function getSeverityBg(severity) {
  const colors = {
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[severity] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

// Status styling
export function getStatusColor(status) {
  const colors = {
    reported: "#f59e0b",
    reviewing: "#3b82f6",
    "in progress": "#8b5cf6",
    resolved: "#22c55e",
  };
  return colors[status] || "#6b7280";
}

export function getStatusBg(status) {
  const colors = {
    reported: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    reviewing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "in progress": "bg-violet-500/20 text-violet-400 border-violet-500/30",
    resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

// EV status styling
export function getEVStatusBg(status) {
  const colors = {
    available: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    busy: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    offline: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

// Congestion level styling
export function getCongestionBg(level) {
  const colors = {
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    moderate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    heavy: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    severe: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[level] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

// Risk level styling
export function getRiskBg(level) {
  const colors = {
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[level] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

// Number formatting
export function formatCompact(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Capitalize first letter
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Crowd level styling
export function getCrowdBg(level) {
  const colors = {
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[level] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}
