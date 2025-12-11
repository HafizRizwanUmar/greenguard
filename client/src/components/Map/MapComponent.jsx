import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for Leaflet default icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = (props) => {
    const mapRef = useRef();
    const [mapLayers, setMapLayers] = useState([]);

    const _onCreate = (e) => {
        console.log("Draw Created:", e);
        const { layerType, layer } = e;
        if (layerType === 'rectangle') {
            const bounds = layer.getBounds();
            const coordinates = {
                ne: bounds.getNorthEast(),
                sw: bounds.getSouthWest()
            };
            console.log("Selected Area Coordinates:", coordinates);
            if (props.onAreaSelected) {
                props.onAreaSelected(coordinates);
            }
        }
    };

    const _onEdited = (e) => {
        console.log("Draw Edited:", e);
    };

    const _onDeleted = (e) => {
        console.log("Draw Deleted:", e);
    };

    return (
        <div className="h-full w-full z-0">
            <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} className="h-full w-full" ref={mapRef}>
                {/* Satellite Tile Layer */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />

                <FeatureGroup>
                    <EditControl
                        position="topright"
                        onCreated={_onCreate}
                        onEdited={_onEdited}
                        onDeleted={_onDeleted}
                        draw={{
                            rectangle: {
                                shapeOptions: { color: "#16a34a" },
                                showArea: false // Disable area calculation to avoid type error
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
