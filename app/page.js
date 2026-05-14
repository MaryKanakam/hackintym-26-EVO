"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/common/Navbar";
import LayerToggle from "@/components/dashboard/LayerToggle";
import FilterPanel from "@/components/dashboard/FilterPanel";
import StatsCards from "@/components/dashboard/StatsCards";
import InsightPanel from "@/components/dashboard/InsightPanel";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getComplaints } from "@/services/complaintsService";
import { getTrafficHotspots } from "@/services/trafficService";
import { getEVStations } from "@/services/evService";
import { getCityEvents } from "@/services/eventsService";
import { getRiskZones } from "@/services/riskService";
import { getTollPlazas } from "@/services/tollService";

// Dynamic import for MapView (Leaflet requires window object)
const MapView = dynamic(() => import("@/components/dashboard/MapView"), {
  ssr: false,
  loading: () => (
    <div className="loading-container" style={{ height: "100%" }}>
      <LoadingSpinner text="Loading map..." />
    </div>
  ),
});

export default function Dashboard() {
  const [activeLayers, setActiveLayers] = useState(
    new Set(["tolls"])
  );
  const [filters, setFilters] = useState({
    category: null,
    severity: null,
    timeRange: null,
  });
  const [complaints, setComplaints] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [evStations, setEVStations] = useState([]);
  const [events, setEvents] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [tolls, setTolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Individual fetchers with error handling to prevent one failure from blocking everything
      const safeFetch = async (promise, name) => {
        try {
          return await promise;
        } catch (e) {
          console.error(`[Data Fetch] Error loading ${name}:`, e);
          return []; // Return empty array on failure
        }
      };

      const [complaintsData, trafficData, evData, eventsData, riskData, tollsData] =
        await Promise.all([
          safeFetch(getComplaints(filters), "Complaints"),
          safeFetch(getTrafficHotspots(), "Traffic"),
          safeFetch(getEVStations(), "EV Stations"),
          safeFetch(getCityEvents(), "Events"),
          safeFetch(getRiskZones(), "Risk Zones"),
          safeFetch(getTollPlazas(), "Tolls"),
        ]);

      setComplaints(complaintsData);
      setTraffic(trafficData);
      setEVStations(evData);
      setEvents(eventsData);
      setRiskZones(riskData);
      setTolls(tollsData);
    } catch (err) {
      console.error("Critical Dashboard Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleLayer = (layerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  const layerCounts = {
    traffic: traffic.length,
    complaints: complaints.length,
    ev: evStations.length,
    events: events.length,
    risk: riskZones.length,
    tolls: tolls.length,
  };

  return (
    <>
      <Navbar onRefresh={fetchData} />
      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <div className="dashboard-sidebar">
          <LayerToggle
            activeLayers={activeLayers}
            onToggleLayer={handleToggleLayer}
            layerCounts={layerCounts}
          />
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {/* Map Area */}
        <div className="dashboard-main">
          <StatsCards
            complaints={complaints}
            traffic={traffic}
            evStations={evStations}
            events={events}
            riskZones={riskZones}
          />

          {isLoading ? (
            <div className="loading-container" style={{ height: "100%" }}>
              <LoadingSpinner text="Loading city data..." />
            </div>
          ) : (
            <MapView
              activeLayers={activeLayers}
              complaints={complaints}
              traffic={traffic}
              evStations={evStations}
              events={events}
              riskZones={riskZones}
              tolls={tolls}
            />
          )}

          <InsightPanel
            complaints={complaints}
            traffic={traffic}
            evStations={evStations}
            events={events}
            riskZones={riskZones}
          />
        </div>
      </div>
    </>
  );
}
