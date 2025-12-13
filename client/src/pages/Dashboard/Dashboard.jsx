import React, { useState, useEffect } from 'react';
import { analyzeArea } from '../../api';
import Sidebar from '../../components/Sidebar';
import MapComponent from '../../components/Map/MapComponent';
import ResultsPanel from '../../components/Dashboard/ResultsPanel';
import { RefreshCcw, Calendar, Search } from 'lucide-react';

const Dashboard = () => {
    // State with Persistence
    const [selectedArea, setSelectedArea] = useState(() => {
        const saved = localStorage.getItem('gg_selectedArea');
        return saved ? JSON.parse(saved) : null;
    });

    const [analysisResults, setAnalysisResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Date State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Manual Focus State
    const [manualLat, setManualLat] = useState(() => localStorage.getItem('gg_manualLat') || '');
    const [manualLng, setManualLng] = useState(() => localStorage.getItem('gg_manualLng') || '');
    const [manualRadius, setManualRadius] = useState(() => localStorage.getItem('gg_manualRadius') || '');

    // Map View State
    const [mapCenter, setMapCenter] = useState(() => {
        const saved = localStorage.getItem('gg_mapCenter');
        return saved ? JSON.parse(saved) : null;
    });
    const [mapZoom, setMapZoom] = useState(() => {
        const saved = localStorage.getItem('gg_mapZoom');
        return saved ? parseInt(saved) : null;
    });

    // Persistence Effects
    useEffect(() => {
        if (selectedArea) localStorage.setItem('gg_selectedArea', JSON.stringify(selectedArea));
    }, [selectedArea]);

    useEffect(() => {
        localStorage.setItem('gg_manualLat', manualLat);
        localStorage.setItem('gg_manualLng', manualLng);
        localStorage.setItem('gg_manualRadius', manualRadius);
    }, [manualLat, manualLng, manualRadius]);

    useEffect(() => {
        if (mapCenter) localStorage.setItem('gg_mapCenter', JSON.stringify(mapCenter));
        if (mapZoom) localStorage.setItem('gg_mapZoom', mapZoom.toString());
    }, [mapCenter, mapZoom]);

    const handleAreaSelected = (coordinates) => {
        setSelectedArea(coordinates);
        // Calculate center for display if needed
        const centerLat = (coordinates.ne.lat + coordinates.sw.lat) / 2;
        const centerLng = (coordinates.ne.lng + coordinates.sw.lng) / 2;
        // setMapCenter([centerLat, centerLng]); 
        // We might not want to auto-center on draw as it disrupts the user's flow, 
        // but we definitely want to persist the current view if they move it.
        // Actually, let's trust the MapComponent to report its move end if we wired it up, 
        // but for now, just saving the selected area is enough.
        // If we want to restore exact view, we need onMoveEnd from map.
        // For this task, persisting focus region (selectedArea) is key.
    };

    const handleManualFocus = () => {
        if (!manualLat || !manualLng || !manualRadius) {
            alert("Please enter Latitude, Longitude, and Radius.");
            return;
        }

        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        const rad = parseFloat(manualRadius);

        // Approximate 1 deg = 111km
        const dLat = rad / 111;
        const dLng = rad / (111 * Math.cos(lat * (Math.PI / 180)));

        const ne = { lat: lat + dLat, lng: lng + dLng };
        const sw = { lat: lat - dLat, lng: lng - dLng };

        const newArea = { ne, sw };

        setSelectedArea(newArea);
        setMapCenter([lat, lng]);
        setMapZoom(13); // Zoom level appropriate for the radius? varying logic could apply
    };

    const handleAnalyze = async () => {
        if (!selectedArea) {
            alert("Please select an area on the map via drawing or manual coordinates.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysisResults(null); // Reset previous results

        try {
            const { data } = await analyzeArea({
                coordinates: selectedArea,
                startDate: startDate,
                endDate: endDate
            });

            if (data.status === 'success') {
                setAnalysisResults(data);
            } else {
                setError(data.message || "Analysis failed");
            }
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
            <Sidebar />

            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* Header */}
                <header style={{
                    background: 'var(--color-bg-card)',
                    padding: '16px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    zIndex: 10
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Satellite Analysis</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Monitor deforestation in real-time</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Date Range Picker */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <Calendar size={16} color="var(--color-text-muted)" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ border: 'none', fontSize: '0.875rem', color: '#64748b', outline: 'none' }}
                            />
                            <span style={{ color: '#cbd5e1' }}>-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ border: 'none', fontSize: '0.875rem', color: '#64748b', outline: 'none' }}
                            />
                        </div>

                        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>

                        <button
                            className="gg-btn gg-btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                            onClick={handleAnalyze}
                            disabled={loading}
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                            <span>{loading ? "Analyzing..." : "Run Analysis"}</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
                    {/* Map Section */}
                    <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                        <MapComponent
                            onAreaSelected={handleAreaSelected}
                            selectedArea={selectedArea}
                            mapCenter={mapCenter}
                            mapZoom={mapZoom}
                        />

                        {/* Floating Region Selector Card */}
                        <div className="gg-glass-panel" style={{
                            position: 'absolute',
                            top: '24px',
                            left: '24px',
                            zIndex: 1000,
                            padding: '20px',
                            borderRadius: '16px',
                            maxWidth: '320px',
                            background: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Region Focus</h3>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <span style={{ height: '8px', width: '8px', background: selectedArea ? '#22c55e' : '#cbd5e1', borderRadius: '50%', display: 'inline-block' }}></span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedArea ? '#22c55e' : '#64748b' }}>
                                        {selectedArea ? "Focused" : "No Focus"}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="number"
                                        placeholder="Lat"
                                        value={manualLat}
                                        onChange={(e) => setManualLat(e.target.value)}
                                        className="gg-input"
                                        style={{ width: '50%' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Lng"
                                        value={manualLng}
                                        onChange={(e) => setManualLng(e.target.value)}
                                        className="gg-input"
                                        style={{ width: '50%' }}
                                    />
                                </div>
                                <input
                                    type="number"
                                    placeholder="Radius (km)"
                                    value={manualRadius}
                                    onChange={(e) => setManualRadius(e.target.value)}
                                    className="gg-input"
                                />
                                <button
                                    onClick={handleManualFocus}
                                    className="gg-btn"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        marginTop: '4px'
                                    }}
                                >
                                    <Search size={14} />
                                    <span>Set Focus Region</span>
                                </button>
                            </div>

                            <p style={{ margin: '12px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                Enter coordinates or use the Draw tool on the map to select a region.
                            </p>
                        </div>
                    </div>

                    {/* Results Sidebar */}
                    {analysisResults && (
                        <div style={{
                            width: '380px',
                            background: 'var(--color-bg-card)',
                            borderLeft: '1px solid rgba(0,0,0,0.05)',
                            padding: '24px',
                            overflowY: 'auto',
                            boxShadow: '-4px 0 24px rgba(0,0,0,0.02)'
                        }}>
                            <ResultsPanel data={analysisResults} />
                        </div>
                    )}
                    {error && (
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '400px', // Left of sidebar
                            zIndex: 1000,
                            padding: '12px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
