"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  CHENNAI_CENTER,
  DEFAULT_ZOOM,
  MAP_TILES,
  CONGESTION_STYLES,
  RISK_COLORS,
  TRAFFIC_MARKER,
  EV_MARKER,
  EVENT_MARKER,
  TOLL_MARKER,
  createCategoryIcon,
  createEVIcon,
  createEventIcon,
  createCircleIcon,
} from "@/utils/mapHelpers";
import {
  ComplaintPopup,
  TrafficPopup,
  EVPopup,
  EventPopup,
  RiskPopup,
  TollPopup,
} from "@/components/common/PopupCard";

export default function MapView({
  activeLayers,
  complaints,
  traffic,
  evStations,
  events,
  riskZones,
  tolls,
  layers,
}) {
  return (
    <div className="map-wrapper">
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={DEFAULT_ZOOM}
        className="map-container"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={MAP_TILES.dark.url}
          attribution={MAP_TILES.dark.attribution}
        />

        {/* Traffic Hotspot Layer */}
        {activeLayers.has("traffic") &&
          traffic.map((hotspot) => {
            const style = CONGESTION_STYLES[hotspot.congestion_level] || CONGESTION_STYLES.low;
            return (
              <Circle
                key={`traffic-${hotspot.id}`}
                center={[hotspot.latitude, hotspot.longitude]}
                radius={style.radius}
                pathOptions={{
                  color: style.color,
                  fillColor: style.color,
                  fillOpacity: style.opacity,
                  weight: 2,
                }}
              >
                <Popup>
                  <TrafficPopup data={hotspot} />
                </Popup>
              </Circle>
            );
          })}

        {/* Complaint Layer */}
        {activeLayers.has("complaints") &&
          complaints.map((complaint) => (
            <Marker
              key={`complaint-${complaint.id}`}
              position={[complaint.latitude, complaint.longitude]}
              icon={createCategoryIcon(complaint.category)}
            >
              <Popup>
                <ComplaintPopup data={complaint} />
              </Popup>
            </Marker>
          ))}

        {/* EV Station Layer */}
        {activeLayers.has("ev") &&
          evStations.map((station) => (
            <Marker
              key={`ev-${station.id}`}
              position={[station.latitude, station.longitude]}
              icon={createEVIcon(station.status)}
            >
              <Popup>
                <EVPopup data={station} />
              </Popup>
            </Marker>
          ))}

        {/* Event Layer */}
        {activeLayers.has("events") &&
          events.map((event) => (
            <Marker
              key={`event-${event.id}`}
              position={[event.latitude, event.longitude]}
              icon={createEventIcon(event.crowd_level)}
            >
              <Popup>
                <EventPopup data={event} />
              </Popup>
            </Marker>
          ))}

        {/* Toll Plazas */}
        {activeLayers.has("tolls") &&
          tolls?.map((toll) => {
            if (toll.latitude === null || toll.longitude === null) return null;
            return (
              <Marker
                key={`toll-${toll.plaza_id}`}
                position={[toll.latitude, toll.longitude]}
                icon={TOLL_MARKER}
                zIndexOffset={1000}
              >
                <Popup>
                  <TollPopup data={toll} />
                </Popup>
              </Marker>
            );
          })}

        {/* Risk Zone Layer */}
        {activeLayers.has("risk") &&
          riskZones.map((zone) => (
            <Circle
              key={`risk-${zone.id}`}
              center={[zone.latitude, zone.longitude]}
              radius={1200}
              pathOptions={{
                color: RISK_COLORS[zone.risk_level],
                fillColor: RISK_COLORS[zone.risk_level],
                fillOpacity: 0.15,
                weight: 2,
                dashArray: "5, 10",
              }}
            >
              <Popup>
                <RiskPopup data={zone} />
              </Popup>
            </Circle>
          ))}
      </MapContainer>
    </div>
  );
}
