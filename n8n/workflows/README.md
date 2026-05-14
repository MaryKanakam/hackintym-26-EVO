# n8n Workflow Designs for urbanSense

## Overview
These workflows automate data ingestion for the urbanSense dashboard by simulating or processing city data and pushing it to Supabase.

---

## 1. Traffic Update Workflow
**Trigger**: Cron schedule (every 5 minutes)

**Steps**:
1. **Cron Trigger** — Runs every 5 minutes
2. **HTTP Request** (optional) — Fetch traffic data from an external API or generate mock data
3. **Function Node** — Transform traffic data into the `traffic_hotspots` schema:
   ```json
   {
     "area_name": "Anna Salai - Teynampet",
     "latitude": 13.0418,
     "longitude": 80.2468,
     "congestion_level": "severe",
     "updated_at": "2026-04-18T09:30:00Z"
   }
   ```
4. **Supabase Node** — Upsert data into the `traffic_hotspots` table
5. **Dashboard** — Receives realtime update automatically

---

## 2. Complaint Feed Workflow
**Trigger**: Webhook (POST /complaint) or Cron schedule

**Steps**:
1. **Webhook Trigger** — Receives complaint data via POST request
2. **Validation Node** — Validate required fields (title, category, severity, lat, lng)
3. **Function Node** — Enrich with defaults (status: "reported", created_at: now)
4. **Supabase Node** — Insert into `complaints` table
5. **IF Node** — Check if severity is "high"
6. **Send Notification** (optional) — Alert via email/Slack for high-severity complaints

---

## 3. Event Update Workflow
**Trigger**: Cron schedule (every hour)

**Steps**:
1. **Cron Trigger** — Hourly
2. **Function Node** — Generate or fetch event data
3. **Supabase Node** — Upsert into `city_events` table
4. **Function Node** — Check for events starting in next 30 minutes
5. **Supabase Node** — Update nearby `traffic_hotspots` as likely congested

---

## 4. Risk Score Calculation Workflow
**Trigger**: Cron schedule (every 15 minutes)

**Steps**:
1. **Cron Trigger** — Every 15 minutes
2. **Supabase Node** — Fetch all `complaints` (active)
3. **Supabase Node** — Fetch all `traffic_hotspots`
4. **Supabase Node** — Fetch all `city_events`
5. **Function Node** — For each zone, calculate risk score:
   ```javascript
   // Risk Score Algorithm
   let score = 0;
   score += nearbyComplaints.length * 10; // +10 per nearby complaint
   score += nearbyTraffic.filter(t => t.congestion_level === 'severe').length * 30;
   score += nearbyTraffic.filter(t => t.congestion_level === 'heavy').length * 20;
   score += nearbyEvents.filter(e => e.crowd_level === 'high').length * 20;
   score = Math.min(score, 100);
   
   const risk_level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
   ```
6. **Supabase Node** — Upsert into `risk_zones` table with new scores

---

## Setup Instructions

### Prerequisites
- n8n instance (self-hosted or cloud)
- Supabase project URL and service role key

### Connecting to Supabase in n8n
1. In n8n, add a **Supabase** credential
2. Enter your Supabase URL and **service role key** (not anon key)
3. Use Supabase nodes to query/insert/update tables

### Importing Workflows
1. Create a new workflow in n8n
2. Follow the step-by-step structure above
3. Configure Supabase credentials in each Supabase node
4. Enable the workflow and test with manual execution

---

## Mock Data Generation (Development)
For development, you can use n8n's Function node to generate random data:

```javascript
// Example: Generate random traffic hotspot
const areas = [
  { name: "Anna Salai", lat: 13.0418, lng: 80.2468 },
  { name: "Koyambedu", lat: 13.0694, lng: 80.1948 },
  { name: "OMR", lat: 12.9010, lng: 80.2279 },
];
const levels = ["low", "moderate", "heavy", "severe"];

const area = areas[Math.floor(Math.random() * areas.length)];
const level = levels[Math.floor(Math.random() * levels.length)];

return [{
  json: {
    area_name: area.name,
    latitude: area.lat,
    longitude: area.lng,
    congestion_level: level,
    updated_at: new Date().toISOString()
  }
}];
```
