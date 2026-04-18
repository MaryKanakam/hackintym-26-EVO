import L from "leaflet";

// Chennai center coordinates
export const CHENNAI_CENTER = [13.0827, 80.2707];
export const DEFAULT_ZOOM = 12;

// Category icon colors
export const CATEGORY_COLORS = {
  pothole: "#ef4444",
  garbage: "#f59e0b",
  waterlogging: "#3b82f6",
  streetlight: "#8b5cf6",
  "signal failure": "#ec4899",
  "road accident": "#dc2626",
  "crowd issue": "#f97316",
};

// Congestion level colors and radii
export const CONGESTION_STYLES = {
  low: { color: "#22c55e", radius: 400, opacity: 0.3 },
  moderate: { color: "#f59e0b", radius: 600, opacity: 0.4 },
  heavy: { color: "#f97316", radius: 800, opacity: 0.5 },
  severe: { color: "#ef4444", radius: 1000, opacity: 0.6 },
};

// EV station status colors
export const EV_STATUS_COLORS = {
  available: "#22c55e",
  busy: "#f59e0b",
  offline: "#ef4444",
};

// Risk zone colors
export const RISK_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

// Crowd level colors
export const CROWD_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

// Create a colored circle marker icon
export function createCircleIcon(color, size = 12) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export const EVENT_MARKER = L.divIcon({
  className: "custom-marker",
  html: `<div style="background-color: var(--marker-event); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); border: 2px solid white;">🎉</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export const TOLL_MARKER = L.divIcon({
  className: "custom-marker",
  html: `<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); border: 2px solid white;">🛣️</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Create a category-specific marker icon
export function createCategoryIcon(category) {
  const color = CATEGORY_COLORS[category] || "#6b7280";
  const emojis = {
    pothole: "🕳️",
    garbage: "🗑️",
    waterlogging: "🌊",
    streetlight: "💡",
    "signal failure": "🚦",
    "road accident": "🚗",
    "crowd issue": "👥",
  };
  const emoji = emojis[category] || "📍";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 32px;
      height: 32px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// Create EV station marker
export function createEVIcon(status) {
  const color = EV_STATUS_COLORS[status] || "#6b7280";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 30px;
      height: 30px;
      background: ${color};
      border: 2px solid white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">⚡</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

// Create event marker
export function createEventIcon(crowdLevel) {
  const color = CROWD_COLORS[crowdLevel] || "#8b5cf6";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 30px;
      height: 30px;
      background: #8b5cf6;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">🎉</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

// OpenStreetMap tile options
export const MAP_TILES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
};
