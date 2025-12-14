import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

// Fix for Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle view changes
const MapViewHandler = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 13);
        }
    }, [center, zoom, map]);
    return null;
};

const MapComponent = ({ onAreaSelected, selectedArea, mapCenter, mapZoom }) => {
    const featureGroupRef = useRef();

    // World polygon coordinates (outer ring)
    const worldCoords = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180]
    ];

    const _onCreate = (e) => {
        const { layer } = e;

        // Remove all other layers to enforce single polygon
        if (featureGroupRef.current) {
            featureGroupRef.current.clearLayers();
            featureGroupRef.current.addLayer(layer);
        }

        const bounds = layer.getBounds();
        const coordinates = {
            ne: bounds.getNorthEast(),
            sw: bounds.getSouthWest()
        };

        onAreaSelected(coordinates);
    };

    const _onEdited = (e) => {
        // Handle edits if needed, getting the first layer
        e.layers.eachLayer(layer => {
            const bounds = layer.getBounds();
            onAreaSelected({
                ne: bounds.getNorthEast(),
                sw: bounds.getSouthWest()
            });
        });
    };

    // Calculate mask polygon if area is selected
    const getMaskPositions = () => {
        if (!selectedArea) return null;

        let hole = [];

        // Check if selectedArea is array (AOI Polygon) or object (Draw Rectangle Bounds)
        if (Array.isArray(selectedArea)) {
            // selectedArea is [{lat, lng}, ...]
            // Leaflet expects [lat, lng] arrays
            hole = selectedArea.map(p => [p.lat, p.lng]);
        } else if (selectedArea.ne && selectedArea.sw) {
            // Legacy Rectangle Bounds from Draw
            hole = [
                [selectedArea.ne.lat, selectedArea.sw.lng], // Top Left
                [selectedArea.ne.lat, selectedArea.ne.lng], // Top Right
                [selectedArea.sw.lat, selectedArea.ne.lng], // Bottom Right
                [selectedArea.sw.lat, selectedArea.sw.lng]  // Bottom Left
            ];
        } else {
            return null;
        }

        return [worldCoords, hole];
    };

    const maskPositions = getMaskPositions();

    // Helper to get positions for the Green AOI Polygon display
    const getAOIPositions = () => {
        if (Array.isArray(selectedArea)) {
            return selectedArea.map(p => [p.lat, p.lng]);
        }
        return null; // Don't verify bounds as polygon, the mask handles the dimming
    };

    const aoiPositions = getAOIPositions();

    return (
        <div className="h-full w-full z-0">
            <MapContainer center={[20, 0]} zoom={2} minZoom={2} scrollWheelZoom={true} className="h-full w-full">
                <MapViewHandler center={mapCenter} zoom={mapZoom} />

                {/* Satellite Tile Layer */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />

                {/* Mask Overlay - Dims the non-selected area */}
                {maskPositions && (
                    <Polygon
                        positions={maskPositions}
                        pathOptions={{
                            color: 'transparent',
                            fillColor: '#000',
                            fillOpacity: 0.7
                        }}
                    />
                )}

                {/* AOI Outline - Show the green border for hardcoded area */}
                {aoiPositions && (
                    <Polygon
                        positions={aoiPositions}
                        pathOptions={{
                            color: '#22c55e',
                            weight: 2,
                            fillOpacity: 0.1
                        }}
                    />
                )}

                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topright"
                        onCreated={_onCreate}
                        onEdited={_onEdited}
                        draw={{
                            rectangle: {
                                shapeOptions: {
                                    color: "#22c55e",
                                    weight: 2,
                                    fillOpacity: 0.1
                                },
                                showArea: false
                            },
                            polyline: false,
                            polygon: false,
                            circle: false,
                            circlemarker: false,
                            marker: false
                        }}
                    />
                </FeatureGroup>
            </MapContainer>
        </div>
    );
};

export default MapComponent;
