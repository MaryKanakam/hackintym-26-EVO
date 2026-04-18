import { mockTolls } from "@/data/mockTolls";

const STATE_COORDS = {
  "Andhra Pradesh": [15.9129, 79.7400],
  "Arunachal Pradesh": [28.2180, 94.7278],
  "Assam": [26.2006, 92.9376],
  "Bihar": [25.0961, 85.3131],
  "Chhattisgarh": [21.2787, 81.8661],
  "Goa": [15.2993, 74.1240],
  "Gujarat": [22.2587, 71.1924],
  "Haryana": [29.0588, 76.0856],
  "Himachal Pradesh": [31.1048, 77.1665],
  "Jharkhand": [23.6102, 85.2799],
  "Karnataka": [15.3173, 75.7139],
  "Kerala": [10.8505, 76.2711],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Maharashtra": [19.7515, 75.7139],
  "Manipur": [24.6637, 93.9063],
  "Meghalaya": [25.4670, 91.3662],
  "Mizoram": [23.1645, 92.9376],
  "Nagaland": [26.1584, 94.5624],
  "Odisha": [20.9517, 85.0985],
  "Punjab": [31.1471, 75.3412],
  "Rajasthan": [27.0238, 74.2179],
  "Sikkim": [27.5330, 88.5122],
  "Tamil Nadu": [11.1271, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "Tripura": [23.9408, 91.9882],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Uttarakhand": [30.0668, 79.0193],
  "West Bengal": [22.9868, 87.8550],
  "Delhi": [28.7041, 77.1025],
  "Jammu and Kashmir": [33.7782, 76.5762],
  "Puducherry": [11.9416, 79.8083],
};

// no mock state coords needed

/**
 * Parse CSV text into an array of objects.
 * Handles quoted fields and trims whitespace.
 */
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  // Helper function to safely split CSV handling quotes
  const splitCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += c;
      }
    }
    result.push(current);
    return result.map((v) => v.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
  };

  // Parse header
  const headers = splitCSVLine(lines[0]);

  // Map CSV headers to our internal keys
  const headerMap = {
    "PLAZA ID": "plaza_id",
    "PLAZA NAME": "plaza_name",
    "PLAZA TYPE": "plaza_type",
    "PLAZA CITY": "plaza_city",
    "PLAZA STATE": "plaza_state",
    "CONCESSIONAIRE": "concessionaire",
    "LATITUDE": "latitude",
    "LONGITUDE": "longitude",
    "LAT": "latitude",
    "LNG": "longitude",
    "LON": "longitude",
  };

  const mappedHeaders = headers.map((h) => headerMap[h.toUpperCase()] || h.toLowerCase().replace(/\s+/g, "_"));

  // Parse rows
  const data = [];
  const uniqueIds = new Set();

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length < mappedHeaders.length) {
      console.warn(`[CSV Parser] Row ${i} has fewer columns than headers. Skipping.`);
      continue;
    }

    const row = {};
    mappedHeaders.forEach((key, idx) => {
      row[key] = values[idx] || "";
    });

    // Ignore invalid or missing rows
    if (!row.plaza_id) {
      console.warn(`[CSV Parser] Row ${i} is missing PLAZA ID. Skipping.`);
      continue;
    }

    // Remove duplicates
    if (uniqueIds.has(row.plaza_id)) {
      console.warn(`[CSV Parser] Row ${i} has duplicate PLAZA ID: ${row.plaza_id}. Skipping.`);
      continue;
    }

    // Validate coordinates - do not skip, just set to null if invalid so it shows in the table
    let lat = null;
    let lng = null;
    
    // First, try to use exact CSV coordinates if they exist
    if (row.latitude && row.longitude) {
      const parsedLat = parseFloat(row.latitude);
      const parsedLng = parseFloat(row.longitude);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        lat = parsedLat;
        lng = parsedLng;
      }
    } 
    
    // Fallback: If no coordinates provided in CSV, pinpoint at the State's center
    // Add a very small micro-jitter so multiple markers in the same state do not perfectly overlap and obscure each other.
    if (lat === null || lng === null) {
      if (row.plaza_state && STATE_COORDS[row.plaza_state]) {
        // +/- 0.3 degrees offset (approx 30km) so they form a visible cluster
        lat = STATE_COORDS[row.plaza_state][0] + (Math.random() * 0.6 - 0.3);
        lng = STATE_COORDS[row.plaza_state][1] + (Math.random() * 0.6 - 0.3);
      } else {
        console.warn(`[CSV Parser] Row ${i} (Plaza ${row.plaza_id}) has no coordinates and no valid state mapped. Ignoring point.`);
      }
    }

    // Add to dataset
    uniqueIds.add(row.plaza_id);
    row.latitude = lat;
    row.longitude = lng;
    data.push(row);
  }

  return data;
}

/**
 * Fetch toll plaza data.
 * Tries to load from /data/toll_plaza.csv first, falls back to mock data.
 */
export async function getTollPlazas() {
  try {
    const response = await fetch("/data/toll_plaza.csv");
    if (response.ok) {
      const csvText = await response.text();
      // Check it's actually CSV and not an HTML error page
      if (csvText.includes("PLAZA") || csvText.includes("plaza")) {
        const parsed = parseCSV(csvText);
        if (parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    console.log("CSV not found, using mock data");
  }

  return [...mockTolls];
}

/**
 * Get unique values for a given field (for filter dropdowns).
 */
export function getUniqueValues(data, field) {
  return [...new Set(data.map((item) => item[field]).filter(Boolean))].sort();
}

/**
 * Get summary statistics from toll data.
 */
export function getTollStats(data) {
  const totalPlazas = data.length;
  const states = new Set(data.map((d) => d.plaza_state));
  const cities = new Set(data.map((d) => d.plaza_city));
  const concessionaires = new Set(data.map((d) => d.concessionaire));
  const types = {};
  data.forEach((d) => {
    types[d.plaza_type] = (types[d.plaza_type] || 0) + 1;
  });
  const stateBreakdown = {};
  data.forEach((d) => {
    stateBreakdown[d.plaza_state] = (stateBreakdown[d.plaza_state] || 0) + 1;
  });
  const concessionaireBreakdown = {};
  data.forEach((d) => {
    concessionaireBreakdown[d.concessionaire] = (concessionaireBreakdown[d.concessionaire] || 0) + 1;
  });

  return {
    totalPlazas,
    totalStates: states.size,
    totalCities: cities.size,
    totalConcessionaires: concessionaires.size,
    typeBreakdown: types,
    stateBreakdown,
    concessionaireBreakdown,
  };
}
