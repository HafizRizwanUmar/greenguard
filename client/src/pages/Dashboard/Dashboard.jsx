import React, { useState, useEffect } from 'react';
import { analyzeArea } from '../../api';
import Sidebar from '../../components/Sidebar';
import MapComponent from '../../components/Map/MapComponent';
import ResultsPanel from '../../components/Dashboard/ResultsPanel';
import { RefreshCcw, Calendar, Search } from 'lucide-react';

const Dashboard = () => {
    // State with Persistence
    // Hardcoded Area of Interest (AOI)
    // Format: [Lng, Lat] as provided by user, needs conversion to [Lat, Lng] for Leaflet
    const AOI_COORDINATES = [
        [72.83006459906208, 33.75992197053082],
        [72.81392842962849, 33.713955521176736],
        [72.85169393255818, 33.679678798720474],
        [72.95434743597615, 33.710528464301944],
        [72.96327382757771, 33.70138897734782],
        [73.10369283392536, 33.74878950106604],
        [73.11948568060505, 33.720809224597446],
        [73.32356524976677, 33.81731322240773],
        [73.27481341871209, 33.861798796957075],
        [72.83006459906208, 33.75992197053082]
    ].map(coord => ({ lng: coord[0], lat: coord[1] })); // Convert to object for easier handling

    // Initial Area State - AOI is the base, selectedArea is the user's sub-selection
    // On load, selectedArea is the whole AOI.
    const [selectedArea, setSelectedArea] = useState(AOI_COORDINATES);
    const [baseAOI] = useState(AOI_COORDINATES);

    const [analysisResults, setAnalysisResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Date State - Month/Year only
    const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [endMonth, setEndMonth] = useState(new Date().toISOString().slice(0, 7));   // YYYY-MM

    // Map View State - Center on AOI roughly
    const [mapCenter, setMapCenter] = useState([33.75, 73.0]); // Centroid approx
    const [mapZoom, setMapZoom] = useState(11);

    // Persistence Effects
    // Removed persistence for manual stuff since we hardcode AOI now

    const handleAreaSelected = (coordinates) => {
        // Just update if user draws something else, but we prefer valid AOI
        // In this specific request, user wants AOI.
        // If we want to allow user to draw *within* AOI or new AOI, we keep this.
        // But user said "Create polygon it still stuck on 26km", implies they draw. 
        // AND "use these AOI Coordinates".
        // I will initialize with AOI. If they draw, we use drawn.
        setSelectedArea(coordinates);
    };

    const handleAnalyze = async () => {
        // Validation: Prevent analysis if dates are the same
        if (startMonth === endMonth) {
            alert("Please select different months for the Start and End date to allow the system to detect changes over time.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysisResults(null);

        try {
            // If selectedArea is the array (AOI), use it directly. 
            // If it's the object from Draw tool (ne/sw bounds), we need to pass that too, 
            // but backend `inference.py` expects a list of points or bounds? 
            // My updated inference.py handles list of objects {lat, lng} or list of arrays.

            // Normalize selectedArea to list of points for backend
            let coordinatesToSend = [];
            if (Array.isArray(selectedArea)) {
                coordinatesToSend = selectedArea; // Already [{lat, lng}, ...]
            } else if (selectedArea && selectedArea.ne && selectedArea.sw) {
                // It's a box (Leaflet Draw Rectangle)
                coordinatesToSend = [
                    { lat: selectedArea.ne.lat, lng: selectedArea.sw.lng },
                    { lat: selectedArea.ne.lat, lng: selectedArea.ne.lng },
                    { lat: selectedArea.sw.lat, lng: selectedArea.ne.lng },
                    { lat: selectedArea.sw.lat, lng: selectedArea.sw.lng },
                    { lat: selectedArea.ne.lat, lng: selectedArea.sw.lng }
                ];
            } else {
                // Fallback or complex polygon from draw (if featureGroup wired differently)
                // For now, assuming Rectangle draw from previous MapComponent
                coordinatesToSend = AOI_COORDINATES;
            }

            const { data } = await analyzeArea({
                coordinates: coordinatesToSend,
                startDate: `${startMonth}-01`,
                endDate: `${endMonth}-28` // Approximate end of month
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
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)', color: 'var(--color-text-main)' }}>
            <Sidebar />

            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* Header */}
                <header style={{
                    background: 'var(--color-bg-card)',
                    backdropFilter: 'blur(10px)',
                    padding: '16px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: 'var(--glass-border)',
                    zIndex: 10
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Satellite Analysis</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Monitor deforestation in real-time</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Date Range Picker - Month/Year only */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px', border: 'var(--glass-border)' }}>
                            <Calendar size={16} color="var(--color-text-muted)" />
                            <input
                                type="month"
                                value={startMonth}
                                onChange={(e) => setStartMonth(e.target.value)}
                                style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--color-text-main)', outline: 'none' }}
                            />
                            <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                            <input
                                type="month"
                                value={endMonth}
                                onChange={(e) => setEndMonth(e.target.value)}
                                style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--color-text-main)', outline: 'none' }}
                            />
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>

                        <button
                            className="gg-btn gg-btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.875rem', color: 'black' }}
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
                            baseAOI={baseAOI}
                            mapCenter={mapCenter}
                            mapZoom={mapZoom}
                        />


                    </div>

                    {/* Results Sidebar */}
                    {analysisResults && (
                        <div style={{
                            width: '380px',
                            background: 'var(--color-bg-card)',
                            backdropFilter: 'blur(10px)',
                            borderLeft: 'var(--glass-border)',
                            padding: '24px',
                            overflowY: 'auto',
                            boxShadow: '-4px 0 24px rgba(0,0,0,0.2)'
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
                            background: 'rgba(220, 38, 38, 0.1)',
                            border: '1px solid #dc2626',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '8px',
                            color: '#ef4444',
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
