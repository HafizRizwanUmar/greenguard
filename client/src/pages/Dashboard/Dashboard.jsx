import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyzeArea } from '../../api';
import Sidebar from '../../components/Sidebar';
import MapComponent from '../../components/Map/MapComponent';
import ResultsPanel from '../../components/Dashboard/ResultsPanel';
import { RefreshCcw, XCircle, Calendar } from 'lucide-react';

const Dashboard = () => {
    const location = useLocation();

    // --- State: Area ---
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
    ].map(coord => ({ lng: coord[0], lat: coord[1] }));

    const [selectedArea, setSelectedArea] = useState(AOI_COORDINATES);
    const [baseAOI] = useState(AOI_COORDINATES);
    const [mapCenter, setMapCenter] = useState([33.75, 73.0]);
    const [mapZoom, setMapZoom] = useState(11);

    // --- State: Data & UI ---
    const [analysisResults, setAnalysisResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    // --- State: Date Selection (Strict 6-month intervals) ---
    // Years: 2017 - 2025
    const availableYears = Array.from({ length: 9 }, (_, i) => 2017 + i);
    const [startYear, setStartYear] = useState(2020);
    const [startPeriod, setStartPeriod] = useState('jan-jun'); // 'jan-jun' or 'jul-dec'

    const [endYear, setEndYear] = useState(2023);
    const [endPeriod, setEndPeriod] = useState('jul-dec');

    useEffect(() => {
        if (location.state && location.state.coordinates) {
            setSelectedArea(location.state.coordinates);
            if (location.state.coordinates.ne && location.state.coordinates.sw) {
                const lat = (location.state.coordinates.ne.lat + location.state.coordinates.sw.lat) / 2;
                const lng = (location.state.coordinates.ne.lng + location.state.coordinates.sw.lng) / 2;
                setMapCenter([lat, lng]);
                setMapZoom(13);
            }
        }
    }, [location.state]);

    const handleAreaSelected = (coordinates) => {
        setSelectedArea(coordinates);
    };

    const handleCancelAnalysis = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setLoading(false);
            setError("Analysis cancelled by user.");
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setAnalysisResults(null);

        abortControllerRef.current = new AbortController();

        // Calculate strict start/end dates
        // Calculate Date Range 1 (Start)
        const startMonth1 = startPeriod === 'jan-jun' ? '01' : '07';
        const startDate1 = `${startYear}-${startMonth1}-01`;
        const endDate1 = startPeriod === 'jan-jun' ? `${startYear}-06-30` : `${startYear}-12-31`;

        // Calculate Date Range 2 (End)
        const startMonth2 = endPeriod === 'jan-jun' ? '01' : '07';
        const startDate2 = `${endYear}-${startMonth2}-01`;
        const endDate2 = endPeriod === 'jan-jun' ? `${endYear}-06-30` : `${endYear}-12-31`;

        console.log(`Analyzing comparison: ${startDate1} - ${endDate1} VS ${startDate2} - ${endDate2}`);

        try {
            let coordinatesToSend = [];
            if (Array.isArray(selectedArea)) {
                coordinatesToSend = selectedArea;
            } else if (selectedArea && selectedArea.ne && selectedArea.sw) {
                coordinatesToSend = [
                    { lat: selectedArea.ne.lat, lng: selectedArea.sw.lng },
                    { lat: selectedArea.ne.lat, lng: selectedArea.ne.lng },
                    { lat: selectedArea.sw.lat, lng: selectedArea.ne.lng },
                    { lat: selectedArea.sw.lat, lng: selectedArea.sw.lng },
                    { lat: selectedArea.ne.lat, lng: selectedArea.sw.lng }
                ];
            } else {
                coordinatesToSend = AOI_COORDINATES;
            }

            const { data } = await analyzeArea({
                coordinates: coordinatesToSend,
                range1: {
                    startDate: startDate1,
                    endDate: endDate1
                },
                range2: {
                    startDate: startDate2,
                    endDate: endDate2
                }
            });

            if (!abortControllerRef.current) return;

            if (data.status === 'success') {
                setAnalysisResults(data);
            } else {
                setError(data.message || "Analysis failed");
            }
        } catch (err) {
            if (err.name === 'CanceledError' || !abortControllerRef.current) {
                console.log('Request canceled');
            } else {
                console.error(err);
                setError("Analysis failed. Please try again.");
            }
        } finally {
            if (abortControllerRef.current) {
                setLoading(false);
                abortControllerRef.current = null;
            }
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                        {/* 6-Month Interval Selection */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>

                            {/* Start Date Group */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Start Date</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                        <Calendar size={14} className="text-gray-500" />
                                        <select
                                            value={startYear}
                                            onChange={(e) => setStartYear(parseInt(e.target.value))}
                                            className="bg-transparent border-none outline-none font-medium text-sm text-gray-800 cursor-pointer hover:text-green-600 transition-colors"
                                        >
                                            {availableYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                        <select
                                            value={startPeriod}
                                            onChange={(e) => setStartPeriod(e.target.value)}
                                            className="bg-transparent border-none outline-none font-medium text-sm text-gray-800 cursor-pointer hover:text-green-600 transition-colors"
                                        >
                                            <option value="jan-jun">Jan-Jun</option>
                                            <option value="jul-dec">Jul-Dec</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }}></div>

                            {/* End Date Group */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>End Date</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                        <Calendar size={14} className="text-gray-500" />
                                        <select
                                            value={endYear}
                                            onChange={(e) => setEndYear(parseInt(e.target.value))}
                                            className="bg-transparent border-none outline-none font-medium text-sm text-gray-800 cursor-pointer hover:text-green-600 transition-colors"
                                        >
                                            {availableYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                        <select
                                            value={endPeriod}
                                            onChange={(e) => setEndPeriod(e.target.value)}
                                            className="bg-transparent border-none outline-none font-medium text-sm text-gray-800 cursor-pointer hover:text-green-600 transition-colors"
                                        >
                                            <option value="jan-jun">Jan-Jun</option>
                                            <option value="jul-dec">Jul-Dec</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>

                        {loading ? (
                            <button
                                className="gg-btn"
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '0.9rem',
                                    color: '#ef4444',
                                    background: '#fef2f2',
                                    border: '1px solid #fee2e2'
                                }}
                                onClick={handleCancelAnalysis}
                            >
                                <XCircle size={18} />
                                <span>Cancel</span>
                            </button>
                        ) : (
                            <button
                                className="gg-btn gg-btn-primary"
                                style={{ padding: '10px 20px', fontSize: '0.9rem', color: 'black' }}
                                onClick={handleAnalyze}
                            >
                                <RefreshCcw size={18} />
                                <span>Run Analysis</span>
                            </button>
                        )}
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
                            background: '#fef2f2',
                            border: '1px solid #ef4444',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
