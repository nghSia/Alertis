import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "./Map.css";

// Icône rouge pour l'alerte
const alertIcon = L.divIcon({
  className: "custom-marker-alert",
  html: `<div style="
    background-color: #e74c3c;
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #c0392b;
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Icône bleue pour la patrouille
const patrolIcon = L.divIcon({
  className: "custom-marker-patrol",
  html: `<div style="
    background-color: #3498db;
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #2980b9;
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

type MapProps = {
  customerLocalisation: {
    latitude: number;
    longitude: number;
  };
  patrolLocalisation?: {
    latitude: number;
    longitude: number;
  };
};

export function MapComponent({
  customerLocalisation,
  patrolLocalisation,
}: MapProps) {
  return (
    <MapContainer
      center={[customerLocalisation.latitude, customerLocalisation.longitude]}
      zoom={13}
      scrollWheelZoom={true}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[
          customerLocalisation.latitude,
          customerLocalisation.longitude,
        ]}
        icon={alertIcon}
      >
        <Popup>Localisation du client</Popup>
      </Marker>
      {patrolLocalisation && (
        <Marker
          position={[patrolLocalisation.latitude, patrolLocalisation.longitude]}
          icon={patrolIcon}
        >
          <Popup>Localisation de la patrouille</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
