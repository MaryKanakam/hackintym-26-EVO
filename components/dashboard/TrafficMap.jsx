"use client";

import React, { useRef, useMemo, useEffect } from "react";
import Map, {
  Layer,
  Source,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/SimpleCard";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Local Mood Colors shim since we don't have useAreaMood
const MOOD_COLORS = {
  happy: "#2ecc71",
  sad: "#3498db",
  angry: "#e74c3c",
  "super happy": "#00ff00",
  "super sad": "#0000ff",
  "super angry": "#ff0000",
  neutral: "#95a5a6"
};

const severityColorMap = {
  Critical: "#dc2626",
  Major: "#FF7F50",
  Minor: "#FFD166",
  Info: "#3b82f6",
};

const toGeoJSON = (items) => ({
  type: "FeatureCollection",
  features: (items || []).map((item) => ({
    type: "Feature",
    geometry: (item.latitude && item.longitude) 
      ? { type: "Point", coordinates: [item.longitude, item.latitude] }
      : { type: "Point", coordinates: [80.2785, 13.06] },
    properties: item,
  })),
});

const trafficToGeoJSON = (items) => ({
  type: "FeatureCollection",
  features: (items || []).map((item) => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: item.coordinates || [],
    },
    properties: {
      congestionLevel: item.congestionLevel || 0,
    },
  })),
});

export function TrafficMapComponent({
  incidents = [],
  civicIssues = [],
  events = [],
  evHubs = [],
  traffic = [],
  sentiment = [],
  areaMoods = [],
  activeLayers = new Set(["traffic"]),
  mapMode = "Live",
  onFeatureClick = () => {},
  onMapLoad = () => {},
}) {
  const mapRef = useRef(null);
  const router = useRouter();

  if (!MAPBOX_TOKEN) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
        <Card className="max-w-md mx-4 text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="text-red-500" />
              Map Configuration Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Please add your Mapbox Access Token to the .env file.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initialViewState = {
    longitude: 80.2785,
    latitude: 13.06,
    zoom: 9, // Slightly more zoomed out to see the network
    pitch: 45,
  };

  const incidentsSource = useMemo(() => toGeoJSON(incidents), [incidents]);
  const civicIssuesSource = useMemo(() => toGeoJSON(civicIssues), [civicIssues]);
  const eventsSource = useMemo(() => toGeoJSON(events), [events]);
  const evHubsSource = useMemo(() => toGeoJSON(evHubs), [evHubs]);
  const trafficSource = useMemo(() => trafficToGeoJSON(traffic), [traffic]);

  const handleFeatureClick = (event) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      const map = mapRef.current?.getMap();
      if (!map) return;

      if (feature.properties?.cluster) {
        const clusterId = feature.properties.cluster_id;
        const source = map.getSource("incidents");
        if (!source) return;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          map.easeTo({
            center: feature.geometry.coordinates,
            zoom: zoom + 1,
          });
        });
      } else {
        onFeatureClick(feature.properties);
      }
    }
  };

  const [isMapReady, setIsMapReady] = React.useState(false);

  // Setup traffic layers
  const setupTraffic = React.useCallback((map) => {
    if (!map) return;
    const shouldShowTraffic = mapMode === "Live";

    if (shouldShowTraffic) {
      try {
        if (!map.getSource("mapbox-traffic")) {
          map.addSource("mapbox-traffic", {
            type: "vector",
            url: "mapbox://mapbox.mapbox-traffic-v1",
          });

          map.addLayer({
            id: "mapbox-traffic-layer",
            type: "line",
            source: "mapbox-traffic",
            "source-layer": "traffic",
            paint: {
              "line-color": [
                "match",
                ["get", "congestion"],
                "low", "#22c55e",
                "moderate", "#facc15",
                "heavy", "#f97316",
                "severe", "#dc2626",
                "rgba(0,0,0,0)",
              ],
              "line-width": [
                "interpolate", ["linear"], ["zoom"],
                6, [
                  "match", ["get", "congestion"],
                  "low", 0.5,
                  "moderate", 1.5,
                  "heavy", 2.5,
                  "severe", 3.5,
                  0.5
                ],
                12, [
                  "match", ["get", "congestion"],
                  "low", 1.5,
                  "moderate", 3,
                  "heavy", 5,
                  "severe", 7,
                  1.5
                ]
              ],
              "line-opacity": [
                "match", ["get", "congestion"],
                "low", 0.4,
                "moderate", 0.8,
                "heavy", 1.0,
                "severe", 1.0,
                0.4
              ],
              "line-blur": [
                "match", ["get", "congestion"],
                "low", 0,
                "moderate", 0.5,
                "heavy", 1.5,
                "severe", 2.5,
                0
              ]
            },
          });
        }
      } catch (err) {
        console.warn("Traffic layer setup error:", err);
      }
    } else {
      try {
        if (map.getLayer("mapbox-traffic-layer")) map.removeLayer("mapbox-traffic-layer");
        if (map.getSource("mapbox-traffic")) map.removeSource("mapbox-traffic");
      } catch (e) {}
    }
  }, [mapMode]);

  // Effect to update Mapbox Vector Traffic Layer
  useEffect(() => {
    if (!isMapReady) return;
    const map = mapRef.current?.getMap();
    setupTraffic(map);
  }, [mapMode, isMapReady, setupTraffic]);

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={handleFeatureClick}
        onLoad={(e) => {
          setIsMapReady(true);
          onMapLoad(mapRef.current);
          setupTraffic(e.target);
        }}
      >
        <GeolocateControl position="bottom-right" />
        <NavigationControl position="bottom-right" />

        {/* Incidents Layer */}
        {activeLayers.has("incidents") && (
          <Source
            id="incidents"
            type="geojson"
            data={incidentsSource}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer
              id="clusters"
              type="circle"
              source="incidents"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": ["step", ["get", "point_count"], "#51bbd6", 100, "#f1f075", 750, "#f28cb1"],
                "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
              }}
            />
            <Layer
              id="unclustered-incidents"
              type="circle"
              source="incidents"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-color": [
                  "match", ["get", "severity"],
                  "Critical", severityColorMap.Critical,
                  "Major", severityColorMap.Major,
                  "Minor", severityColorMap.Minor,
                  severityColorMap.Info
                ],
                "circle-radius": 8,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </Source>
        )}

        {/* Traffic LineString Layer (Manual Data) */}
        {activeLayers.has("traffic") && mapMode === "Live" && (
          <Source id="traffic-manual" type="geojson" data={trafficSource}>
            <Layer
              id="traffic-lines"
              type="line"
              source="traffic-manual"
              paint={{
                "line-width": 4,
                "line-color": [
                  "interpolate", ["linear"], ["get", "congestionLevel"],
                  0, "#22c55e",
                  0.5, "#eab308",
                  1, "#dc2626"
                ],
                "line-opacity": 0.7,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}

export default TrafficMapComponent;
